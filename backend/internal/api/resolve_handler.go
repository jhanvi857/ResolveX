package api

import (
	"net/http"
	"strconv"
	"strings"

	"dns-resolver/internal/cache"
	"dns-resolver/internal/resolver"

	"github.com/gin-gonic/gin"
	"github.com/miekg/dns"
)

func ResolveHandler(cacheStore *cache.Cache) gin.HandlerFunc {
	return func(c *gin.Context) {
		domain := strings.TrimSpace(c.Query("domain"))
		if domain == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "domain query parameter is required"})
			return
		}

		server := strings.TrimSpace(c.Query("server"))
		queryType := parseQueryType(c.Query("type"))

		response, err := resolver.Resolve(domain, server, queryType, cacheStore)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, response)
	}
}

func CacheHandler(cacheStore *cache.Cache) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, cacheStore.Snapshot())
	}
}

func parseQueryType(value string) uint16 {
	switch strings.ToUpper(strings.TrimSpace(value)) {
	case "AAAA":
		return dns.TypeAAAA
	case "MX":
		return dns.TypeMX
	case "A":
		return dns.TypeA
	}

	if numeric, err := strconv.Atoi(strings.TrimSpace(value)); err == nil {
		return uint16(numeric)
	}

	return dns.TypeA
}
