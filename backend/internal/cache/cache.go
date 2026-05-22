package cache

import (
	"sync"
	"time"
)

type CacheEntry struct {
	Ip   string
	Type string
	Time time.Time
	Ttl  time.Duration
}
type Cache struct {
	data map[string]CacheEntry
	mu   sync.RWMutex
}

func NewCache() *Cache {
	return &Cache{
		data: make(map[string]CacheEntry),
	}
}
func (c *Cache) Set(domain string, ip string, recordType string, ttl time.Duration) {

	c.mu.Lock()
	defer c.mu.Unlock()

	c.data[domain] = CacheEntry{
		Ip:   ip,
		Type: recordType,
		Time: time.Now().Add(ttl),
		Ttl:  ttl,
	}
}

func (c *Cache) Get(domain string) (string, int, bool) {

	c.mu.RLock()
	entry, exists := c.data[domain]
	c.mu.RUnlock()

	if !exists {
		return "", 0, false
	}

	if time.Now().After(entry.Time) {
		c.mu.Lock()
		delete(c.data, domain)
		c.mu.Unlock()
		return "", 0, false
	}

	remaining := int(time.Until(entry.Time).Seconds())
	if remaining < 0 {
		remaining = 0
	}

	return entry.Ip, remaining, true
}
func (c *Cache) Delete(domain string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.data, domain)
}
func (c *Cache) StartCleanup(interval time.Duration) {
	// timer to periodically clean up expired entries.
	ticker := time.NewTicker(interval)
	// go keyword before func : goroutine for non blocking cleanup.
	go func() {
		for range ticker.C {
			c.mu.Lock()
			for domain, entry := range c.data {
				if time.Now().After(entry.Time) {
					delete(c.data, domain)
				}
			}
			c.mu.Unlock()
		}
		// () : imidiately calling go func().
	}()
}

type SnapshotEntry struct {
	Domain    string `json:"domain"`
	Ip        string `json:"ip"`
	Type      string `json:"type"`
	Ttl       int    `json:"ttl"`
	MaxTtl    int    `json:"maxTtl"`
	Size      string `json:"size"`
	ExpiresIn int    `json:"expiresIn"`
}

func (c *Cache) Snapshot() []SnapshotEntry {
	c.mu.RLock()
	defer c.mu.RUnlock()

	entries := make([]SnapshotEntry, 0, len(c.data))
	for domain, entry := range c.data {
		expiresIn := int(time.Until(entry.Time).Seconds())
		if expiresIn < 0 {
			expiresIn = 0
		}

		maxTtl := int(entry.Ttl.Seconds())
		if maxTtl <= 0 {
			maxTtl = 1
		}

		entries = append(entries, SnapshotEntry{
			Domain:    domain,
			Ip:        entry.Ip,
			Type:      entry.Type,
			Ttl:       expiresIn,
			MaxTtl:    maxTtl,
			Size:      "live",
			ExpiresIn: expiresIn,
		})
	}

	return entries
}
