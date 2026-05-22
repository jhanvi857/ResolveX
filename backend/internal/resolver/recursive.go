package resolver

import (
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/miekg/dns"

	"dns-resolver/internal/cache"
	"dns-resolver/internal/constants"
	"dns-resolver/internal/models"
)

var hostPattern = regexp.MustCompile(`(?i)(?:https?://)?((?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+)`)

func Resolve(domain string, server string, queryType uint16, c *cache.Cache) (models.DnsResponse, error) {
	for _, candidate := range normalizeDomainCandidates(domain) {
		start := time.Now()
		if ip, ttl, found := c.Get(candidate); found {
			return models.DnsResponse{
				Domain:    candidate,
				Server:    server,
				QueryType: dns.TypeToString[queryType],
				Ip:        ip,
				CacheHit:  true,
				Latency:   int(time.Since(start).Milliseconds()),
				Ttl:       ttl,
				Hops: []models.Hop{
					{Server: "CACHE", Time: 0},
				},
			}, nil
		}

		var hops []models.Hop
		currentDomain := candidate
		currentServers := constants.RootServers
		if server != "" {
			currentServers = []string{server}
		}
		// infinite loop until domain is resolved.
		for {
			var nextServers []string
			for _, server := range currentServers {
				hopStart := time.Now()
				ip, recordTTL, ns, cnameTarget, final, err := queryDNS(server, currentDomain, queryType)
				hopTime := int(time.Since(hopStart).Milliseconds())
				hops = append(hops, models.Hop{
					Server: server,
					Time:   hopTime,
				})
				if err != nil {
					continue
				}
				if final {
					if recordTTL <= 0 {
						recordTTL = 300
					}

					c.Set(candidate, ip, dns.TypeToString[queryType], time.Duration(recordTTL)*time.Second)
					return models.DnsResponse{
						Domain:    candidate,
						Server:    server,
						QueryType: dns.TypeToString[queryType],
						Ip:        ip,
						CacheHit:  false,
						Latency:   int(time.Since(start).Milliseconds()),
						Ttl:       recordTTL,
						Hops:      hops,
					}, nil
				}
				if cnameTarget != "" {
					currentDomain = cnameTarget
					nextServers = constants.RootServers
					break
				}
				nextServers = ns
				break
			}
			if len(nextServers) == 0 {
				break
			}
			currentServers = nextServers
		}
	}

	return models.DnsResponse{}, fmt.Errorf("no DNS answer could be resolved for %s", strings.TrimSpace(domain))
}

func queryDNS(server string, domain string, queryType uint16) (string, int, []string, string, bool, error) {
	resp, err := Query(domain, server, queryType)
	if err != nil {
		return "", 0, nil, "", false, err
	}

	value, ttl := ExtractValueAndTTL(resp, queryType)
	if value != "" {
		return value, int(ttl), nil, "", true, nil
	}

	cnameTarget := ExtractCNAMETarget(resp)

	var nextNS []string
	for _, ns := range resp.Ns {
		if n, ok := ns.(*dns.NS); ok {
			nextNS = append(nextNS, n.Ns)
		}
	}
	for _, extra := range resp.Extra {
		if a, ok := extra.(*dns.A); ok {
			nextNS = append(nextNS, a.A.String())
		}
		if aaaa, ok := extra.(*dns.AAAA); ok {
			nextNS = append(nextNS, aaaa.AAAA.String())
		}
	}
	return "", 0, nextNS, cnameTarget, false, nil
}

func normalizeDomain(domain string) string {
	candidates := normalizeDomainCandidates(domain)
	if len(candidates) == 0 {
		return ""
	}
	return candidates[0]
}

func normalizeDomainCandidates(domain string) []string {
	domain = strings.TrimSpace(domain)
	if domain == "" {
		return nil
	}

	var candidates []string
	seen := make(map[string]struct{})
	addCandidate := func(value string) {
		value = strings.TrimSuffix(strings.TrimSpace(value), ".")
		if value == "" {
			return
		}
		if _, ok := seen[value]; ok {
			return
		}
		seen[value] = struct{}{}
		candidates = append(candidates, value)
	}

	if match := hostPattern.FindStringSubmatch(domain); len(match) > 1 {
		addCandidate(match[1])
		if strings.HasPrefix(match[1], "www.") {
			addCandidate(strings.TrimPrefix(match[1], "www."))
		}
		return candidates
	}

	for _, candidate := range []string{domain, "https://" + domain} {
		parsed, err := url.Parse(candidate)
		if err != nil {
			continue
		}

		hostname := strings.TrimSuffix(parsed.Hostname(), ".")
		if hostname != "" {
			addCandidate(hostname)
			if strings.HasPrefix(hostname, "www.") {
				addCandidate(strings.TrimPrefix(hostname, "www."))
			}
			return candidates
		}
	}

	domain = strings.TrimSuffix(domain, "/")
	if slash := strings.IndexAny(domain, "/?#"); slash >= 0 {
		domain = domain[:slash]
	}
	addCandidate(domain)
	if strings.HasPrefix(domain, "www.") {
		addCandidate(strings.TrimPrefix(domain, "www."))
	}
	return candidates
}
