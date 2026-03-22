package api

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/models"
)

func regTypePreface(c *gin.Context) (*models.Event, error) {
	event, err := eventEditPreface(c)
	if err != nil { return nil, errors.New("Error sent") }

	if event.Published == true {
		c.String(http.StatusConflict, "Can't add/edit/remove a registration type of a published event")	
		return nil, errors.New("Error sent")
	}

	return event, nil
}

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
		}
		price = n
	} else {
		c.String(http.StatusBadRequest, "No price given")
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

	c.String(http.StatusOK, "Event Registration Type added successfully")
}
