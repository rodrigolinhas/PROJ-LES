package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewRegistrationType1(t *testing.T) {
	eventid := 1
	name := "Fast Pass"
	desc := "Sample Description"
	price := 10.0
	res, err := NewRegistrationType(uint(eventid), name, desc, price)
	assert.NotNil(t, res)
	assert.Nil(t, err)
	assert.Equal(t, uint(eventid), res.EventID)
	assert.Equal(t, name, res.Name)
	assert.Equal(t, desc, res.Description)
	assert.Equal(t, price, res.Price)
}

func TestNewRegistrationType2(t *testing.T) {
	eventid := 1
	name := "Pass    "
	desc := "    Description"
	price := 10.0
	res, err := NewRegistrationType(uint(eventid), name, desc, price)
	assert.NotNil(t, res)
	assert.Nil(t, err)
	assert.Equal(t, uint(eventid), res.EventID)
	assert.Equal(t, "Pass", res.Name)
	assert.Equal(t, "Description", res.Description)
	assert.Equal(t, price, res.Price)
}

func TestNewRegistrationType3(t *testing.T) {
	eventid := 1
	name := ""
	desc := "Sample Description"
	price := 10.0
	res, err := NewRegistrationType(uint(eventid), name, desc, price)
	assert.Nil(t, res)
	assert.NotNil(t, err)
}

func TestNewRegistrationType4(t *testing.T) {
	eventid := 1
	name := "Pass"
	desc := ""
	price := 10.0
	res, err := NewRegistrationType(uint(eventid), name, desc, price)
	assert.Nil(t, res)
	assert.NotNil(t, err)
}

func TestNewRegistrationType5(t *testing.T) {
	eventid := 1
	name := "Pass"
	desc := "Description"
	price := -1.0
	res, err := NewRegistrationType(uint(eventid), name, desc, price)
	assert.Nil(t, res)
	assert.NotNil(t, err)
}
