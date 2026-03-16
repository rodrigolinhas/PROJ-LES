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
// @Success 	201 {string} string "User registered successfully"
// @Failure		406 {string} string "Error found on the form params"
// @Failure		500 {string} string "Error found on user registration"
// @Router 		/user/register [post]
func UserRegister(c *gin.Context) {
	fName := c.Request.FormValue("firstName")
	lName := c.Request.FormValue("lastName")
	role := c.Request.FormValue("role")
	email := c.Request.FormValue("email")
	pass := c.Request.FormValue("pass")

	if len(pass) < 8 {
		c.String(http.StatusNotAcceptable, "Password smaller than 8 characters")
		return
	}

	hashedPass, hashErr := utils.HashPassword(pass)
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
// @Success 	200 {string} string "User login with success"
// @Failure		400 {string} string "Missing email or password"
// @Failure		401 {string} string "Invalid credentials"
// @Failure 	500 {string} string "Error found during user login"
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
	if res.Error != nil {
		c.String(http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Block password login for OAuth-only accounts
	if user.Provider != "" && user.Provider != "local" {
		c.String(http.StatusUnauthorized, "This account uses SSO login ("+user.Provider+")")
		return
	}

	if !utils.CheckPasswordHash(pass, user.HashedPassword) {
		c.String(http.StatusUnauthorized, "Invalid credentials")
		return
	}

	sessionToken := utils.GenerateToken(32)
	csrfToken := utils.GenerateToken(32)

	//set a email cookie
	c.SetCookie("user_email", user.Email, 24*60*60,
		"/", "localhost", false, true)

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

// Authorize verifies whether the user has permission to proceed and returns
// said model.
// It checks:
// 1. If the user exists (via email cookie).
// 2. If the session token in the cookie matches the DB.
// 3. If the CSRF token in the header matches the DB.
func Authorize(c *gin.Context) (*models.User, error) {
	email, err := c.Cookie("user_email")
	if err != nil || email == "" {
		return nil, fmt.Errorf("no credentials found")
	}

	var user models.User
	res := db.DB.Where("email = ?", email).First(&user)
	if res.Error != nil {
		return nil, fmt.Errorf("user not found")
	}

	//validate session token
	sessionToken, err := c.Cookie("session_token")
	if err != nil || sessionToken == "" || sessionToken != user.SessionToken {
		return nil, fmt.Errorf("invalid session token")
	}

	//validate the CSRF token
	csrfToken := c.GetHeader("X-CSRF-Token")
	decodedCsrf, err := url.QueryUnescape(csrfToken)
	if err == nil {
		csrfToken = decodedCsrf
	}

	if csrfToken == "" || csrfToken != user.CSRFToken {
		return nil, fmt.Errorf("invalid CSRF token")
	}

	return &user, nil //auth success
}

// UserLogout
// @Summary     User logout
// @Description Logs out the user, clears cookies and resets tokens in DB
// @Tags       User, Auth
// @Produce     plain
// @Param      X-CSRF-Token header	string true   "CSRF Token"
// @Success     200 {string} string "Logged out successfully!"
// @Failure    401 {string} string "Unauthorized"
// @Router     /user/logout [post]
func UserLogout(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	user.SessionToken = ""
	user.CSRFToken = ""
	db.DB.Save(&user)

	//clean the tokens
	c.SetCookie("user_email", "", -1, "/", "localhost", false, true)
	c.SetCookie("session_token", "", -1, "/", "localhost", false, true)
	c.SetCookie("csrf_token", "", -1, "/", "localhost", false, false)

	c.String(http.StatusOK, "Log out with success")
}

// UserMe
// @Summary     Get current user
// @Description Returns the currently logged in user based on the session token
// @Tags        User, Auth
// @Produce     json
// @Success     200 {object} map[string]string "User info"
// @Failure     401 {string} string "Unauthorized"
// @Router      /user/me [get]
func UserMe(c *gin.Context) {
	sessionToken, err := c.Cookie("session_token")
	if err != nil || sessionToken == "" {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	var user models.User
	res := db.DB.Where("session_token = ?", sessionToken).First(&user)
	if res.Error != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"email":     user.Email,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
	})
}
