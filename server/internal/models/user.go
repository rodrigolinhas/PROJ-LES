package models

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FirstName		string 	`gorm:"not null"`
	LastName		string 	`gorm:"not null"`
	Role			Role   	`gorm:"not null"`
	Email 			string 	`gorm:"uniqueIndex;not null"`
	HashedPassword	string 	`gorm:"not null"`
	SessionToken 	string
	CSRFToken		string
}

type Role uint

const (
	None Role = iota
	Student
	Professor
	EventOrganizer
)

var EmailRegex string = `(?:[a-z0-9!#$%&'*+/=?^_` + "`" + `{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_` + "`" + `{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])`

//TODO: TEST
func NewUser(firstName string, lastName string, role string, email string, hashedPass string) (*User, error) {
	firstName = strings.TrimSpace(firstName)
	lastName = strings.TrimSpace(lastName)
	email = strings.TrimSpace(email)

	if(firstName == "" || lastName == "") {
		return nil, errors.New("NewUser: Empty Name")
	}

	ok, err := regexp.MatchString(EmailRegex, email)
	if(!ok) {
		if(err != nil) {
			fmt.Println(err.Error())
		}
		return nil, errors.New("NewUser: Email doesnt match regex")
	}

	if(len(hashedPass) < 59) {
		return nil, errors.New("NewUser: Hashed Password is too short")
	}

	var roleEnum Role = None
	switch(role) {
		case "none":
			roleEnum = None
		case "student":
			roleEnum = Student
		case "professor":
			roleEnum = Professor
		case "event_organizer":
			roleEnum = EventOrganizer
		default:
			return nil, errors.New("NewUser: Invalid Role")
	}

	user := User{
		FirstName: firstName,
		LastName: lastName,
		Role: roleEnum,
		Email: email,
		HashedPassword: hashedPass,
	}
	return &user, nil
}

func (this User) FullName() string {
	return this.FirstName + " " + this.LastName
}
