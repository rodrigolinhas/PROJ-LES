package main

import (
	"fmt"

	"github.com/gin-contrib/cors"
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

// @tag.name User
// @tag.description Endpoints related with user account management

// @tag.name Auth
// @tag.description Endpoints related with user authentication

// @host localhost:8080
// @BasePath /
func main() {
	api.InitGoogleAuth()
	db.ConnectDB()
	fmt.Println("Database Connected")

	docs.SwaggerInfo.BasePath = "/"

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))
	setEndpoints(router)
	router.Run()
}

func setEndpoints(router *gin.Engine) {
	//example endpoint
	router.GET("/ping", api.ExampleAPIMethod)

	//auth
	router.POST("/user/register", api.UserRegister)
	router.POST("/user/login", api.UserLogin)
	router.POST("/user/logout", api.UserLogout)

	//google oauth
	router.GET("/auth/google", api.GoogleAuthBegin)
	router.GET("/auth/google/callback", api.GoogleAuthCallback)

	// swagger handler
	router.GET("/docs/*any", ginSwagger.WrapHandler(swagfiles.Handler))
}
