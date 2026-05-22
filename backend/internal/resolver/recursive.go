package resolver

import (
	"time"

	"github.com/miekg/dns"

	"dns-resolver/internal/cache"
	"dns-resolver/internal/constants"
	"dns-resolver/internal/models"
)

func Resolve(domain string, c *cache.Cache) (models.DnsResponse, error) {

	start := time.Now()
	if ip, found := c.Get(domain); found {
		return models.DnsResponse{
			Domain:   domain,
			Ip:       ip,
			CacheHit: true,
			Latency:  int(time.Since(start).Milliseconds()),
			Hops: []models.Hop{
				{Server: "CACHE", Time: 0},
			},
		}, nil
	}

	var hops []models.Hop
	currentServers := constants.RootServers
	// infinite loop until domain is resolved.
	for {
		var nextServers []string
		for _, server := range currentServers {
			hopStart := time.Now()
			ip, ns, final := queryDNS(server, domain)
			hopTime := int(time.Since(hopStart).Milliseconds())
			hops = append(hops, models.Hop{
				Server: server,
				Time:   hopTime,
			})
			if final {
				c.Set(domain, ip, 5*time.Minute)
				return models.DnsResponse{
					Domain:   domain,
					Ip:       ip,
					CacheHit: false,
					Latency:  int(time.Since(start).Milliseconds()),
					Hops:     hops,
				}, nil
			}
			nextServers = ns
			break
		}
		currentServers = nextServers
	}
}
func queryDNS(server string, domain string) (string, []string, bool) {
	m := new(dns.Msg)
	m.SetQuestion(dns.Fqdn(domain), dns.TypeA)
	c := new(dns.Client)

	resp, _, err := c.Exchange(m, server+":53")
	if err != nil {
		return "", nil, false
	}

	for _, ans := range resp.Answer {
		if a, ok := ans.(*dns.A); ok {
			return a.A.String(), nil, true
		}
	}
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
	}
	return "", nextNS, false
}
