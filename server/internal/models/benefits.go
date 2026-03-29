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

// NewBenefit creates and returns a new Benefit instance, validating that the name is not empty.
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
