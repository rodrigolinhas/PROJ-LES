package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewPing(t *testing.T) {
	result := NewPing() // fucntion for testing

	assert.NotNil(t, result)              // assert doesn't return nil
	assert.False(t, result.Time.IsZero()) // assert date in not empty

	now := time.Now()
	diff := now.Sub(result.Time)

	assert.True(t, diff < time.Second) // assert diff between now and ping time is less than 1 sec
}
