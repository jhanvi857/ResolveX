package cache

import (
	"sync"
	"time"
)

type CacheEntry struct {
	Ip   string
	Time time.Time
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
func (c *Cache) Set(domain string, ip string, ttl time.Duration) {

	c.mu.Lock()
	defer c.mu.Unlock()

	c.data[domain] = CacheEntry{
		Ip:   ip,
		Time: time.Now().Add(ttl),
	}
}

func (c *Cache) Get(domain string) (string, bool) {

	c.mu.RLock()
	entry, exists := c.data[domain]
	c.mu.RUnlock()

	if !exists {
		return "", false
	}

	if time.Now().After(entry.Time) {
		c.mu.Lock()
		delete(c.data, domain)
		c.mu.Unlock()
		return "", false
	}
	return entry.Ip, true
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
