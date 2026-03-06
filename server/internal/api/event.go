package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/models"
)

// EventCreate
// @Summary 	Create event
// @Description While the user is logged in, creates an event and registers it in the database
// @Tags 		Event
// @Accept		mpfd
// @Produce 	plain
// @Param 		email			formData	string	true	"User's email"
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		name			formData	string	true	"Event name"
// @Param 		theme			formData	string	true	"Event theme"
// @Param 		description		formData	string	true	"Event description"
// @Param 		organization	formData	string	true	"Organization responsable for the event"
// @Param 		startDate		formData	string	true	"Date/Time at which the event starts (RFC3339/ISO8601 format)"
// @Param 		endDate			formData	string	true	"Date/Time at which the event ends (RFC3339/ISO8601 format)"
// @Param 		location		formData	string	true	"Location where the event takes place"
// @Success 	201 {object} string "User login with success"
// @Failure		401 {object} string "Invalid credentials"
// @Failure 	501 {object} string "Error found during event creation"
// @Router 		/event/create [post]
func EventCreate(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return
	}

	name := c.Request.FormValue("name")
	theme := c.Request.FormValue("theme")
	desc := c.Request.FormValue("description")
	org := c.Request.FormValue("organization")
	start := c.Request.FormValue("startDate")
	end := c.Request.FormValue("endDate")
	local := c.Request.FormValue("location")

	startt, serr := time.Parse(time.RFC3339, start)
	if serr != nil {
		c.String(http.StatusInternalServerError, "Error found parsing start time: " + serr.Error())
		return
	}

	endt, eerr := time.Parse(time.RFC3339, end)
	if eerr != nil {
		c.String(http.StatusInternalServerError, "Error found parsing end time: " + eerr.Error())
		return
	}

	//TODO: This api method currently does 2 DB queries, refactor so that it only needs one
	event, err := models.NewEvent(name, theme, desc, org, *user, startt, endt, local, db.DB)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	res := db.DB.Create(event)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found during event creation in the DB")
		return
	}

	c.String(http.StatusCreated, "Event created successfully")
}
