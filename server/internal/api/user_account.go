package api

import (
	db "LES/server/internal/database"
	"LES/server/internal/utils"
	"LES/server/internal/models"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
)

type UserInfo struct {
	ID			uint
	FirstName 	string
	LastName 	string
	Email		string
	Role		string
}

// UserMe
// @Summary     View user account information
// @Description Returns the authenticated user's information
// @Tags        User
// @Produce     json
// @Param       X-CSRF-Token header string true "CSRF Token"
// @Success     200 {object} UserInfo
// @Failure     401 {string} string "Unauthorized"
// @Router      /user/me [get]
func UserMe(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	c.JSON(http.StatusOK, UserInfo{
		ID:		   user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
		Role:      models.RoleName[user.Role],
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
// @Param       email formData string false "New email"
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
	role := c.PostForm("role")

	if firstName != "" {
		user.FirstName = firstName
	}
	if lastName != "" {
		user.LastName = lastName
	}
	if email != "" {
		ok, _ := regexp.MatchString(models.EmailRegex, email)
		if !ok {
			c.String(http.StatusBadRequest, "Invalid email format")
			return
		}
		user.Email = email
	}
	if password != "" {
		hashedPass, err := utils.HashPassword(password)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to update password")
			return
		}
		user.HashedPassword = hashedPass
	}
	if role != "" {
		roleEnum, valid := models.RoleMap[role]
		if !valid {
			c.String(http.StatusBadRequest, "Invalid Role")
			return
		}
		user.Role = roleEnum
	}

	res := db.DB.Save(&user)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Failed to update user information")
		return
	}

	c.String(http.StatusOK, "User information updated successfully")
}

// UserSearch
// @Summary     Search users
// @Description Search for users by email or name
// @Tags        User
// @Produce     json
// @Param       query query string true "Search query (name or email)"
// @Param       X-CSRF-Token header string true "CSRF Token"
// @Success     200 {array} UserInfo
// @Failure     400 {string} string "Missing query parameter"
// @Failure     401 {string} string "Unauthorized"
// @Router      /user/search [get]
func UserSearch(c *gin.Context) {
	_, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	query := c.Query("query")
	if query == "" {
		c.String(http.StatusBadRequest, "Missing query parameter")
		return
	}

	var users []models.User
	like := "%" + query + "%"
	db.DB.Where("first_name LIKE ? OR last_name LIKE ? OR email LIKE ?", like, like, like).
		Limit(20).
		Find(&users)

	var results []UserInfo
	for _, u := range users {
		results = append(results, UserInfo{
			ID:        u.ID,
			FirstName: u.FirstName,
			LastName:  u.LastName,
			Email:     u.Email,
		})
	}

	c.JSON(http.StatusOK, results)
}
