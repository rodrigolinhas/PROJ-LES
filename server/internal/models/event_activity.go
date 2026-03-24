package models

import (
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

type EventActivity struct {
	gorm.Model
	Name        string    `gorm:"index;not null"`
	Description string    `gorm:"not null"`
	StartDate   time.Time `gorm:"not null"`
	EndDate     time.Time `gorm:"not null"`
	EventID     uint      `gorm:"not null"`
	Event       Event     `gorm:"not null"`
}

// Creates an event activity model and validates it
func NewEventActivity(name string, description string, startDate time.Time, endDate time.Time, event Event) (*EventActivity, error) {
	a := newEventActivity(name, description, startDate, endDate, event)
	if err := a.validate(); err != nil {
		return nil, err
	}
	return a, nil
}

// Creates an event activity model without validating it
func newEventActivity(name string, description string, startDate time.Time, endDate time.Time, event Event) *EventActivity {
	a := &EventActivity{
		Name:        strings.TrimSpace(name),
		Description: strings.TrimSpace(description),
		StartDate:   startDate.Truncate(time.Minute),
		EndDate:     endDate.Truncate(time.Minute),
		Event:       event,
	}
	return a
}

// Validates every field
func (a EventActivity) validate() error {
	if a.Name == "" || a.Description == "" {
		return errors.New("EventActivity: Empty name/description")
	}
	epoch := time.Date(1970, time.January, 1, 0, 0, 0, 0, time.UTC)
	if a.StartDate.Before(epoch) || a.EndDate.Before(epoch) || a.StartDate.After(a.EndDate) {
		return errors.New("EventActivity: Invalid date")
	}
	return nil
}
