package api

import (
	"net/http"
	"github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/models"
)

// example
func ExampleAPIMethod(c *gin.Context) {
	ping := models.NewPing() // returns a pointer, not the struct
	db.DB.Create(ping)

	c.IndentedJSON(http.StatusOK, "ping")
}
