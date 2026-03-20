package models

import (
	"errors"
	"strings"

	"gorm.io/gorm"
)

type RegistrationType struct {
	gorm.Model
	EventID			uint		`gorm:"not null"`
	Name			string 		`gorm:"not null"`
	Description		string		`gorm:"not null"`
	Price	        float64		`gorm:"not null"`
}

func NewRegistrationType(eventID uint, name string, desc string, price float64) (*RegistrationType, error) {
	name = strings.TrimSpace(name)
	desc = strings.TrimSpace(desc)

	if name == "" || desc == "" {
		return nil, errors.New("RegistrationType: empty name/description")
	}

	if price < 0 {
		return nil, errors.New("RegistrationType: invalid price")
	}

	regType := &RegistrationType{
		EventID: eventID,
		Name: name,
		Description: desc,
		Price: price,
	}

	return regType, nil
}
