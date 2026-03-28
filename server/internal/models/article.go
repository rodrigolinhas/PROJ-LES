package models

import (
	"errors"
	"strings"

	"gorm.io/gorm"
)

type Article struct {
	gorm.Model
	Title 			string 			`gorm:"not null"`
	FirstAuthor		User 			`gorm:"not null"`
	CoAuthors		[]User 			
	Publisher 		string 			`gorm:"not null"`
	DOI				string 			
	ISBN			string 			
	URL				string 			`gorm:"not null"`
	ActivityID		uint 			`gorm:"not null"`
	Activity		EventActivity 	`gorm:"not null"`
	// Tags			[]Tags
}

func NewArticle(title string, author User, publisher string, url string) (*Article, error){
	title = strings.TrimSpace(title)
	publisher = strings.TrimSpace(publisher)
	url = strings.TrimSpace(url)

	if title == "" {
		return nil, errors.New("Article: No title")
	}

	if publisher == "" {
		return nil, errors.New("Article: No publisher")
	}

	if url == "" {
		return nil, errors.New("Article: No URL")
	}
	return &Article{
		Title: title,
		FirstAuthor: author,
		Publisher: publisher,
		URL: url,
	}, nil
}
