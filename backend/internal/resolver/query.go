package resolver

import (
	"fmt"
	"net"
	"strings"

	"github.com/miekg/dns"
)

func Query(domain string, server string, queryType uint16) (*dns.Msg, error) {
	if server == "" {
		return nil, fmt.Errorf("missing DNS server")
	}

	m := new(dns.Msg)
	m.SetQuestion(dns.Fqdn(domain), queryType)
	c := new(dns.Client)
	serverAddr := normalizeServer(server)
	resp, _, err := c.Exchange(
		m,
		serverAddr,
	)

	return resp, err
}

func normalizeServer(server string) string {
	if _, _, err := net.SplitHostPort(server); err == nil {
		return server
	}

	if strings.HasPrefix(server, "[") && strings.Contains(server, "]") {
		return server
	}

	return net.JoinHostPort(server, "53")
}
