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
	Tags            []Tag         `gorm:"many2many:article_tags"`
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

func (this *Article) AddTag(tag Tag) error {
	if tag.Code == "" {
		return errors.New("this code are empty, that's a invalid tag")
	}

	for _, v := range this.Tags {
		if v.Code == tag.Code {
			return errors.New("this tag is already associated with the article")
		}
	}

	this.Tags = append(this.Tags, tag)
	return nil
}

func (this *Article) AddTags(tags []Tag) int {
	count := 0
	for _, v := range tags {
		err := this.AddTag(v)
		if err == nil {
			count++
		}
	}
	return count
}

func (this *Article) RemoveTag(tag Tag) error {
	if tag.Code == "" {
		return errors.New("this code are empty, that's a invalid tag")
	}

	for i, v := range this.Tags {
		if v.Code == tag.Code {
			this.Tags = append(this.Tags[:i], this.Tags[i+1:]...)
			return nil
		}
	}

	return errors.New("this tag is not associated with the article")
}

func (this *Article) RemoveTags(tags []Tag) int {
	count := 0
	for _, v := range this.Tags {
		err := this.RemoveTag(v)
		if err == nil {
			count++
		}
	}

	return count
}
