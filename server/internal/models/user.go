/*
user.go defines the database table and structural model for users in the system.
It includes the User struct, initialization functions, and validation logic
for user attributes like email and role.
*/

package models

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"gorm.io/gorm"
)

// User represents a system user and maps to the underlying database table.
// It includes authentication details, role-based access control flags, and timestamps.
type User struct {
	gorm.Model            //gorm.Model already includes the following fields: ID, CreatedAt, UpdatedAt, DeletedAt
	FirstName      string `gorm:"not null"`
	LastName       string `gorm:"not null"`
	Role           Role   `gorm:"not null;default:0"`
	Email          string `gorm:"uniqueIndex;not null"`
	Verified       bool   `gorm:"not null;default:false"`
	HashedPassword string // nullable for OAuth users
	Provider       string `gorm:"default:'local'"`
	ProviderUserID string
	SessionToken   string
	CSRFToken      string
}

type Role uint

const (
	None Role = iota
	Student
	Professor
	EventOrganizer
)

// INFO: Change keys based on frontend form
var RoleMap = map[string]Role{
	"none":           None,
	"Student":        Student,
	"Professor":      Professor,
	"EventOrganizer": EventOrganizer,
}

var RoleName = map[Role]string{
	None:           "None",
	Student:        "Student",
	Professor:      "Professor",
	EventOrganizer: "EventOrganizer",
}

var EmailRegex string = `(?:[a-z0-9!#$%&'*+/=?^_` + "`" + `{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_` + "`" + `{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])`

// NewUser creates and returns a new User instance.
// It initializes the User struct and runs validations on the parameters.
//
// Parameters:
//
//	 firstName:	The user's first name;
//	 lastName: 	The user's last name;
//		role:  		The user's assigned role as a string (must be a valid Role, as per the Role type);
//		email: 		The user's email address (must be a valid format);
//		hashedPass: The user's already hashed password.
//
// Returns:
//
//	A pointer to the created User, or an error if validation fails.
func NewUser(firstName string, lastName string, role string, email string, hashedPass string) (*User, error) {
	firstName = strings.TrimSpace(firstName)
	lastName = strings.TrimSpace(lastName)
	email = strings.TrimSpace(email)

	if firstName == "" || lastName == "" {
		return nil, errors.New("NewUser: Empty Name")
	}

	ok, err := regexp.MatchString(EmailRegex, email)
	if !ok {
		if err != nil {
			fmt.Println(err.Error())
		}
		return nil, errors.New("NewUser: Email doesnt match regex")
	}

	if len(hashedPass) < 59 {
		return nil, errors.New("NewUser: Hashed Password is too short")
	}

	roleEnum, valid := RoleMap[role]
	if !valid {
		return nil, errors.New("NewUser: Invalid Role")
	}

	user := User{
		FirstName:      firstName,
		LastName:       lastName,
		Role:           roleEnum,
		Email:          email,
		Verified:       false,
		HashedPassword: hashedPass,
	}
	return &user, nil
}

// NewOAuthUser creates a User from an OAuth provider (no password required).
func NewOAuthUser(firstName string, lastName string, email string, provider string, providerUserID string) (*User, error) {
	firstName = strings.TrimSpace(firstName)
	lastName = strings.TrimSpace(lastName)
	email = strings.TrimSpace(email)

	if firstName == "" {
		firstName = "User"
	}

	ok, err := regexp.MatchString(EmailRegex, email)
	if !ok {
		if err != nil {
			fmt.Println(err.Error())
		}
		return nil, errors.New("NewOAuthUser: Email doesnt match regex")
	}

	user := User{
		FirstName:      firstName,
		LastName:       lastName,
		Role:           None,
		Email:          email,
		Verified:       true,
		Provider:       provider,
		ProviderUserID: providerUserID,
	}
	return &user, nil
}

func (this User) FullName() string {
	return this.FirstName + " " + this.LastName
}
