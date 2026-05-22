package resolver

import (
	"strings"

	"github.com/miekg/dns"
)

func ExtractValueAndTTL(msg *dns.Msg, queryType uint16) (string, uint32) {
	for _, ans := range msg.Answer {
		switch queryType {
		case dns.TypeAAAA:
			if record, ok := ans.(*dns.AAAA); ok {
				return record.AAAA.String(), record.Hdr.Ttl
			}
		case dns.TypeMX:
			if record, ok := ans.(*dns.MX); ok {
				return record.Mx, record.Hdr.Ttl
			}
		default:
			if record, ok := ans.(*dns.A); ok {
				return record.A.String(), record.Hdr.Ttl
			}
		}
	}

	return "", 0
}

func ExtractCNAMETarget(msg *dns.Msg) string {
	for _, ans := range msg.Answer {
		if record, ok := ans.(*dns.CNAME); ok {
			return strings.TrimSuffix(record.Target, ".")
		}
	}

	return ""
}
