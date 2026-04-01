package api

import (
	db "LES/server/internal/database"
	"LES/server/internal/models"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type EventActivity struct {
	ID			uint
	Name        string    
	Description string    
	StartDate   time.Time 
	EndDate     time.Time 
}

// EventActivityCreate
// @Summary     Create activity
// @Description While the user is logged in, creates an activity associated with an event and registers it in the database
// @Tags        EventActivity
// @Accept      mpfd
// @Produce 	plain
// @Param 		X-CSRF-Token 	header		string	true	"User's CSRF Token"
// @Param       name            formData 	string  true    "Activity name"
// @Param 		description 	formData 	string  true    "Activity description"
// @Param 		eventID 		path 	    string 	true 	"Event ID of the associated event"
// @Param 		startDate 		formData 	string  true 	"Date/Time at which the activity starts (RFC3339/ISO8601 format)"
// @Param 		endDate 		formData    string  true    "Date/Time at which the activity ends (RFC3339/ISO8601 format)"
// @Success     201 {string} string "Activity created with success"
// @Failure		401 {string} string "Invalid credentials"
// @Failure 	500 {string} string "Error found during activity creation"
// @Router /event/{eventId}/activity/create [post]
func EventActivityCreate(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: "+autherr.Error())
		return
	}

	name := c.Request.FormValue("name")
	desc := c.Request.FormValue("description")
	start := c.Request.FormValue("startDate")
	end := c.Request.FormValue("endDate")
	eventID := c.Param("eventId")

	startt, serr := time.Parse(time.RFC3339, start)
	if serr != nil {
		c.String(http.StatusInternalServerError, "Error found parsing start time: "+serr.Error())
		return
	}
	endt, eerr := time.Parse(time.RFC3339, end)
	if eerr != nil {
		c.String(http.StatusInternalServerError, "Error found parsing end time: "+eerr.Error())
		return
	}
	var event models.Event
	if err := db.DB.Where("id = ?", eventID).First(&event).Error; err != nil {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "Not your event")
		return
	}

	activity, err := models.NewEventActivity(name, desc, startt, endt, event)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	res := db.DB.Create(activity)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found during activity creation in the DB")
		return
	}

	c.String(http.StatusCreated, "Activity created successfully")
}

// EventActivityList
// @Summary 	List activities of an event
// @Description A user can view all the event's activities
// @Accept 		plain
// @Tags 		EventActivity
// @Produce 	json
// @Param 		X-CSRF-Token 	header 		string 	true 	"User's CSRF Token"
// @Param 		eventID 		path 		string 	true 	"Event ID"
// @Success 	200 {array} object
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "No activity found"
// @Router 		/event/{eventId}/activity/list [get]
func EventActivityList(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	eventID := c.Param("eventId")

	var event models.Event
	if err := db.DB.First(&event, eventID).Error; err != nil {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if !event.Published && event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "You can't view activities of this event (need to be the event organizer)")
		return
	}

	var activities []EventActivity
	db.DB.Model(&models.EventActivity{}).Where("event_id = ?", eventID).Scan(&activities)

	c.JSON(http.StatusOK, activities)
}

// EventActivityEdit
// @Summary Edit activity
// @Tags 	EventActivity
// @Accept 	mpfd
// @Produce plain
// @Param 	X-CSRF-Token 	header 		string 	true	"User's CSRF Token"
// @Param   eventId         path        string  true    "Event ID"
// @Param 	id              path        string  true    "Activity ID"
// @Param 	name            formData    string  false   "Name"
// @Param 	description     formData    string  false   "Description"
// @Success 200 {string} string "Updated"
// @Router 	/event/{eventId}/activity/edit/{id} [post]
func EventActivityEdit(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	eventID := c.Param("eventId")

	var activity models.EventActivity
	if err := db.DB.First(&activity, id).Error; err != nil {
		c.String(http.StatusNotFound, "Activity not found")
		return
	}

	if fmt.Sprint(activity.EventID) != eventID {
		c.String(http.StatusBadRequest, "Invalid event")
		return
	}

	var event models.Event
	db.DB.First(&event, eventID)

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "Not your event")
		return
	}

	if name := c.PostForm("name"); name != "" {
		activity.Name = name
	}
	if desc := c.PostForm("description"); desc != "" {
		activity.Description = desc
	}

	db.DB.Save(&activity)
	c.String(http.StatusOK, "Activity updated")
}

// EventActivityDelete
// @Summary Delete activity
// @Tags 	EventActivity
// @Accept  mpfd
// @Produce plain
// @Param   X-CSRF-Token 	header 		string 	true 	"User's CSRF Token"
// @Param   eventId         path        string  true    "Event ID"
// @Param   id              path        string 	true 	"Activity ID"
// @Success 200 {string} string "Deleted"
// @Router /event/{eventId}/activity/delete/{id} [post]
func EventActivityDelete(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	eventID := c.Param("eventId")

	var activity models.EventActivity
	if err := db.DB.First(&activity, id).Error; err != nil {
		c.String(http.StatusNotFound, "Activity not found")
		return
	}

	if fmt.Sprint(activity.EventID) != eventID {
		c.String(http.StatusBadRequest, "Invalid event")
		return
	}

	var event models.Event
	db.DB.First(&event, eventID)

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "Not your event")
		return
	}

	db.DB.Delete(&activity)
	c.String(http.StatusOK, "Activity deleted")
}

// EventActivityView
// @Summary 	View activity
// @Description View details of a specific activity
// @Tags 		EventActivity
// @Produce 	json
// @Param 		X-CSRF-Token 	header 		string 	true 	"CSRF Token"
// @Param       eventId         path        string  true    "Event ID"
// @Param 		id 				path		string  true    "Activity ID"
// @Success 	200 {object} object
// @Failure 	401 {string} string "Unauthorized"
// @Failure 	404 {string} string "Activity not found"
// @Router 		/event/{eventId}/activity/view/{id} [get]
func EventActivityView(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	eventID := c.Param("eventId")

	var activity models.EventActivity
	if err := db.DB.First(&activity, id).Error; err != nil {
		c.String(http.StatusNotFound, "Activity not found")
		return
	}

	eventIDUint, err := strconv.ParseUint(eventID, 10, 64)
	if err != nil {
		c.String(http.StatusBadRequest, "Invalid event ID")
		return
	}

	if activity.EventID != uint(eventIDUint) {
		c.String(http.StatusBadRequest, "Activity does not belong to this event")
		return
	}

	var event models.Event
	if err := db.DB.First(&event, eventID).Error; err != nil {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if !event.Published && event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "You can't view this activity (need to be the event organizer)")
		return
	}

	c.JSON(http.StatusOK, activity)
}
