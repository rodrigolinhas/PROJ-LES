package models

import (
	"errors"
	"strings"

	"gorm.io/gorm"
)

type Article struct {
	gorm.Model
	Title           string `gorm:"not null"`
	FirstAuthor     User   `gorm:"not null"`
	FirstAuthorID   uint   `gorm:"not null"`
	CoAuthors       []User `gorm:"many2many:article_coauthors"`
	Publisher       string `gorm:"not null"`
	DOI             string
	ISBN            string
	URL             string        `gorm:"not null"`
	EventActivity   EventActivity `gorm:"not null"`
	EventActivityID uint          `gorm:"not null"`
	Tag             []Tag         `gorm:"many2many:article_tag"`
}

// TODO: Test this function
func NewArticle(title string, author User, publisher string, url string) (*Article, error) {
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
		Title:       title,
		FirstAuthor: author,
		Publisher:   publisher,
		URL:         url,
	}, nil
}

// TODO: Test this method
func (this *Article) AddCoAuthor(author User) error {
	if author == this.FirstAuthor {
		return errors.New("This user is already the first author")
	}

	for _, v := range this.CoAuthors {
		if author == v {
			return errors.New("This user is already a co-author")
		}
	}

	this.CoAuthors = append(this.CoAuthors, author)
	return nil
}

// TODO: Test this method
// Adds co-authors to an article, and returns the number of authors added
// successfully.
func (this *Article) AddCoAuthors(authors []User) int {
	count := 0
	for _, v := range authors {
		err := this.AddCoAuthor(v)
		if err == nil {
			count++
		}
	}
	return count
}
