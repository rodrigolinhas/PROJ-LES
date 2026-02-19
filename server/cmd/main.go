package main

import (
	"fmt"
    "github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/api"
)

func main() {
	db.ConnectDB()
	fmt.Println("Database Connected")

    router := gin.Default()
    setEndpoints(router)
    router.Run()
}

func setEndpoints(router *gin.Engine) {
	//example endpoint
	router.GET("/ping", api.ExampleAPIMethod)
}
