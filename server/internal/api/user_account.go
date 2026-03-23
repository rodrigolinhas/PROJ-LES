package api

import (
	db "LES/server/internal/database"
	"LES/server/internal/utils"
	"LES/server/internal/models"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
)

// UserMe
// @Summary     View user account information
// @Description Returns the authenticated user's information
// @Tags        User
// @Produce     json
// @Param       X-CSRF-Token header string true "CSRF Token"
// @Success     200 {object} map[string]string
// @Failure     401 {string} string "Unauthorized"
// @Router      /user/me [get]
func UserMe(c *gin.Context) {
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
		ok, _ := regexp.MatchString(models.EmailRegex, email)
		if !ok {
			c.String(http.StatusInternalServerError, "Invalid Email")
			return
		}
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
