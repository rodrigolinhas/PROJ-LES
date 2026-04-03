/*
tag.go defines the database table and structural model for article tags.
It includes the Tag struct, initialization functions, and validation logic
for tag attributes like name, code, and category.
*/

package models

import (
	"errors"
	"strings"

	"gorm.io/gorm"
)

type TagCategory uint

const (
	TopicTag TagCategory = iota
	TrackTag
	ApplicationDomainTag
)

var TagCategoryMap = map[string]TagCategory{
	"topic":              TopicTag,
	"track":              TrackTag,
	"application_domain": ApplicationDomainTag,
}

type Tag struct {
	gorm.Model

	Name     string      `gorm:"not null"`
	Code     string      `gorm:"not null;uniqueIndex"`
	Category TagCategory `gorm:"not null"`
	IsActive bool        `gorm:"not null;default:true"`
	Articles []Article   `gorm:"many2many:article_tags;"`
}

func NewTag(name string, code string, category string) (*Tag, error) {
	name = strings.TrimSpace(name)
	code = strings.TrimSpace(strings.ToUpper(code))
	category = strings.TrimSpace(strings.ToLower(category))

	if name == "" {
		return nil, errors.New("NewTag: Empty name of tag")
	}

	if code == "" {
		return nil, errors.New("NewTag: Empty code of tag")
	}

	categoryEnum, valid := TagCategoryMap[category]
	if !valid {
		return nil, errors.New("NewTag: Invalid category tag")
	}

	tag := Tag{
		Name:     name,
		Code:     code,
		Category: categoryEnum,
		IsActive: true,
	}

	return &tag, nil
}
