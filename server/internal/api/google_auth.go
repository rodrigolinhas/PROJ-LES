package api

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"

	db "LES/server/internal/database"
	"LES/server/internal/models"
	"LES/server/internal/utils"
)

// InitGoogleAuth loads env vars and registers the Google OAuth provider.
// Must be called before the router starts.
func InitGoogleAuth() {
	key := os.Getenv("SESSION_SECRET")
	if key == "" {
		key = "default-session-secret"
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(86400)
	store.Options.Path = "/"
	store.Options.HttpOnly = true
	store.Options.Secure = false

	gothic.Store = store

	goth.UseProviders(
		google.New(
			os.Getenv("GOOGLE_CLIENT_ID"),
			os.Getenv("GOOGLE_CLIENT_SECRET"),
			"http://"+utils.EnvHostBackend()+"/auth/google/callback",
			"email", "profile",
		),
	)

	// Force Google to always show the account selection/consent screen
	// FOR DEMO PURPOSES ONLY
	provider, err := goth.GetProvider("google")
	if err == nil {
		googleProvider := provider.(*google.Provider)
		googleProvider.SetPrompt("select_account")
	}

}

// GoogleAuthBegin
// @Summary     Begin Google SSO authentication
// @Description Redirects the user to Google's OAuth2 consent screen for SSO login. If the user does not have an account, one will be created automatically upon callback.
// @Tags        Auth
// @Produce     html
// @Param       provider query string true "OAuth provider (must be 'google')"
// @Success     307 "Redirect to Google consent screen"
// @Router      /auth/google [get]
func GoogleAuthBegin(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Set("provider", "google")
	c.Request.URL.RawQuery = q.Encode()

	gothic.BeginAuthHandler(c.Writer, c.Request)
}

// GoogleAuthCallback
// @Summary     Google SSO callback
// @Description Handles the OAuth2 callback from Google after user consent. Exchanges the authorization code for user info, creates a new account if the user does not exist, generates session and CSRF tokens, and redirects to the frontend.
// @Tags        Auth
// @Produce     html
// @Param       code  query string true "Authorization code from Google"
// @Param       state query string true "OAuth state parameter"
// @Param       scope query string true "Granted OAuth scopes"
// @Success     307 "Redirect to frontend with session cookies set"
// @Failure     400 {string} string "Missing authorization code"
// @Failure     500 {string} string "OAuth or user creation error"
// @Router      /auth/google/callback [get]
func GoogleAuthCallback(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Set("provider", "google")
	c.Request.URL.RawQuery = q.Encode()

	// Get the provider
	provider, err := goth.GetProvider("google")
	if err != nil {
		fmt.Println("Provider error:", err)
		c.String(http.StatusInternalServerError, "OAuth provider not found")
		return
	}

	// Get the authorization code from the callback
	code := c.Query("code")
	if code == "" {
		c.String(http.StatusBadRequest, "Missing authorization code")
		return
	}

	// Exchange the code for a token directly (bypasses Gothic session issues)
	sess, err := provider.BeginAuth("")
	if err != nil {
		fmt.Println("BeginAuth error:", err)
		c.String(http.StatusInternalServerError, "OAuth begin auth failed")
		return
	}

	// Authorize with the code from Google's callback
	_, err = sess.Authorize(provider, c.Request.URL.Query())
	if err != nil {
		fmt.Println("Authorize error:", err)
		c.String(http.StatusInternalServerError, "OAuth authorization failed: "+err.Error())
		return
	}

	// Fetch the user from Google
	gothUser, err := provider.FetchUser(sess)
	if err != nil {
		fmt.Println("FetchUser error:", err)
		c.String(http.StatusInternalServerError, "Failed to fetch user from Google: "+err.Error())
		return
	}

	fmt.Printf("Google user: %s %s (%s)\n", gothUser.FirstName, gothUser.LastName, gothUser.Email)

	// Look up user by email
	var user models.User
	res := db.DB.Where("email = ?", gothUser.Email).First(&user)

	if res.Error != nil {
		// User doesn't exist yet — create one
		newUser, createErr := models.NewOAuthUser(
			gothUser.FirstName,
			gothUser.LastName,
			gothUser.Email,
			"google",
			gothUser.UserID,
		)
		if createErr != nil {
			fmt.Println("Error creating OAuth user:", createErr)
			c.String(http.StatusInternalServerError, "Failed to create user")
			return
		}

		if dbErr := db.DB.Create(newUser).Error; dbErr != nil {
			fmt.Println("DB error creating OAuth user:", dbErr)
			c.String(http.StatusInternalServerError, "Failed to save user")
			return
		}
		user = *newUser
	}

	// Generate session and CSRF tokens (same flow as UserLogin)
	sessionToken := utils.GenerateToken(32)
	csrfToken := utils.GenerateToken(32)

	c.SetCookie("session_token", sessionToken, 24*60*60,
		"/", utils.EnvHostUrl(), false, true)
	c.SetCookie("csrf_token", csrfToken, 24*60*60,
		"/", utils.EnvHostUrl(), false, false)

	user.SessionToken = sessionToken
	user.CSRFToken = csrfToken
	db.DB.Save(&user)

	// Redirect to frontend success page
	c.Redirect(http.StatusTemporaryRedirect, "http://"+utils.EnvHostFrontend()+"/auth/success")
}
