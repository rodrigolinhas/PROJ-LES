package models

import (
	"errors"
	"strings"
	//"fmt"
	"time"

	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Name			string 		`gorm:"uniqueIndex;not null"`
	Theme	        string		`gorm:"not null"`
	Description		string		`gorm:"not null"`
	Organization 	string		`gorm:"not null"`
	Organizer		User		`gorm:"not null"`
	StartDate		time.Time	`gorm:"not null"`
	EndDate			time.Time	`gorm:"not null"`
	Location		string		`gorm:"not null"`
	Published		bool		`gorm:"not null;default:false"`
	Closed			bool		`gorm:"not null;default:false"`
}

func NewEvent(name string, theme string, desc string, org string, owner User, 
		      start time.Time, end time.Time, local string, db *gorm.DB) (*Event, error) {
	e := &Event{ 
		Name: 			strings.TrimSpace(name), 
		Theme: 			strings.TrimSpace(theme), 
		Description: 	strings.TrimSpace(desc), 
		Organization: 	strings.TrimSpace(org), 
		Organizer: 		owner, 
		StartDate: 		start.Truncate(time.Minute),
		EndDate: 		end.Truncate(time.Minute),
		Location: 		strings.TrimSpace(local), 
		Published: 		false,
		Closed: 		false,
	}

	err := e.validate(db)
	if(err != nil) {
		return nil, err
	}

	return &Event{}, nil
}

func (e Event) validate(db *gorm.DB) error {
	if(e.Name == "" || e.Theme == "" || e.Description == "") {
		return errors.New("Event: Empty name/theme/description")
	}

	if(e.Organization == "") {
		return errors.New("Event: No organization")
	}

	if(e.StartDate.IsZero() || e.EndDate.IsZero()) {
		return errors.New("Event: Invalid date")	
	}

	if(e.Location == "") {
		return errors.New("Event: No location")
	}

	var res User
	tx := db.Model(e.Organizer).Take(&res)
	if(tx.Error != nil || tx.RowsAffected != 1) {
		return errors.New("Event: Invalid organizer")
	}
	if(res.Role != EventOrganizer) {
		return errors.New("Event: Organizer is not an event organizer")
	}

	return nil
}
