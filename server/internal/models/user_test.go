package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var examplePass = "$2a$10$7yMENToziU425C8qLoBAJ.WNnTIcysarw/y./qLr1Je8uGC8NsF4m"

func TestNewUser1(t *testing.T) {
	var fname = "Jake"
	var lname = "Felix"
	var role = "student"
	var email = "jfelix@gmail.com"
	user, err := NewUser(fname, lname, role, email, examplePass)
	assert.NotNil(t, user)
	assert.Equal(t, fname, user.FirstName)
	assert.Equal(t, lname, user.LastName)
	assert.Equal(t, Student, user.Role)
	assert.Equal(t, email, user.Email)
	assert.Equal(t, examplePass, user.HashedPassword)
	assert.Nil(t, err)
}

func TestNewUser2(t *testing.T) {
	var fname = "T"
	var lname = "T"
	var role = "professor"
	var email = "tt@gmail.com"
	user, err := NewUser(fname, lname, role, email, examplePass)
	assert.NotNil(t, user)
	assert.Equal(t, fname, user.FirstName)
	assert.Equal(t, lname, user.LastName)
	assert.Equal(t, Professor, user.Role)
	assert.Equal(t, email, user.Email)
	assert.Equal(t, examplePass, user.HashedPassword)
	assert.Nil(t, err)
}

func TestNewUser3(t *testing.T) {
	var fname = "John"
	var lname = ""
	var role = "student"
	var email = "john@gmail.com"
	user, err := NewUser(fname, lname, role, email, examplePass)
	assert.Nil(t, user)
	assert.NotNil(t, err)
}

func TestNewUser4(t *testing.T) {
	var fname = "    "
	var lname = "Doe"
	var role = "student"
	var email = "doe@gmail.com"
	user, err := NewUser(fname, lname, role, email, examplePass)
	assert.Nil(t, user)
	assert.NotNil(t, err)
}

func TestNewUser5(t *testing.T) {
	var fname = "Didi"
	var lname = "Bandeiras"
	var role = "baker"
	var email = "didi@gmail.com"
	user, err := NewUser(fname, lname, role, email, examplePass)
	assert.Nil(t, user)
	assert.NotNil(t, err)
}

func TestNewUser6(t *testing.T) {
	var fname = "João"
	var lname = "Maria"
	var role = "student"
	var email = "maria@joao"
	user, err := NewUser(fname, lname, role, email, examplePass)
	assert.Nil(t, user)
	assert.NotNil(t, err)
}

func TestNewUser7(t *testing.T) {
	var fname = "Pedro"
	var lname = "Ezequiel"
	var role = "student"
	var email = "pedroe@outlook.com"
	user, err := NewUser(fname, lname, role, email, "12345678")
	assert.Nil(t, user)
	assert.NotNil(t, err)
}

func TestFullName(t *testing.T) {
	var fname = "Jake"
	var lname = "Felix"
	var role = "student"
	var email = "jfelix@gmail.com"
	user, _ := NewUser(fname, lname, role, email, examplePass)
	assert.Equal(t, "Jake Felix", user.FullName())
}
