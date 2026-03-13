/*
discount_code.go defines the database table and structural model for discount codes.
It includes the DiscountCode struct, initialization functions, and validation logic
for discount code attributes like code and type.
*/

package models

import (
	"errors"
	"strings"

	"gorm.io/gorm"
)

type DiscountCode struct {
	gorm.Model

	Code      string       `gorm:"uniqueIndex;not null"`
	Type      DiscountType `gorm:"not null"`
	Value     int64        `gorm:"not null"`
	MaxUses   int          `gorm:"not null"`
	UsesCount int          `gorm:"not null;default:0"`
	IsActive  bool         `gorm:"not null;default:true"`
}

type DiscountType uint

const (
	PercentageDiscount DiscountType = iota
	FixedDiscount
)

var DiscountTypeMap = map[string]DiscountType{
	"absolute":   FixedDiscount,
	"percentage": PercentageDiscount,
}

// NewDiscountCode creates and returns a new DiscountCode instance.
// It initializes the DiscountCode struct and runs validations on the parameters.
//
// Parameters:
//
//	code:         The discount code string;
//	discountType: The discount type as a string (must be a valid DiscountType);
//	value:        The discount value;
//	maxUses:      The maximum number of times the code can be used.
//
// Returns:
//
//	A pointer to the created DiscountCode, or an error if validation fails.
func NewDiscountCode(code string, discountType string, value int64, maxUses int) (*DiscountCode, error) {
	code = strings.TrimSpace(strings.ToUpper(code))
	discountType = strings.TrimSpace(strings.ToLower(discountType))
	
	if code == "" {
		return nil, errors.New("NewDiscountCode: Empty Code")
	}

	typeEnum, valid := DiscountTypeMap[discountType]
	if !valid {
		return nil, errors.New("NewDiscountCode: Invalid type of discount")
	}

	if value <= 0 {
		return nil, errors.New("NewDiscountCode: Invalid Value of discount (<= 0) ")
	}

	if typeEnum == PercentageDiscount && value > 100 {
		return nil, errors.New("NewDiscountCode: Percentage cannot be greater than 100")
	}

	if maxUses <= 0 {
		return nil, errors.New("NewDiscountCode: Invalid Max Uses")
	}

	discountCode := DiscountCode{
		Code:      code,
		Type:      typeEnum,
		Value:     value,
		MaxUses:   maxUses,
		UsesCount: 0,
		IsActive:  true,
	}

	return &discountCode, nil
}
