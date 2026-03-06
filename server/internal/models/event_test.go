package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

var exampleUser, _ = NewUser("Test", "Test", "EventOrganizer", "test@mail.com", examplePass)

func TestNewEventFields1(t *testing.T) {
	var name = "Event"
	var theme = "CompSci"
	var desc = "Computer Science Event in Faro."
	var org = "org.org"
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.Equal(t, name, event.Name)
	assert.Equal(t, theme, event.Theme)
	assert.Equal(t, desc, event.Description)
	assert.Equal(t, org, event.Organization)
	assert.Equal(t, start, event.StartDate)
	assert.Equal(t, end, event.EndDate)
	assert.Equal(t, local, event.Location)
	assert.Nil(t, err)
}

func TestNewEventFields2(t *testing.T) {
	var name = "Event   "
	var theme = "     CompSci"
	var desc = "Computer Science Event in Faro."
	var org = "   org.org  "
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var local = "  Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.Equal(t, "Event", event.Name)
	assert.Equal(t, "CompSci", event.Theme)
	assert.Equal(t, desc, event.Description)
	assert.Equal(t, "org.org", event.Organization)
	assert.Equal(t, start, event.StartDate)
	assert.Equal(t, end, event.EndDate)
	assert.Equal(t, "Faro", event.Location)
	assert.Nil(t, err)
}

func TestNewEventFields3(t *testing.T) {
	var name = ""
	var theme = "CompSci"
	var desc = "Computer Science Event in Faro."
	var org = "org.org"
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}

func TestNewEventFields4(t *testing.T) {
	var name = "Event"
	var theme = ""
	var desc = "Computer Science Event in Faro."
	var org = "org.org"
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}

func TestNewEventFields5(t *testing.T) {
	var name = "Event"
	var theme = "CompSci"
	var desc = ""
	var org = "org.org"
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}

func TestNewEventFields7(t *testing.T) {
	var name = "Event"
	var theme = "CompSci"
	var desc = "Computer Science Event in Faro."
	var org = ""
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}

func TestNewEventFields8(t *testing.T) {
	var name = "Event"
	var theme = "CompSci"
	var desc = "Computer Science Event in Faro."
	var org = "org.org"
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var local = ""
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}

func TestNewEventFields9(t *testing.T) {
	var name = "Event"
	var theme = "CompSci"
	var desc = "Computer Science Event in Faro."
	var org = "org.org"
	var owner = *exampleUser
	var start = time.Date(1, time.January, 1, 0, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}

func TestNewEventFields10(t *testing.T) {
	var name = "Event"
	var theme = "CompSci"
	var desc = "Computer Science Event in Faro."
	var org = "org.org"
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var end = time.Date(0, time.January, 0, 0, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}

func TestNewEventFields11(t *testing.T) {
	var name = "Event"
	var theme = "CompSci"
	var desc = "Computer Science Event in Faro."
	var org = "org.org"
	var owner = *exampleUser
	var start = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}

func TestNewEventFields12(t *testing.T) {
	var name = "Event"
	var theme = "CompSci"
	var desc = "Computer Science Event in Faro."
	var org = "org.org"
	var owner, _ = NewUser("Test", "Test", "Student", "test@mail.com", examplePass)
	var start = time.Date(2026, time.March, 20, 21, 0, 0, 0, time.UTC)
	var end = time.Date(2026, time.March, 20, 9, 0, 0, 0, time.UTC)
	var local = "Faro"
	event := newEvent(name, theme, desc, org, *owner, start, end, local)
	err := event.validate()
	assert.NotNil(t, event)
	assert.NotNil(t, err)
}
