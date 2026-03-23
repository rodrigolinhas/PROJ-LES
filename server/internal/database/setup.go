package database

import (
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"LES/server/internal/models"
)

var DB *gorm.DB

func ConnectDB() {
	database, err := gorm.Open(sqlite.Open("dev.db"), &gorm.Config{})
	if err != nil {
		panic("Can't connect to database! " + err.Error())
	}

	// Migrate tables
	err = database.AutoMigrate(
		&models.Ping{},
		&models.User{},
		&models.Event{},
		&models.EventActivity{},
		&models.DiscountCode{},
		&models.EventRegistration{},
		&models.RegistrationType{},
	)

	if err != nil {
		fmt.Println("Failed to migrate tables", err)
	}

	DB = database
}
