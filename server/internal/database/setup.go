package database

import (
	"fmt"
	"gorm.io/gorm"
	"gorm.io/driver/sqlite"

	"LES/server/internal/models"
)

var DB *gorm.DB

func ConnectDB() {
	database, err := gorm.Open(sqlite.Open("dev.db"), &gorm.Config{}) 
	if err != nil {
		panic("Can't connect to database!")
	}

	// Migrate tables
	err = database.AutoMigrate(&models.Ping{})
	if err != nil {
		fmt.Println("Failed to migrate: Ping")
	}

	DB = database
}
