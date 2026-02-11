package internal

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

// example
func ExampleAPIMethod(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, "ping")
}
