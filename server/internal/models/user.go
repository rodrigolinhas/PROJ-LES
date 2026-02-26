package models

import (
	"errors"
	"gorm.io/gorm"
	"regexp"
)

type User struct {
	gorm.Model
	FirstName		string 	`gorm:"not null"`
	LastName		string 	`gorm:"not null"`
	Role			Role   	`gorm:"not null"`
	Email 			string 	`gorm:"uniqueIndex;not null"`
	HashedPassword	string 	`gorm:"not null"`
}

type Role uint

const (
	Invalid Role = iota
	Student
	Professor
	EventOrganizer
)

var EmailRegex string = "/ ^((?!\\.)[\\w\\-_.]*[^.])(@\\w+)(\\.\\w+(\\.\\w+)?[^.\\W])$ / gm"

func NewUser(firstName string, lastName string, role Role, email string, hashedPass string) (*User, error) {
	if(firstName == "" || lastName == "") {
		return nil, errors.New("NewUser: Empty Name")
	}

	ok, _ := regexp.MatchString(EmailRegex, email)
	if(!ok) {
		return nil, errors.New("NewUser: Email doesnt match regex")
	}

	if(hashedPass == "") {
		return nil, errors.New("NewUser: Empty Password")
	}

	user := User{
		FirstName: firstName,
		LastName: lastName,
		Role: role,
		Email: email,
		HashedPassword: hashedPass,
	}
	return &user, nil
}

func (this User) FullName() string {
	return this.FirstName + " " + this.LastName
}
