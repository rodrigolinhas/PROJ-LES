package database

import (
	"errors"
	"log"

	"LES/server/internal/models"

	"gorm.io/gorm"
)

func SeedTags() {
	defaultTags := []struct {
		Name     string
		Code     string
		Category string
	}{
		//topic tags
		{Name: "Artificial Intelligence", Code: "AI", Category: "topic"},
		{Name: "Machine Learning", Code: "ML", Category: "topic"},
		{Name: "Data Science", Code: "DS", Category: "topic"},
		{Name: "Software Engineering", Code: "SE", Category: "topic"},
		{Name: "Human-Computer Interaction", Code: "HCI", Category: "topic"},
		{Name: "Cybersecurity", Code: "CYBERSEC", Category: "topic"},
		{Name: "Computer Networks", Code: "NETWORKS", Category: "topic"},
		{Name: "Internet of Things", Code: "IOT", Category: "topic"},
		{Name: "Cloud Computing", Code: "CLOUD", Category: "topic"},
		{Name: "Data Management", Code: "DB", Category: "topic"},

		//track tags
		{Name: "Research Track", Code: "RESEARCH", Category: "track"},
		{Name: "Industry Track", Code: "INDUSTRY", Category: "track"},
		{Name: "Student Track", Code: "STUDENT", Category: "track"},
		{Name: "Doctoral Consortium", Code: "DOCTORAL", Category: "track"},

		//application domain tags
		{Name: "Healthcare", Code: "HEALTHCARE", Category: "application_domain"},
		{Name: "Education", Code: "EDUCATION", Category: "application_domain"},
		{Name: "Smart Cities", Code: "SMART_CITIES", Category: "application_domain"},
		{Name: "Sustainability", Code: "SUSTAINABILITY", Category: "application_domain"},
		{Name: "Industry 4.0", Code: "INDUSTRY_4_0", Category: "application_domain"},
		{Name: "Agriculture", Code: "AGRICULTURE", Category: "application_domain"},
	}

	for _, v := range defaultTags {
		tag, err := models.NewTag(v.Name, v.Code, v.Category)
		if err != nil {
			log.Printf("Error creating tag %s: %v\n", v.Code, err)
			continue
		}

		var existing models.Tag
		result := DB.Where("code = ?", tag.Code).First(&existing)

		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			createResult := DB.Create(tag)
			if createResult.Error != nil {
				log.Printf("Error saving tag %s to DB: %v\n", tag.Code, createResult.Error)
			}
		} else if result.Error != nil {
			log.Printf("Error searching tag %s in DB: %v\n", tag.Code, result.Error)
		}
	}
}
