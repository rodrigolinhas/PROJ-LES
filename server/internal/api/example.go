package api

import (
	"net/http"
	"github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/models"
)

// PingExample godoc
// @Summary 	Example ping endpoint
// @Description Return "ping" and log the time in the DB
// @Tags 		Dev
// @Produce 	json
// @Success 	200 {string} string
// @Router 		/ping [get]
func ExampleAPIMethod(c *gin.Context) {
	ping := models.NewPing() // returns a pointer, not the struct
	db.DB.Create(ping)

	c.IndentedJSON(http.StatusOK, "ping")
}
