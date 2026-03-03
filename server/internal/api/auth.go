package api

import (
	"fmt"
	"net/http"
	"net/url"

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
	password := c.Request.FormValue("password")

	if len(password) < 8 {
		c.String(http.StatusNotAcceptable, "Password smaller than 8 characters")
		return
	}

	hashedPass, hashErr := utils.HashPassword(password)
	if hashErr != nil {
		c.String(http.StatusInternalServerError, "Error found during password hashing")
		return
	}

	user, userErr := models.NewUser(fName, lName, role, email, hashedPass)
	if userErr != nil {
		fmt.Println(userErr.Error())
		c.String(http.StatusNotAcceptable, "Error found during user model creation")
		return
	}

	res := db.DB.Create(user)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found during user registration in the DB")
		return
	}

	c.String(http.StatusCreated, "User registered successfully")
}

// UserLogin
// @Summary 	User login
// @Description Authenticates a user and generates session and CSRF tokens
// @Tags 		User, Auth
// @Accept		mpfd
// @Produce 	plain
// @Param 		email	formData	string	true	"User's email"
// @Param 		pass	formData	string	true	"User's password"
// @Success 	200 {object} string "User login with success"
// @Failure		400 {object} string "Missing email or password"
// @Failure		401 {object} string "Invalid credentials"
// @Failure 	500 {object} string "Error found during user login"
// @Router 		/user/login [post]
func UserLogin(c *gin.Context) {
	email := c.Request.FormValue("email")
	pass := c.Request.FormValue("pass")

	if email == "" || pass == "" {
		c.String(http.StatusBadRequest, "Missing email or password")
		return
	}

	var user models.User
	res := db.DB.Where("email = ?", email).First(&user)
	if res.Error != nil || !utils.CheckPasswordHash(pass, user.HashedPassword) {
		c.String(http.StatusUnauthorized, "Invalid credentials")
		return
	}

	sessionToken := utils.GenerateToken(32)
	csrfToken := utils.GenerateToken(32)

	//set a session cookie
	c.SetCookie("session_token", sessionToken, 24*60*60,
		"/", "localhost", false, true)

	//set CSRF token in a cookie
	c.SetCookie("csrf_token", csrfToken, 24*60*60,
		"/", "localhost", false, false)

	user.SessionToken = sessionToken
	user.CSRFToken = csrfToken
	db.DB.Save(&user)

	c.String(http.StatusOK, "User login with success")
}

// Authorize verifies whether the user has permission to proceed
// It checks:
// 1. If the user exists (via email param).
// 2. If the session token in the cookie matches the DB.
// 3. If the CSRF token in the header matches the DB.
func Authorize(c *gin.Context) error {
	email := c.Request.FormValue("email")
	var user models.User
	res := db.DB.Where("email = ?", email).First(&user)
	if res.Error != nil {
		return fmt.Errorf("user not found")
	}

	//validate session token
	sessionToken, err := c.Cookie("session_token")
	if err != nil || sessionToken == "" || sessionToken != user.SessionToken {
		return fmt.Errorf("invalid session token")
	}

	//validate the CSRF token
	csrfToken := c.GetHeader("X-CSRF-Token")
	decodedCsrf, err := url.QueryUnescape(csrfToken)
	if err == nil {
		csrfToken = decodedCsrf
	}

	if csrfToken == "" || csrfToken != user.CSRFToken {
		return fmt.Errorf("invalid CSRF token")
	}

	return nil //auth success
}

// UserLogout
// @Summary     User logout
// @Description Logs out the user, clears cookies and resets tokens in DB
// @Tags       User, Auth
// @Produce     plain
// @Param      email  formData   string true   "User's email"
// @Param      X-CSRF-Token header	string true   "CSRF Token"
// @Success     200 {object} string "Logged out successfully!"
// @Failure    401 {object} string "Unauthorized"
// @Router     /user/logout [post]
func UserLogout(c *gin.Context) {
	if err := Authorize(c); err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	email := c.Request.FormValue("email")
	var user models.User
	if err := db.DB.Where("email = ?", email).First(&user).Error; err == nil {
		user.SessionToken = ""
		user.CSRFToken = ""
		db.DB.Save(&user)
	}

	//clean the tokens
	c.SetCookie("session_token", "", -1, "/", "localhost", false, true)
	c.SetCookie("csrf_token", "", -1, "/", "localhost", false, false)

	c.String(http.StatusOK, "Log out with success")
}
