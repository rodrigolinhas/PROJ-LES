package models

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestNewArticle1(t *testing.T) {
	title := "title"
	user := *exampleUser
	pub := "publisher"
	url := "publisher.com/article"
	art, err := NewArticle(title, user, pub, url)
	assert.NotNil(t, art)
	assert.Nil(t, err)
	assert.Equal(t, title, art.Title)
	assert.Equal(t, user, art.FirstAuthor)
	assert.Equal(t, pub, art.Publisher)
	assert.Equal(t, url, art.URL)
}

func TestNewArticle2(t *testing.T) {
	title := "title    "
	user := *exampleUser
	pub := "    publisher"
	url := " publisher.com/article  "
	art, err := NewArticle(title, user, pub, url)
	assert.NotNil(t, art)
	assert.Nil(t, err)
	assert.Equal(t, "title", art.Title)
	assert.Equal(t, user, art.FirstAuthor)
	assert.Equal(t, "publisher", art.Publisher)
	assert.Equal(t, "publisher.com/article", art.URL)
}

func TestNewArticle3(t *testing.T) {
	title := "   "
	user := *exampleUser
	pub := "publisher"
	url := "publisher.com/article"
	art, err := NewArticle(title, user, pub, url)
	assert.Nil(t, art)
	assert.NotNil(t, err)
}

func TestNewArticle4(t *testing.T) {
	title := "title"
	user := *exampleUser
	pub := ""
	url := "publisher.com/article"
	art, err := NewArticle(title, user, pub, url)
	assert.Nil(t, art)
	assert.NotNil(t, err)
}

func TestNewArticle5(t *testing.T) {
	title := "title"
	user := *exampleUser
	pub := "pub"
	url := ""
	art, err := NewArticle(title, user, pub, url)
	assert.Nil(t, art)
	assert.NotNil(t, err)
}

func TestCoAuthors1(t *testing.T) {
	user := *exampleUser
	art, err := NewArticle("title", user, "pub", "url")
	assert.NotNil(t, art)
	assert.Nil(t, err)

	coauthor := *exampleStu
	err = art.AddCoAuthor(coauthor)
	assert.Nil(t, err)
	assert.Contains(t, art.CoAuthors, coauthor)
}

func TestCoAuthors2(t *testing.T) {
	user := *exampleUser
	art, err := NewArticle("title", user, "pub", "url")
	assert.NotNil(t, art)
	assert.Nil(t, err)

	coauthor := *exampleStu
	err = art.AddCoAuthor(coauthor)
	err = art.AddCoAuthor(coauthor)
	assert.NotNil(t, err)
}

func TestCoAuthors3(t *testing.T) {
	user := *exampleUser
	art, err := NewArticle("title", user, "pub", "url")
	assert.NotNil(t, art)
	assert.Nil(t, err)

	err = art.AddCoAuthor(user)
	assert.NotNil(t, err)
}

func TestCoAuthors4(t *testing.T) {
	user := *exampleUser
	art, err := NewArticle("title", user, "pub", "url")
	assert.NotNil(t, art)
	assert.Nil(t, err)

	coauthors := []User{*exampleStu, *exampleOrg}
	res := art.AddCoAuthors(coauthors)
	assert.Equal(t, 2, res)
}

func TestCoAuthors5(t *testing.T) {
	user := *exampleUser
	art, err := NewArticle("title", user, "pub", "url")
	assert.NotNil(t, art)
	assert.Nil(t, err)

	coauthors := []User{*exampleOrg, *exampleOrg}
	res := art.AddCoAuthors(coauthors)
	assert.Equal(t, 1, res)
}

func TestCoAuthors6(t *testing.T) {
	user := *exampleUser
	art, err := NewArticle("title", user, "pub", "url")
	assert.NotNil(t, art)
	assert.Nil(t, err)

	coauthors := []User{}
	res := art.AddCoAuthors(coauthors)
	assert.Equal(t, 0, res)
}
