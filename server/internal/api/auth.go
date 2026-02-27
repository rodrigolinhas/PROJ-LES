package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/models"
	"LES/server/internal/utils"
)

// UserRegister
// @Summary 	User registration
// @Description Registers an user on the DB
// @Tags 		User, Auth
// @Accept		mpfd
// @Produce 	plain
// @Param 		firstName	formData	string	true	"User's first name"
// @Param 		lastName	formData	string	true	"User's last name"
// @Param 		role		formData	string	true	"User's role (must be a valid role)"
// @Param 		email		formData	string	true	"User's email"
// @Param 		pass		formData	string	true	"User's plain password (must be at least 8 characters long)"	minlength(8)
// @Success 	201 {object} string "User registered successfully"
// @Failure		406 {object} string "Error found on the form params"
// @Failure		500 {object} string "Error found on user registration"
// @Router 		/user/register [post]
func UserRegister(c *gin.Context) {
	fName := c.Request.FormValue("firstName")
	lName := c.Request.FormValue("lastName")
	role := c.Request.FormValue("role")
	email := c.Request.FormValue("email")
	pass := c.Request.FormValue("pass")

	if(len(pass) < 8){
		c.String(http.StatusNotAcceptable, "Password smaller than 8 characters")
		return
	}

	hashedPass, hashErr := utils.HashPassword(pass)
	if(hashErr != nil) {
		c.String(http.StatusInternalServerError, "Error found during password hashing")
		return
	}

	user, userErr := models.NewUser(fName, lName, role, email, hashedPass)
	if(userErr != nil) {
		fmt.Println(userErr.Error())
		c.String(http.StatusNotAcceptable, "Error found during user model creation")
		return
	}

	res := db.DB.Create(user)
	if(res.Error != nil) {
		c.String(http.StatusInternalServerError, "Error found during user registration in the DB")
		return
	}

	c.String(http.StatusCreated, "User registered successfully")
}
