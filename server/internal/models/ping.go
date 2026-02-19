package models

import (
	"time"
)

type Ping struct {
	ID		uint		`json:"id" gorm:"primaryKey"`
	Time	time.Time	`json:"time"`
}

func NewPing() *Ping {
	ping := Ping{Time: time.Now()}
	return &ping
}
