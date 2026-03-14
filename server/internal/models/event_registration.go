package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type EventRegistration struct {
	UserID				uint			`gorm:"primaryKey"`
	User				User			`gorm:"not null"`
	EventID			 	uint			`gorm:"primaryKey"`
	Event				Event			`gorm:"not null"`
	RegistrationType 	string			//represents registration type and tier
	DiscountCodeID		uint
	DiscountCode		DiscountCode
	Confirmed			bool			`gorm:"not null;default:false"` //represents whether the enrollment has already been paid or not
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

func NewEventRegistration(user User, event Event, discount DiscountCode, regType string) (*EventRegistration, error) {
	if (user == event.Organizer) {
		return nil, errors.New("EventRegistration: An organizer can't enroll in their own event")
	}

	//TODO: check if regType is valid registration type/tier for the event

	if (!discount.IsActive || discount.UsesCount >= discount.MaxUses) {
		return nil, errors.New("EventRegistration: Inactive discount code")
	}

	res := &EventRegistration{
		User: user,
		Event: event,
		DiscountCode: discount,
		RegistrationType: regType,
		Confirmed: false,
	}

	return res, nil
}
