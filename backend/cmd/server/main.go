package main

import (
	"log"
	"os"
	"time"

	"dns-resolver/internal/api"
	"dns-resolver/internal/cache"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	resolverCache := cache.NewCache()
	resolverCache.StartCleanup(5 * time.Minute)

	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/api/resolve", api.ResolveHandler(resolverCache))
	router.GET("/api/cache", api.CacheHandler(resolverCache))

	address := os.Getenv("DNS_RESOLVER_ADDR")
	if address == "" {
		address = ":8080"
	}

	if err := router.Run(address); err != nil {
		log.Fatal(err)
	}
}
