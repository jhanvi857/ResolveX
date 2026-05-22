package main

import (
	"dns-resolver/internal/api"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	r := gin.Default()

	r.Use(cors.Default())

	r.GET(
		"/resolve", api.ResolveHandler,
	)

	r.Run(":8080")
}
