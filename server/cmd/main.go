package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	swagfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"LES/server/docs"
	"LES/server/internal/api"
	db "LES/server/internal/database"
)

// @title Scientific Event Manager API
// @version 0.1
// @description Local Scientific Event Manager System

// @tag.name Dev
// @tag.description Endpoints only available for development purposes

// @host localhost:8080
// @BasePath /
func main() {
	db.ConnectDB()
	fmt.Println("Database Connected")

	docs.SwaggerInfo.BasePath = "/"

	router := gin.Default()
	setEndpoints(router)
	router.Run()
}

func setEndpoints(router *gin.Engine) {
	//example endpoint
	router.GET("/ping", api.ExampleAPIMethod)

	// swagger handler
	router.GET("/docs/*any", ginSwagger.WrapHandler(swagfiles.Handler))
}
