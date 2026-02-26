package models

import (
	"errors"
	"fmt"
	"regexp"

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

//TODO: usar um regex melhor
var EmailRegex string = `^\S+@\S+\.\S+$`

//TODO: TEST
func NewUser(firstName string, lastName string, role string, email string, hashedPass string) (*User, error) {
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

	if(hashedPass == "") {
		return nil, errors.New("NewUser: Empty Password")
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
