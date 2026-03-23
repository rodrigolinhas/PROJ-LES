package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

var exEvent, _ = NewEvent(
	"Event",
	"Theme",
	"Desc",
	"Org",
	*exampleUser,
	time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC),
	time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC),
	"Faro",
)

func TestNewActivityValid(t *testing.T) {
	a, err := NewEventActivity(
		"Activity",
		"Description",
		time.Date(2026, time.March, 20, 10, 0, 0, 0, time.UTC),
		time.Date(2026, time.March, 20, 12, 0, 0, 0, time.UTC),
		*exEvent,
	)

	assert.NotNil(t, a)
	assert.Nil(t, err)
}

func TestNewActivityTrim(t *testing.T) {
	a, err := NewEventActivity(
		"   Activity  ",
		"   Description  ",
		time.Date(2026, time.March, 20, 10, 0, 0, 0, time.UTC),
		time.Date(2026, time.March, 20, 12, 0, 0, 0, time.UTC),
		*exEvent,
	)

	assert.Equal(t, "Activity", a.Name)
	assert.Equal(t, "Description", a.Description)
	assert.Nil(t, err)
}

func TestActivityEmptyName(t *testing.T) {
	a := newEventActivity(
		"",
		"Description",
		time.Now(),
		time.Now().Add(time.Hour),
		*exEvent,
	)

	err := a.validate()

	assert.NotNil(t, a)
	assert.NotNil(t, err)
}

func TestActivityEmptyDescription(t *testing.T) {
	a := newEventActivity(
		"Activity",
		"",
		time.Now(),
		time.Now().Add(time.Hour),
		*exEvent,
	)

	err := a.validate()

	assert.NotNil(t, err)
}

func TestActivityInvalidDates(t *testing.T) {
	a := newEventActivity(
		"Activity",
		"Description",
		time.Date(2026, time.March, 20, 12, 0, 0, 0, time.UTC),
		time.Date(2026, time.March, 20, 10, 0, 0, 0, time.UTC),
		*exEvent,
	)

	err := a.validate()

	assert.NotNil(t, err)
}

func TestActivityBeforeEpoch(t *testing.T) {
	a := newEventActivity(
		"Activity",
		"Description",
		time.Date(1, time.January, 1, 0, 0, 0, 0, time.UTC),
		time.Now(),
		*exEvent,
	)

	err := a.validate()

	assert.NotNil(t, err)
}
