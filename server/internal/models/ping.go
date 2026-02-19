package models

import (
	"time"
)

type Ping struct {
	ID		uint		`json:"id" gorm:"primaryKey"`
	Time	time.Time	`json:"time"`
}
