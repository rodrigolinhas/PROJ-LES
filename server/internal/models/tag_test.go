/*
Tag_test.go defines the automated tests to confirm the behavior,
initialization, and validation logic of the Tag model.
*/

package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewTag(t *testing.T) {
	name := "Artificial Intelligence"
	code := "AI"
	category := "ToPiC"

	var result, _ = NewTag(name, code, category)

	assert.NotNil(t, result)

	assert.Equal(t, name, result.Name)
	assert.Equal(t, code, result.Code)
	assert.Equal(t, TopicTag, result.Category)
	assert.True(t, result.IsActive)
}

func TestNewTag2(t *testing.T) {
	name := "Artificial Intelligence"
	code := "AI"
	category := ""

	var result, err = NewTag(name, code, category)

	assert.Nil(t, result)
	assert.EqualError(t, err, "NewTag: Invalid category tag")
}

func TestNewTag3(t *testing.T) {
	name := ""
	code := "AI"
	category := "topic"

	var result, err = NewTag(name, code, category)

	assert.Nil(t, result)
	assert.EqualError(t, err, "NewTag: Empty name of tag")
}

func TestNewTag4(t *testing.T) {
	name := "Artificial Intelligence"
	code := ""
	category := "topic"

	var result, err = NewTag(name, code, category)

	assert.Nil(t, result)
	assert.EqualError(t, err, "NewTag: Empty code of tag")
}

func TestNewTag5(t *testing.T) {
	name := "Machine Learning"
	code := "ml"
	category := "application_domain"

	var result, _ = NewTag(name, code, category)

	assert.NotNil(t, result)

	assert.Equal(t, name, result.Name)
	assert.Equal(t, "ML", result.Code)
	assert.Equal(t, ApplicationDomainTag, result.Category)
	assert.True(t, result.IsActive)
}
