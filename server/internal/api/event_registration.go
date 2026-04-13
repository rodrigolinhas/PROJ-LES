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

type PayTokenJSON struct {
	PayToken string
}

type EventParticipant struct {
	ID        uint   `json:"ID" gorm:"column:id"`
	FirstName string `json:"FirstName" gorm:"column:first_name"`
	LastName  string `json:"LastName" gorm:"column:last_name"`
	Email     string `json:"Email" gorm:"column:email"`
	Confirmed bool   `json:"Confirmed" gorm:"column:confirmed"`
}

// EventRegister
// @Summary 	Enroll in a event
// @Description A user can enroll in a event, if said enrollment expects payment, a payToken will be given.
// @Tags 		Event
// @Accept		mpfd
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		eventID			formData	string	true	"ID of the event"
// @Param 		regTypeID		formData	string	true	"ID of the registration type"
// @Param 		discountCode	formData	string	false	"Discount code"
// @Success 	200 {object} PayTokenJSON
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "Event / Discount code not found"
// @Failure 	500 {string} string "Error found during event enrollment"
// @Router 		/event/register [post]
func EventRegister(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: "+autherr.Error())
		return
	}

	eventID := c.Request.FormValue("eventID")
	regTypeID := c.Request.FormValue("regTypeID")
	discountCode := c.Request.FormValue("discountCode")

	var event models.Event
	res := db.DB.Where("ID = ?", eventID).Preload("RegTypes").First(&event)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if event.Published == false {
		c.String(http.StatusConflict, "Can't enroll in a unpublished event")
		return
	}

	var regType models.RegistrationType
	res = db.DB.Where("ID = ? AND event_id = ?", regTypeID, eventID).First(&regType)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Registration Type not found")
		return
	}

	var discount *models.DiscountCode

	if discountCode == "" {
		discount = nil
	} else {
		fmt.Println(discountCode)
		res = db.DB.Where("code = ?", discountCode).First(&discount)
		if res.Error != nil {
			c.String(http.StatusNotFound, "Discount code not found")
			return
		}
	}

	reg, err := models.NewEventRegistration(*user, event, discount, regType)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	if regType.Price == 0 {
		reg.Confirmed = true
	} else {
		reg.PayToken = utils.GenerateToken(32)
	}

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

// EventParticipantsList
// @Summary 	List participants of an event
// @Description An event organizer can view all participants registered in one of their events
// @Tags 		Event
// @Accept		plain
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		id				path		string	true	"ID of the event"
// @Success 	200 {array} EventParticipant
// @Failure		401 {string} string "Invalid credentials"
// @Failure		403 {string} string "User is not the organizer of this event"
// @Failure		404 {string} string "Event not found / No participants found"
// @Failure 	500 {string} string "Error found on query"
// @Router 		/event/view/:id/participants [get]
func EventParticipantsList(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: "+autherr.Error())
		return
	}

	eventID := c.Param("id")

	var event models.Event
	res := db.DB.Where("id = ?", eventID).First(&event)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "User is not the organizer of this event")
		return
	}

	var participants []EventParticipant
	res = db.DB.Table("event_registrations").
		Select("users.id, users.first_name, users.last_name, users.email, event_registrations.confirmed").
		Joins("JOIN users ON users.id = event_registrations.user_id").
		Where("event_registrations.event_id = ?", event.ID).
		Scan(&participants)

	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found on query")
		return
	}

	if len(participants) == 0 {
		c.String(http.StatusNotFound, "No participants found")
		return
	}

	c.IndentedJSON(http.StatusOK, participants)
}

// EventPay
// @Summary 	Pay event enrollment fee
// @Description Dummy endpoint for paying the fee for enrolling in a event
// @Tags 		Event, Dev
// @Accept		mpfd
// @Produce 	plain
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		eventID			formData	string	true	"ID of the event"
// @Param 		payToken		formData	string	true	"PayToken given during event enrollment"
// @Success 	200 {string} string "Event registration paid successfully"
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "Registration not found"
// @Failure		409 {string} string "Registration has already been paid"
// @Failure 	500 {string} string "Error found during event payment confirmation"
// @Router 		/event/pay [post]
func EventPay(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: "+autherr.Error())
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
	res = db.DB.Save(reg)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found during event payment confirmation in the DB")
		return
	}

	c.String(http.StatusOK, "Event registration paid successfully")
}

type ShortEventEnroll struct {
	ShortEvent
	Confirmed bool `example:"true"`
}

// EventRegistrationList
// @Summary 	List the user's enrolled event
// @Description A user can view and filter all events that they enrolled in
// @Tags 		Event
// @Accept		plain
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		filter			query		string	false	"Filter the name of the events shown"
// @Param 		limit			query		int		false	"Number of events shown" maximum(50) default(20)
// @Param 		offset			query		int		false	"Number of events to skip in the search" default(0)
// @Success 	200 {array} ShortEventEnroll
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "No event found"
// @Failure		500 {string} string "Error found on query"
// @Router 		/event/my/enroll [get]
func EventRegistrationList(c *gin.Context) {
	user, limit, offset, filter, err := eventListPreface(c)
	if err != nil {
		return
	}

	var events []ShortEventEnroll
	sub := db.DB.Model(&models.EventRegistration{}).
		Where("user_id = ?", user.ID).
		Select("event_id, confirmed")
	res := db.DB.Table("events").
		Joins("RIGHT JOIN (?) ON id = event_id", sub).
		Limit(limit).
		Offset(offset).
		Where("name LIKE ?", "%"+filter+"%").
		Scan(&events)

	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found on query")
		return
	}
	if res.RowsAffected == 0 {
		c.String(http.StatusNotFound, "No event found")
		return
	}

	c.IndentedJSON(http.StatusOK, events)
}
