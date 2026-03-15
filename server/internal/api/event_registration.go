package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	db "LES/server/internal/database"
	"LES/server/internal/models"
	"LES/server/internal/utils"
)

func EventRegister(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return
	}

	eventID := c.Request.FormValue("eventID")
	discountCode := c.Request.FormValue("discountCode")
	
	//TODO: Take in consideration the registration type and tier

	var event models.Event
	res := db.DB.Where("ID = ?", eventID).First(&event)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Event not found")
	}

	var discount *models.DiscountCode
	
	if discountCode == "" {
		discount = nil
	} else  {
		fmt.Println(discountCode)
		res = db.DB.Where("code = ?", discountCode).First(discount)
		if res.Error != nil {
			c.String(http.StatusNotFound, "Discount code not found")
			return
		}
	}

	reg, err := models.NewEventRegistration(*user, event, discount, "")
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	//TODO: if event enrollment cost for that tier is free, ignore payToken and set Confirmed to true
	reg.PayToken = utils.GenerateToken(32)

	trans := db.DB.Transaction(func(tx *gorm.DB) error {	
		err := tx.Create(reg)
		if err.Error != nil {
			return err.Error
		}

		if discount != nil && reg.PayToken != "" {
			discount.UsesCount++
			if discount.UsesCount >= discount.MaxUses {
				discount.IsActive = false
			}

			tx.Save(discount)
			if err.Error != nil {
				return err.Error
			}
		}

		return nil
	})
	if trans != nil {
		c.String(http.StatusInternalServerError, "Error found during event registration in the DB")
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"payToken": reg.PayToken,
	})
}

func EventPay(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return
	}

	eventID := c.Request.FormValue("eventID")
	payToken := c.Request.FormValue("payToken")

	var reg models.EventRegistration
	res := db.DB.Where("Event_ID = ? AND User_ID = ? AND Pay_Token = ?", eventID, user.ID, payToken).First(&reg)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Registration not found")
		return
	}

	if reg.Confirmed == true {
		c.String(http.StatusConflict, "Registration has already been paid")
		return
	}

	//DUMMY FUNCTION FOR EVENT REGISTRATION PAYMENT PROCESSING

	reg.Confirmed = true
	reg.PayToken = ""
	db.DB.Save(reg)

	c.String(http.StatusOK, "Event registration payed successfully")
}
