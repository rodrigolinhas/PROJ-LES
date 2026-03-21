package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/models"
)

func RegistrationTypeCreate(c *gin.Context) {
	event, err := eventEditPreface(c)
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

	event.RegTypes = append(event.RegTypes, *regType)
	res := db.DB.Save(&event)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}
	
	//TODO: check if there are regtype of the same event, with the same name
	//TODO: dissallow adding regtypes to events that are already published

	c.String(http.StatusOK, "Event Registration Type added successfully")
}
