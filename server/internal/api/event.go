package api

import (
	"net/http"
	"strconv"
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

	event, err := models.NewEvent(name, theme, desc, org, *user, startt, endt, local)
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

//TODO: DOC
func EventPublish(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return
	}

	id := c.Request.FormValue("eventID")

	var event models.Event
	res := db.DB.Where("ID = ?", id).First(&event)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusInternalServerError, "Event not found")
		return
	}

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "User is not the organizer of this event")
		return
	}

	if event.Published == true {
		c.String(http.StatusConflict, "Event was already published")
		return
	}

	event.Published = true
	db.DB.Save(&event)
	c.String(http.StatusOK, "Event published")
}

//TODO: DOC
func EventList(c *gin.Context) {
	_, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return
	}

	//TODO: CHANGE TO ENV VARIABLES
	limit := 20
	limitStr := c.Request.FormValue("limit")
	if limitStr != ""  {
		n, err := strconv.Atoi(limitStr)
		if err == nil {
			limit = n
		}
		if limit > 50 {
			limit = 50
		}
	}

	offset := 0
	offsetStr := c.Request.FormValue("offset")
	if offsetStr != ""  {
		n, err := strconv.Atoi(offsetStr)
		if err == nil {
			offset = n
		}
	}

	filter := c.Request.FormValue("filter")

	type ShortEvent struct {
		ID uint
		Name string
		Theme string
	}

	var events []ShortEvent
	res := db.DB.Model(&models.Event{}).
				 Limit(limit).
				 Offset(offset).
				 Where("published = ? AND name LIKE ?", true, "%"+filter+"%").
				 Scan(&events)

	if res.RowsAffected == 0 {
		c.String(http.StatusNotFound, "No event found")
		return
	}

	c.IndentedJSON(http.StatusOK, events)
}
