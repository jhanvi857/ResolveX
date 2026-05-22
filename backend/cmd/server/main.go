package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	r := gin.Default()

	r.Use(cors.Default())

	r.GET(
		"/resolve", func(c *gin.Context) {
			c.JSON(http.StatusNotImplemented, gin.H{"response": "Hello from /resolve endpoint! This endpoint is not implemented yet."})
		},
	)

	r.Run(":8080")
}
