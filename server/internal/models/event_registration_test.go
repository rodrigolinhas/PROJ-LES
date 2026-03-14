
package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

var exampleOrg, _ = NewUser("Org", "Test", "EventOrganizer", "testorg@mail.com", examplePass)
var exampleStu, _ = NewUser("Student", "Test", "Student", "teststu@mail.com", examplePass)
var exampleEvent, _ = NewEvent("Event", "sci", "desc", "org", *exampleOrg, time.Now(), time.Now().Add(time.Hour), "Faro")
var exampleDisc, _ = NewDiscountCode("123", "percentage", 10, 5)

func TestNewEventRegistration1(t *testing.T) {
	eventReg, err := NewEventRegistration(*exampleStu, *exampleEvent, exampleDisc, "type")
	assert.NotNil(t, eventReg)
	assert.Nil(t, err)
	assert.Equal(t, eventReg.User, *exampleStu)
	assert.Equal(t, eventReg.Event, *exampleEvent)
	assert.Equal(t, eventReg.DiscountCode, exampleDisc)
	assert.Equal(t, eventReg.RegistrationType, "type")
}

func TestNewEventRegistration2(t *testing.T) {
	eventReg, err := NewEventRegistration(*exampleOrg, *exampleEvent, exampleDisc, "type")
	assert.Nil(t, eventReg)
	assert.NotNil(t, err)
}

func TestNewEventRegistration3(t *testing.T) {
	exampleDisc.IsActive = false
	eventReg, err := NewEventRegistration(*exampleStu, *exampleEvent, exampleDisc, "type")
	exampleDisc.IsActive = true
	assert.Nil(t, eventReg)
	assert.NotNil(t, err)
}

func TestNewEventRegistration4(t *testing.T) {
	exampleDisc.UsesCount = 5
	eventReg, err := NewEventRegistration(*exampleStu, *exampleEvent, exampleDisc, "type")
	exampleDisc.UsesCount = 0
	assert.Nil(t, eventReg)
	assert.NotNil(t, err)
}

func TestNewEventRegistration5(t *testing.T) {
	eventReg, err := NewEventRegistration(*exampleStu, *exampleEvent, nil, "type")
	assert.NotNil(t, eventReg)
	assert.Nil(t, err)
	assert.Equal(t, eventReg.User, *exampleStu)
	assert.Equal(t, eventReg.Event, *exampleEvent)
	assert.Nil(t, eventReg.DiscountCode)
	assert.Equal(t, eventReg.RegistrationType, "type")
}
