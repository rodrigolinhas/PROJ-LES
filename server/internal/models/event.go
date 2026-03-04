package models

import (
	"errors"
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

func NewEvent() (*Event, error) {
	return &Event{}, nil
}

func (e Event) validate(db gorm.DB) error {
	if(e.Name == "" || e.Theme == "" || e.Description == "") {
		return errors.New("Event: Empty name/theme/description")
	}

	if(e.Organization == "") {
		return errors.New("Event: No organization")
	}

	var res User
	tx := db.Model(e.Organizer).Take(&res)
	if(tx.Error != nil || tx.RowsAffected != 1) {
		return errors.New("Event: Invalid organizer")
	}
	if(res.Role != EventOrganizer) {
		return errors.New("Event: Organizer is not an event organizer")
	}

	if(e.StartDate.IsZero() || e.EndDate.IsZero()) {
		return errors.New("Event: Invalid date")	
	}

	if(e.Location == "") {
		return errors.New("Event: No location")
	}

	return nil
}
