package models

import (
	"errors"
	"strings"

	"gorm.io/gorm"
)

// Benefit represents a specific perk, access right, or service included in a registration type.
// It maps to the database table through GORM and ensures benefits are uniquely defined by their name.
type Benefit struct {
	gorm.Model
	Name string `gorm:"uniqueIndex;not null"`
}

// DefaultBenefits holds the baseline set of benefits that are available globally.
// This allows the event creation UI or API to offer these common options out-of-the-box.
var DefaultBenefits = []string{
	"Gala Dinner",
	"Accommodation",
	"Lunch",
	"Coffee Break",
	"Welcome Drink",
	"Breakfast",
	"Giveaways",
	"Brand Visibility",
	"Networking Access",
	"Exclusive Books",
	"Wi-Fi Access",
	"Refreshments",
	"Transport Shuttle",
	"VIP Seating",
	"Certificate of Participation",
	"Conference Kit",
	"Promotional Materials",
	"Booth Space",
}

// IsValidBenefit checks if the given benefit name is within the DefaultBenefits list.
func IsValidBenefit(name string) bool {
	for _, b := range DefaultBenefits {
		if b == name {
			return true
		}
	}
	return false
}

// NewBenefit creates and returns a new Benefit instance, validating that the name is not empty
// and belongs to the predefined list of benefits.
//
// Parameters:
//
//	name: The name of the benefit to create.
//
// Returns:
//
//	A pointer to the created Benefit, or an error if validation fails.
func NewBenefit(name string) (*Benefit, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, errors.New("Benefit: empty name")
	}

	benefit := &Benefit{
		Name: name,
	}

	return benefit, nil
}

// ParseBenefits takes a comma-separated string of benefits, processes each one,
// and returns a slice of Benefit structs. It returns an error if any benefit is invalid.
//
// Parameters:
//
//	benefitsStr: The comma-separated string of benefits (e.g. "Gala Dinner, Lunch").
//
// Returns:
//
//	A slice of Benefits, or an error if validation fails for any item.
func ParseBenefits(benefitsStr string) ([]Benefit, error) {
	benefitsStr = strings.TrimSpace(benefitsStr)
	if benefitsStr == "" {
		return []Benefit{}, nil
	}

	parts := strings.Split(benefitsStr, ",")
	var benefits []Benefit

	for _, part := range parts {
		b, err := NewBenefit(part)
		if err != nil {
			return nil, err
		}
		if b != nil {
			benefits = append(benefits, *b)
		}
	}

	return benefits, nil
}

// SeedBenefits populates the database with the predefined DefaultBenefits.
// It uses FirstOrCreate to ensure that the benefits are only inserted if they don't already exist.
//
// Parameters:
//
//	db: The GORM database instance to run the seeding on.
//
// Returns:
//
//	An error if the initial seeding fails.
func SeedBenefits(db *gorm.DB) error {
	for _, name := range DefaultBenefits {
		if err := db.FirstOrCreate(&Benefit{Name: name}, Benefit{Name: name}).Error; err != nil {
			return err
		}
	}
	return nil
}
