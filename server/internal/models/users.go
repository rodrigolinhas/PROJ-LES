/*
users.go defines the database table and structural model for users in the system.
It includes the User struct, initialization functions, and validation logic
for user attributes like email and role.
*/

package models

import (
	"fmt"
	"regexp"
	"time"
)

// User represents a system user and maps to the underlying database table.
// It includes authentication details, role-based access control flags, and timestamps.
type User struct {
	ID        uint   `gorm:"primaryKey"`
	CreatedAt string `gorm:"not null"`
	UpdatedAt string `gorm:"not null"`
	Email     string `gorm:"uniqueIndex;not null"`
	Role      string `gorm:"not null;default:Participant"`
	Verified  bool   `gorm:"not null;default:false"`
}

// NewUser creates and returns a new User instance.
// It initializes timestamps in RFC3339Nano format and runs validations
// on the provided email and role.
//
// Parameters:
//
//	email: The user's email address (must be a valid format).
//	role:  The user's assigned role, i.e. "Admin", "Participant" and "Lecturer".
//
// Returns:
//
//	A pointer to the created User, or an error if validation fails.
func NewUser(email string, role string) (*User, error) {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	user := &User{
		Email:     email,
		Role:      role,
		Verified:  false,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Checking if email and role are valid
	if err := user.Validate(); err != nil {
		return nil, err
	}
	if err := user.ValidateRole(); err != nil {
		return nil, err
	}

	return user, nil
}

// Validate checks if the User's email conforms to a standard email regex pattern.
//
// Returns:
//
//	An error if the email format is invalid, otherwise nil.
func (u *User) Validate() error {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !re.MatchString(u.Email) {
		return fmt.Errorf("invalid email")
	}
	return nil
}

// ValidateRole checks if the User's role matches one of the accepted system roles.
//
// Returns:
//
//	An error if the role is not "Admin", "Participant", or "Lecturer", otherwise nil.
func (u *User) ValidateRole() error {

	validRoles := []string{"Admin", "Participant", "Lecturer"}
	for _, role := range validRoles {
		if u.Role == role {
			return nil
		}
	}
	return fmt.Errorf("invalid role")
}
