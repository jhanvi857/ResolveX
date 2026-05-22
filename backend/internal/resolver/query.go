package resolver

import (
	"github.com/miekg/dns"
)

func Query(domain string) (*dns.Msg, error) {
	m := new(dns.Msg)
	m.SetQuestion(dns.Fqdn(domain), dns.TypeA)
	c := new(dns.Client)
	resp, _, err := c.Exchange(
		m,
		"8.8.8.8:53",
	)

	return resp, err
}
