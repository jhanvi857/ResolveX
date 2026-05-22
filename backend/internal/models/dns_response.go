package models

type Hop struct {
	Server string `json:"server"`
	Time   int    `json:"time"`
}
type DnsResponse struct {
	Domain    string `json:"domain"`
	Server    string `json:"server"`
	QueryType string `json:"queryType"`
	Ip        string `json:"ip"`
	CacheHit  bool   `json:"cacheHit"`
	Hops      []Hop  `json:"hops"`
	Latency   int    `json:"latency"`
	Ttl       int    `json:"ttl"`
}
