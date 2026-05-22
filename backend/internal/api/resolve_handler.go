package api

import (
	"dns-resolver/internal/models"

	"github.com/gin-gonic/gin"
)

func ResolveHandler(c *gin.Context) {
	response := models.DnsResponse{
		Domain:   "google.com",
		Ip:       "142.250.191.14.",
		CacheHit: false,
		Latency:  42,
	}
	c.JSON(200, response)
}
