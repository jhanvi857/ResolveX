package models

type Hop struct {
	Server string `json:"Server"`
	Time   int    `json:"time"`
}
type DnsResponse struct {
	Domain   string `json:"domain"`
	Ip       string `json:"ip"`
	CacheHit bool   `json:"cacheHit"`
	Hops     []Hop  `json:"hops"`
	Latency  int    `json:"Latency"`
}
