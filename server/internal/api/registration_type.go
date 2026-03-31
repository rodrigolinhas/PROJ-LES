package api

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/models"
)

type RegistrationType struct {
	ID				uint	`example:"1"`
	Name			string 	`example:"Pass"`
	Description		string	`example:"Pass Description"`
	Price	        float64	`example:"7.5"`
}

func regTypePreface(c *gin.Context) (*models.Event, error) {
	event, err := eventEditPreface(c)
	if err != nil { return nil, errors.New("Error sent") }

	if event.Published == true {
		c.String(http.StatusConflict, "Can't add/edit/remove a registration type of a published event")	
		return nil, errors.New("Error sent")
	}

	return event, nil
}

// RegistrationTypeCreate
// @Summary 	Create a Registration Type of an event
// @Description An event organizer can create a registration type for one of their unpublished events
// @Tags 		Event
// @Accept		mpfd
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		eventID			formData	string	true	"ID of the event"
// @Param 		name			formData	string	true	"Name of the registration type"
// @Param 		description		formData	string	true	"Description of the registration type"
// @Param 		price			formData	number	true	"Price of the registration type"
// @Success 	200 {string} string "Event Registration Type added successfully"
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "Event not found"
// @Failure		403 {string} string "User is not the orgaziner of the event"
// @Failure		400 {string} string "Can't parse the price"
// @Failure		409 {string} string "Can't add a registration type to a published event"
// @Failure 	500 {string} string "Error found during registration type creation"
// @Router 		/event/regtype/create [post]
func RegistrationTypeCreate(c *gin.Context) {
	event, err := regTypePreface(c)
	if err != nil { return }

	name := c.Request.FormValue("name")
	desc := c.Request.FormValue("description")
	priceStr := c.Request.FormValue("price")

	var price float64
	if priceStr != ""  {
		n, err := strconv.ParseFloat(priceStr, 64)
		if err != nil {
			c.String(http.StatusBadRequest, "Can't parse the price") 
			return
		}
		price = n
	} else {
		c.String(http.StatusBadRequest, "No price given")
		return
	}

	regType, err := models.NewRegistrationType(event.ID, name, desc, price)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	arr := []models.RegistrationType{}
	dberr := db.DB.Where("event_id = ? AND name = ?", event.ID, regType.Name).
				Find(&arr)
	if dberr.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}
	if dberr.RowsAffected != 0 {
		c.String(http.StatusInternalServerError, "There is a registration type with the same name for this event")
		return
	}

	event.RegTypes = append(event.RegTypes, *regType)
	res := db.DB.Save(&event)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	c.String(http.StatusCreated, "Event Registration Type added successfully")
}

// RegistrationTypeEdit
// @Summary 	Edit a Registration Type of an event
// @Description An event organizer can edit a registration type for one of their unpublished events
// @Tags 		Event
// @Accept		mpfd
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		eventID			formData	string	true	"ID of the event"
// @Param 		regTypeID		formData	string	true	"ID of the registration type"
// @Param 		name			formData	string	false	"Name of the registration type"
// @Param 		description		formData	string	false	"Description of the registration type"
// @Param 		price			formData	number	false	"Price of the registration type"
// @Success 	200 {string} string "Event Registration Type edited successfully"
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "Event not found"
// @Failure		403 {string} string "User is not the orgaziner of the event"
// @Failure		400 {string} string "Can't parse the price"
// @Failure		409 {string} string "Can't edit the registration type of a published event"
// @Failure 	500 {string} string "Error found during registration type creation"
// @Router 		/event/regtype/edit [post]
func RegistrationTypeEdit(c *gin.Context) {
	event, err := regTypePreface(c)
	if err != nil { return }

	regtypeID := c.Request.FormValue("regTypeID")
	name := strings.TrimSpace(c.Request.FormValue("name"))
	desc := strings.TrimSpace(c.Request.FormValue("description"))
	priceStr := strings.TrimSpace(c.Request.FormValue("price"))

	var price float64
	if priceStr != ""  {
		n, err := strconv.ParseFloat(priceStr, 64)
		if err != nil {
			c.String(http.StatusBadRequest, "Can't parse the price") 
			return
		}
		price = n
	}

	regType := models.RegistrationType{}
	find := db.DB.Where("id = ? AND event_id = ?", regtypeID, event.ID).Take(&regType)
	if find.RowsAffected != 1 && find.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	if name != "" {
		arr := []models.RegistrationType{}
		dberr := db.DB.Where("event_id = ? AND name = ?", event.ID, name).
					Find(&arr)
		if dberr.Error != nil {
			c.String(http.StatusInternalServerError, "Error found in DB")
			return
		}
		if dberr.RowsAffected != 0 {
			c.String(http.StatusInternalServerError, "There is a registration type with the same name for this event")
			return
		}
		regType.Name = name
	}

	if desc != "" {
		regType.Description = desc
	}

	if priceStr != "" {
		if price < 0 {
			c.String(http.StatusBadRequest, "Invalid price")
			return
		}
		regType.Price = price
	}

	res := db.DB.Save(&regType)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	c.String(http.StatusOK, "Event Registration Type edited successfully")
}

// RegistrationTypeList
// @Summary 	List the registration types of an event
// @Description A user can view the registration types of an event that they own or was published 
// @Tags 		Event
// @Accept		plain
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		id				path		string	true	"ID of the event"
// @Success 	200 {array} RegistrationType 
// @Failure		401 {string} string "Invalid credentials"
// @Failure		403 {string} string "Event was not published yet and the user is not the orgaziner"
// @Failure		404 {string} string "Event/Registration Type not found"
// @Router 		/event/view/:id/regtypes [get]
func RegistrationTypeList(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return
	}

	eventID := c.Param("id")

	var event models.Event
	res := db.DB.Model(&models.Event{}).Where("ID = ?", eventID).Take(&event)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if event.Published == false && event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "Event was not published yet and the user is not the orgaziner")
		return
	}

	var regtypes []RegistrationType
	err := db.DB.Model(&models.RegistrationType{}).
					Where("event_id = ?", event.ID).
					Scan(&regtypes)

	if err.RowsAffected == 0 {
		c.String(http.StatusNotFound, "This event doesn't have registration types")
		return
	}

	c.IndentedJSON(http.StatusOK, regtypes)
}

// RegistrationTypeDelete
// @Summary 	Delete a Registration Type of an event
// @Description An event organizer can delete a registration type for one of their unpublished events
// @Tags 		Event
// @Accept		mpfd
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		eventID			formData	string	true	"ID of the event"
// @Param 		regTypeID		formData	string	true	"ID of the registration type"
// @Success 	200 {string} string "Event Registration Type deleted successfully"
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "Event not found"
// @Failure		403 {string} string "User is not the orgaziner of the event"
// @Failure		409 {string} string "Can't delete the registration type of a published event"
// @Failure 	500 {string} string "Error found during registration type deletion"
// @Router 		/event/regtype/delete [post]
func RegistrationTypeDelete(c *gin.Context) {
	event, err := regTypePreface(c)
	if err != nil { return }

	regtypeID := c.Request.FormValue("regTypeID")

	regType := models.RegistrationType{}
	find := db.DB.Where("id = ? AND event_id = ?", regtypeID, event.ID).Take(&regType)
	if find.RowsAffected != 1 && find.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	res := db.DB.Delete(&regType)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	c.String(http.StatusOK, "Event Registration Type deleted successfully")
}
