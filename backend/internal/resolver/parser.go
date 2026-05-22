package resolver

import "github.com/miekg/dns"

func ExtractIp(Msg *dns.Msg) string {
	for _, ans := range Msg.Answer {
		if record, ok := ans.(*dns.A); ok {
			return record.A.String()
		}
	}
	return ""
}
