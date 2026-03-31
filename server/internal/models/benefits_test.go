package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewBenefit(t *testing.T) {
	name := "Gala Dinner"

	res, err := NewBenefit(name)

	assert.NotNil(t, res)
	assert.Nil(t, err)
	assert.Equal(t, name, res.Name)
}

func TestMultipleBenefits(t *testing.T) {
	name := "Gala Dinner, Coffee Break"

	res, err := ParseBenefits(name)
	assert.NotNil(t, res)
	assert.Nil(t, err)
	assert.Equal(t, 2, len(res))
	assert.Equal(t, "Gala Dinner", res[0].Name)
	assert.Equal(t, "Coffee Break", res[1].Name)
}

func TestNewBenefitEmptyName(t *testing.T) {
	name := "   "

	res, err := NewBenefit(name)

	assert.Nil(t, res)
	assert.NotNil(t, err)
	assert.Equal(t, "Benefit: empty name", err.Error())
}

func TestMultipleBenefits1(t *testing.T) {
	name := "Gala Dinner, test"

	res, err := ParseBenefits(name)
	assert.NotNil(t, res)
	assert.Nil(t, err)
	assert.Equal(t, 2, len(res))
	assert.Equal(t, "Gala Dinner", res[0].Name)
	assert.Equal(t, "test", res[1].Name)
}

func TestNonExistentBenefit(t *testing.T) {
	name := "test"

	res, err := NewBenefit(name)

	assert.NotNil(t, res)
	assert.Nil(t, err)
	assert.Equal(t, name, res.Name)
}
