package main

import (
    "github.com/gin-gonic/gin"

	"LES/server/internal/api"
)

func main() {
    router := gin.Default()
    setEndpoints(router)
    router.Run()
}

func setEndpoints(router *gin.Engine) {
	//example endpoint
	router.GET("/ping", api.ExampleAPIMethod)
}
