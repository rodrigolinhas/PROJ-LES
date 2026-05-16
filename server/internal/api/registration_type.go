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

type BenefitInfo struct {
	ID   uint   `json:"ID" example:"1"`
	Name string `json:"Name" example:"Lunch"`
}

type RegistrationType struct {
	ID          uint          `example:"1"`
	Name        string        `example:"Pass"`
	Description string        `example:"Pass Description"`
	Price       float64       `example:"7.5"`
	Benefits    []BenefitInfo `example:"[{\"ID\":1,\"Name\":\"Lunch\"}]"`
}

func regTypePreface(c *gin.Context) (*models.Event, error) {
	event, err := eventEditPreface(c)
	if err != nil {
		return nil, errors.New("Error sent")
	}

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
// @Param 		benefits		formData	string	false	"Comma-separated list of benefits"
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
	if err != nil {
		return
	}

	name := c.Request.FormValue("name")
	desc := c.Request.FormValue("description")
	priceStr := c.Request.FormValue("price")

	var price float64
	if priceStr != "" {
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

	benefitsStr := c.Request.FormValue("benefits")
	parsedBenefits, err := models.ParseBenefits(benefitsStr)
	if err != nil {
		c.String(http.StatusBadRequest, "Invalid benefits format: "+err.Error())
		return
	}

	var dbBenefits []models.Benefit
	for _, pb := range parsedBenefits {
		var dbB models.Benefit
		if err := db.DB.Where("name = ?", pb.Name).FirstOrCreate(&dbB, models.Benefit{Name: pb.Name}).Error; err != nil {
			c.String(http.StatusInternalServerError, "Error handling benefits")
			return
		}
		dbBenefits = append(dbBenefits, dbB)
	}

	regType, err := models.NewRegistrationType(event.ID, name, desc, price, dbBenefits)
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
// @Param 		benefits		formData	string	false	"Comma-separated list of benefits"
// @Success 	200 {string} string "Event Registration Type edited successfully"
// @Failure		401 {string} string "Invalid credentials"
// @Failure		404 {string} string "Event not found"
// @Failure		403 {string} string "User is not the organizer of the event"
// @Failure		400 {string} string "Can't parse the price"
// @Failure		409 {string} string "Can't edit the registration type of a published event"
// @Failure 	500 {string} string "Error found during registration type creation"
// @Router 		/event/regtype/edit [post]
func RegistrationTypeEdit(c *gin.Context) {
	event, err := regTypePreface(c)
	if err != nil {
		return
	}

	regtypeID := c.Request.FormValue("regTypeID")
	name := strings.TrimSpace(c.Request.FormValue("name"))
	desc := strings.TrimSpace(c.Request.FormValue("description"))
	priceStr := strings.TrimSpace(c.Request.FormValue("price"))

	var price float64
	if priceStr != "" {
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
		dberr := db.DB.Where("event_id = ? AND name = ? AND id != ?", event.ID, name, regType.ID).
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

	benefitsStr, ok := c.GetPostForm("benefits")
	if ok {
		parsedBenefits, err := models.ParseBenefits(benefitsStr)
		if err != nil {
			c.String(http.StatusBadRequest, "Invalid benefits format: "+err.Error())
			return
		}

		var dbBenefits []models.Benefit
		for _, pb := range parsedBenefits {
			var dbB models.Benefit
			if err := db.DB.Where("name = ?", pb.Name).FirstOrCreate(&dbB, models.Benefit{Name: pb.Name}).Error; err != nil {
				c.String(http.StatusInternalServerError, "Error handling benefits")
				return
			}
			dbBenefits = append(dbBenefits, dbB)
		}

		err = db.DB.Model(&regType).Association("Benefits").Replace(dbBenefits)
		if err != nil {
			c.String(http.StatusInternalServerError, "Error updating benefits in DB")
			return
		}
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
		c.String(http.StatusUnauthorized, "Invalid authentication: "+autherr.Error())
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

	var regtypes []models.RegistrationType
	err := db.DB.Preload("Benefits").Model(&models.RegistrationType{}).
		Where("event_id = ?", event.ID).
		Find(&regtypes)

	if err.RowsAffected == 0 {
		c.String(http.StatusNotFound, "This event doesn't have registration types")
		return
	}

	var response []RegistrationType
	for _, rt := range regtypes {
		var benefits []BenefitInfo
		for _, b := range rt.Benefits {
			benefits = append(benefits, BenefitInfo{ID: b.ID, Name: b.Name})
		}
		if benefits == nil {
			benefits = []BenefitInfo{}
		}

		response = append(response, RegistrationType{
			ID:          rt.ID,
			Name:        rt.Name,
			Description: rt.Description,
			Price:       rt.Price,
			Benefits:    benefits,
		})
	}

	c.IndentedJSON(http.StatusOK, response)
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
	if err != nil {
		return
	}

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

// EventBenefitsList
// @Summary 	List the benefits of an event
// @Description A user can view the benefits associated with an event that they own or was published
// @Tags 		Event
// @Accept		plain
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		id				path		string	true	"ID of the event"
// @Success 	200 {array} string
// @Failure		401 {string} string "Invalid credentials"
// @Failure		403 {string} string "Event was not published yet and the user is not the orgaziner"
// @Failure		404 {string} string "Event not found"
// @Router 		/event/view/:id/benefits [get]
func EventBenefitsList(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: "+autherr.Error())
		return
	}

	eventID := c.Param("id")

	var event models.Event
	res := db.DB.Preload("RegTypes.Benefits").Model(&models.Event{}).Where("ID = ?", eventID).Take(&event)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if event.Published == false && event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "Event was not published yet and the user is not the orgaziner")
		return
	}

	benefitsMap := make(map[string]bool)
	var benefits []string

	for _, rt := range event.RegTypes {
		for _, b := range rt.Benefits {
			if !benefitsMap[b.Name] {
				benefitsMap[b.Name] = true
				benefits = append(benefits, b.Name)
			}
		}
	}

	if len(benefits) == 0 {
		c.String(http.StatusNotFound, "This event doesn't have benefits associated")
		return
	}

	c.IndentedJSON(http.StatusOK, benefits)
}

// RegistrationTypeView
// @Summary 	Get a single Registration Type of an event
// @Description A user can view a specific registration type of an event
// @Tags 		Event
// @Accept		plain
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		id				path		string	true	"ID of the event"
// @Param 		regid			path		string	true	"ID of the registration type"
// @Success 	200 {object} RegistrationType
// @Failure		401 {string} string "Invalid credentials"
// @Failure		403 {string} string "Event was not published yet and the user is not the orgaziner"
// @Failure		404 {string} string "Event/Registration Type not found"
// @Router 		/event/view/:id/regtype/:regid [get]
func RegistrationTypeView(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: "+autherr.Error())
		return
	}

	eventID := c.Param("id")
	regTypeID := c.Param("regid")

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

	var rt models.RegistrationType
	err := db.DB.Preload("Benefits").Model(&models.RegistrationType{}).
		Where("event_id = ? AND id = ?", event.ID, regTypeID).
		First(&rt)

	if err.Error != nil {
		c.String(http.StatusNotFound, "Registration Type not found")
		return
	}

	var benefits []BenefitInfo
	for _, b := range rt.Benefits {
		benefits = append(benefits, BenefitInfo{ID: b.ID, Name: b.Name})
	}
	if benefits == nil {
		benefits = []BenefitInfo{}
	}

	response := RegistrationType{
		ID:          rt.ID,
		Name:        rt.Name,
		Description: rt.Description,
		Price:       rt.Price,
		Benefits:    benefits,
	}

	c.IndentedJSON(http.StatusOK, response)
}

type ParticipantInfo struct {
	ID        uint
	FirstName string
	LastName  string
	Email     string
}

// EventBenefitParticipants
// @Summary 	List the users eligible for a benefit in a event
// @Description A event organizer can view a list of all the users eligible for a benefit given in one of their events.
// @Tags 		Event
// @Accept		plain
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		id				path		string	true	"ID of the event"
// @Param 		benefitID		path		string	true	"ID of the benefit"
// @Success 	200 {array} ParticipantInfo
// @Failure		401 {string} string "Invalid credentials"
// @Failure		403 {string} string "User isn't the event orgaziner"
// @Failure		404 {string} string "Event not found/No participant found"
// @Failure		500 {string} string "Error found in DB"
// @Router 		/event/view/:id/benefit_participants/:benefitID [get]
func EventBenefitParticipants(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: "+autherr.Error())
		return
	}

	eventID := c.Param("id")

	var event models.Event
	res := db.DB.Preload("RegTypes.Benefits").Model(&models.Event{}).Where("ID = ?", eventID).Take(&event)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "User isn't the event orgaziner")
		return
	}

	benefitID := c.Param("benefitID")

	subquery := db.DB.Table("registration_type_benefits").
		Joins("LEFT OUTER JOIN registration_types ON registration_type_id = registration_types.id").
		Joins("LEFT OUTER JOIN events ON registration_types.event_id = events.id").
		Where("event_id = ? AND benefit_id = ?", eventID, benefitID).
		Select("registration_type_id")
	if subquery.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	var participants []ParticipantInfo
	query := db.DB.Table("event_registrations").
		Joins("LEFT OUTER JOIN users ON user_id = users.id").
		Where("confirmed = ? AND reg_type_id IN (?)", true, subquery).
		Scan(&participants)
	if query.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	if len(participants) == 0 {
		c.String(http.StatusNotFound, "No participant found")
		return
	}

	c.IndentedJSON(http.StatusOK, participants)
}
