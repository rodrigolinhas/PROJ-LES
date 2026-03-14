/*
user_test.go defines the automated tests to confirm the behavior,
initialization, and validation logic of the User model.
*/
package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewDiscountCode(t *testing.T) {
	code := "ABCDE20"
	disType := "PercEnTaGe"
	value := int64(20)
	maxUses := 5

	var result, _ = NewDiscountCode(code, disType, value, maxUses)

	assert.NotNil(t, result)

	assert.Equal(t, code, result.Code)
	assert.Equal(t, PercentageDiscount, result.Type)
	assert.Equal(t, value, result.Value)
	assert.Equal(t, maxUses, result.MaxUses)
	assert.True(t, result.IsActive)
}

func TestNewDiscountCode2(t *testing.T) {
	code := "ABCDE20"
	disType := ""
	value := int64(20)
	maxUses := 5

	var result, err = NewDiscountCode(code, disType, value, maxUses)

	assert.Nil(t, result)
	assert.EqualError(t, err, "NewDiscountCode: Invalid type of discount")
}

func TestNewDiscountCode3(t *testing.T) {
	code := "ABCDE20"
	disType := "PercEnTaGe"
	value := int64(1000)
	maxUses := 5

	var result, err = NewDiscountCode(code, disType, value, maxUses)

	assert.Nil(t, result)
	assert.EqualError(t, err, "NewDiscountCode: Percentage cannot be greater than 100")
}

func TestNewDiscountCode4(t *testing.T) {
	code := "ABCDE20"
	disType := "PercEnTaGe"
	value := int64(-10)
	maxUses := 5

	var result, err = NewDiscountCode(code, disType, value, maxUses)

	assert.Nil(t, result)
	assert.EqualError(t, err, "NewDiscountCode: Invalid Value of discount (<= 0) ")
}

func TestNewDiscountCode5(t *testing.T) {
	code := "ABCDE20"
	disType := "absolute"
	value := int64(5)
	maxUses := 5

	var result, _ = NewDiscountCode(code, disType, value, maxUses)

	assert.NotNil(t, result)

	assert.Equal(t, code, result.Code)
	assert.Equal(t, FixedDiscount, result.Type)
	assert.Equal(t, value, result.Value)
	assert.Equal(t, maxUses, result.MaxUses)
	assert.True(t, result.IsActive)
}
