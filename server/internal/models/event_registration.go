package models

import (
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

type EventRegistration struct {
	UserID				uint			`gorm:"primaryKey"`
	EventID			 	uint			`gorm:"primaryKey"`
	RegistrationType 	string			//represents registration type and tier
	DiscountCodeID		uint			//TODO: replace dummy
	CreatedAt 			time.Time
  	UpdatedAt 			time.Time
  	DeletedAt 			gorm.DeletedAt 	`gorm:"index"`
}

/*
TODO

Right now, RegistrationType is a dummy, it represents the registration type and
tier, which will be implemented later. So the following implementation is
incomplete and needs to be finished once registration types and tiers are
to be implemented.
*/

func NewEventRegistration(user User, event Event, discount uint, regType string) (*EventRegistration, error) {
	if (user.ID == event.OrganizerID) {
		return nil, errors.New("EventRegistration: An organizer can't enroll in their own event")
	}

	//TODO: check if regType is valid registration type/tier for the event

	//TODO: check if the discount code is valid for the event

	res := &EventRegistration{
		UserID: user.ID,
		EventID: event.ID,
		DiscountCodeID: discount,
		RegistrationType: regType,
	}

	return res, nil
}
