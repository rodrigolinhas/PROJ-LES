package api

import (
	db "LES/server/internal/database"

	"github.com/gin-gonic/gin"
)

func SetTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode) // configures gin for test mode

	db.ConnectDB()

	router := gin.Default() // creates a fake router for testing
	router.GET("/ping", ExampleAPIMethod)
	router.POST("/user/register", UserRegister)
	router.POST("/user/login", UserLogin)
	router.POST("/user/logout", UserLogout)

	return router
}
