package api

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
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
// @Success 	201 {string} string "User login with success"
// @Failure		401 {string} string "Invalid credentials"
// @Failure 	500 {string} string "Error found during event creation"
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

func eventEditPreface(c *gin.Context) (*models.Event, error) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return nil, errors.New("Error sent")
	}

	eventID := c.Request.FormValue("eventID")

	var event models.Event
	res := db.DB.Where("ID = ?", eventID).First(&event)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Event not found")
		return nil, errors.New("Error sent")
	}

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "User is not the organizer of this event")
		return nil, errors.New("Error sent")
	}

	return &event, nil
}

// EventPublish
// @Summary 	Publish event
// @Description A user can publish an event organized by them, so that all users can view it
// @Tags 		Event
// @Accept		mpfd
// @Produce 	plain
// @Param 		email			formData	string	true	"User's email"
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		eventID			formData	string	true	"ID of the event"
// @Success 	200 {string} string "Event published with success"
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "Event not found"
// @Failure		403 {string} string "User is not the organizer of the event"
// @Failure		409 {string} string "Event already published"
// @Router 		/event/publish [post]
func EventPublish(c *gin.Context) {
	event, err := eventEditPreface(c)
	if err != nil { return }

	if event.Published == true {
		c.String(http.StatusConflict, "Event was already published")
		return
	}

	event.Published = true
	db.DB.Save(&event)
	c.String(http.StatusOK, "Event published with success")
}

type ShortEvent struct {
	ID 		uint	`example:"1"`
	Name 	string  `example:"Event"`
	Theme 	string  `example:"CompSci"`
}

// EventList
// @Summary 	List events
// @Description A user can view and filter all published events
// @Tags 		Event
// @Accept		mpfd
// @Produce 	json
// @Param 		email			formData	string	true	"User's email"
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		filter			formData	string	false	"Filter the name of the events shown" 
// @Param 		limit			formData	int		false	"Number of events shown" maximum(50) default(20)
// @Param 		offset			formData	int		false	"Number of skip in the search" default(0)
// @Success 	200 {array} ShortEvent
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "No event found"
// @Router 		/event/list [get]
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

// EventDelete
// @Summary 	Delete event
// @Description A user can delete an event organized by them
// @Tags 		Event
// @Accept		mpfd
// @Produce 	plain
// @Param 		email			formData	string	true	"User's email"
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		eventID			formData	string	true	"ID of the event"
// @Success 	200 {string} string "Event deleted with success"
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "Event not found"
// @Failure		403 {string} string "User is not the organizer of the event"
// @Failure		500 {string} string "Error found during event deletion"
// @Router 		/event/delete [post]
func EventDelete(c *gin.Context) {
	event, err := eventEditPreface(c)
	if err != nil { return }

	res := db.DB.Where("ID = ?", event.ID).Delete(&event)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found during event deletion")
		return
	}

	c.String(http.StatusOK, "Event deleted with success")
}

//TODO: DOCS
func EventEdit(c *gin.Context) {
	event, err := eventEditPreface(c)
	if err != nil { return }

	name := c.Request.FormValue("name")
	theme := c.Request.FormValue("theme")
	desc := c.Request.FormValue("description")
	org := c.Request.FormValue("organization")
	start := c.Request.FormValue("startDate")
	end := c.Request.FormValue("endDate")
	local := c.Request.FormValue("location")

	// Maybe there is a better way to do this?
	name = strings.TrimSpace(name)
	if name != "" {
		event.Name = name
	}

	theme = strings.TrimSpace(theme)
	if theme != "" {
		event.Theme = theme
	}

	desc = strings.TrimSpace(desc)
	if desc != "" {
		event.Description = desc
	}

	org = strings.TrimSpace(org)
	if org != "" {
		event.Organization = org
	}

	start = strings.TrimSpace(start)
	if start != "" {
		startt, serr := time.Parse(time.RFC3339, start)
		if serr != nil {
			c.String(http.StatusInternalServerError, "Error found parsing start time: " + serr.Error())
			return
		}
		event.StartDate = startt
	}

	end = strings.TrimSpace(end)
	if end != "" {
		endt, eerr := time.Parse(time.RFC3339, end)
		if eerr != nil {
			c.String(http.StatusInternalServerError, "Error found parsing end time: " + eerr.Error())
			return
		}
		event.EndDate = endt
	}

	epoch := time.Date(1970, time.January, 1, 0, 0, 0, 0, time.UTC)
	if(event.StartDate.Before(epoch) || event.EndDate.Before(epoch) || event.StartDate.After(event.EndDate)) {
		c.String(http.StatusInternalServerError, "Invalid start/end time")
		return
	}

	local = strings.TrimSpace(local)
	if local != "" {
		event.Location = local
	}

	db.DB.Save(&event)
	c.String(http.StatusAccepted, "Event edited successfully")
}

//TODO: Endpoint for a user to view all of his events (published and unpublished)

//TODO: Endpoint for event information (published or their own)
