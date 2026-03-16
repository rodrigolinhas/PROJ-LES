package api

import (
	db "LES/server/internal/database"
	"LES/server/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UserInfoView
// @Summary     View user account information
// @Description Returns the authenticated user's information
// @Tags        User
// @Produce     json
// @Param       email formData string true "User email"
// @Param       X-CSRF-Token header string true "CSRF Token"
// @Success     200 {object} map[string]string
// @Failure     401 {string} string "Unauthorized"
// @Router      /user/account/info [get]
func UserInfoView(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"email":     user.Email,
		"role":      user.Role,
	})
}

// UserInfoEdit
// @Summary     Edit user account information
// @Description Updates authenticated user's information
// @Tags        User
// @Accept      mpfd
// @Produce     plain
// @Param       email formData string false "New email"
// @Param       firstName formData string false "New first name"
// @Param       lastName formData string false "New last name"
// @Param       password formData string false "New password (must be at least 8 characters)"
// @Param       X-CSRF-Token header string true "CSRF Token"
// @Success     200 {string} string "User info updated successfully"
// @Failure     400 {string} string "Invalid input"
// @Failure     401 {string} string "Unauthorized"
// @Failure     500 {string} string "Error updating user"
// @Router      /user/account/edit [post]
func UserInfoEdit(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	firstName := c.PostForm("firstName")
	lastName := c.PostForm("lastName")
	email := c.PostForm("email")
	password := c.PostForm("password")

	if firstName != "" {
		user.FirstName = firstName
	}
	if lastName != "" {
		user.LastName = lastName
	}
	if email != "" {
		user.Email = email
	}
	if password != "" {
		hashedPass, err := utils.HashPassword(password)
		if err != nil {
			c.String(http.StatusInternalServerError, "Error hashing password")
			return
		}
		user.HashedPassword = hashedPass
	}

	res := db.DB.Save(&user)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error updating user")
		return
	}

	c.String(http.StatusOK, "User info updated")
}
