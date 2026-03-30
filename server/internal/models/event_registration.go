package models

import (
	"errors"
	"slices"
	"time"

	"gorm.io/gorm"
)

type EventRegistration struct {
	UserID         uint             `gorm:"primaryKey"`
	User           User             `gorm:"not null"`
	EventID        uint             `gorm:"primaryKey"`
	Event          Event            `gorm:"not null"`
	RegTypeID      uint             //represents registration type
	RegType        RegistrationType `gorm:"not null"`
	DiscountCodeID uint
	DiscountCode   *DiscountCode
	Confirmed      bool `gorm:"not null;default:false"` //represents whether the enrollment has already been paid or not
	PayToken       string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

func NewEventRegistration(user User, event Event, discount *DiscountCode, regType RegistrationType) (*EventRegistration, error) {
	if user == event.Organizer || (user.ID != 0 && user.ID == event.OrganizerID) {
		return nil, errors.New("EventRegistration: An organizer can't enroll in their own event")
	}

	if !slices.ContainsFunc(event.RegTypes, func(rt RegistrationType) bool {
		return rt.Name == regType.Name && rt.Price == regType.Price
	}) {
		return nil, errors.New("EventRegistration: The registration type does not belong to the event")
	}

	if discount != nil {
		if !discount.IsActive || discount.UsesCount >= discount.MaxUses {
			return nil, errors.New("EventRegistration: Inactive discount code")
		}
	}

	res := &EventRegistration{
		User:         user,
		Event:        event,
		DiscountCode: discount,
		RegType:      regType,
		PayToken:     "",
		Confirmed:    false,
	}

	return res, nil
}
