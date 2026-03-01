package utils

import (
	"golang.org/x/crypto/bcrypt"
)

const COST_FACTOR int = 10

func HashPassword(pass string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(pass), COST_FACTOR)
	return string(hashed), err
}
