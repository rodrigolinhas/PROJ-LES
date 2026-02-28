/*
users_test.go defines the automated tests to confirm the behavior,
initialization, and validation logic of the User model.
*/
package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// TestNewUser verifies the successful creation of a User instance.
// It asserts that the default values (like Verified status), assigned fields
// (Email, Role), and generated timestamps are properly initialized and correctly formatted.
func TestNewUser(t *testing.T) {
	email := "test@example.com"
	role := "Admin"

	var result, _ = NewUser(email, role) // function for testing

	assert.NotNil(t, result)

	// fields
	assert.Equal(t, email, result.Email)

	// defaults
	assert.Equal(t, "Admin", result.Role)
	assert.False(t, result.Verified)

	// timestamps (strings) not empty
	assert.NotEmpty(t, result.CreatedAt)
	assert.NotEmpty(t, result.UpdatedAt)

	// timestamps parseable and close to now
	createdAt, err := time.Parse(time.RFC3339Nano, result.CreatedAt)
	assert.NoError(t, err)

	updatedAt, err := time.Parse(time.RFC3339Nano, result.UpdatedAt)
	assert.NoError(t, err)

	now := time.Now().UTC()
	assert.True(t, now.Sub(createdAt) < time.Second)
	assert.True(t, now.Sub(updatedAt) < time.Second)

	// created == updated at creation (or extremely close)
	assert.True(t, updatedAt.Sub(createdAt) < time.Millisecond)
}

// TestNewUserValidation ensures that the NewUser constructor properly rejects
// invalid inputs. It specifically tests that an error is returned when
// providing malformed emails or unrecognized user roles.
func TestNewUserValidation(t *testing.T) {
	// Test for invalid email
	invalidEmail := "invalid-email"
	user, err := NewUser(invalidEmail, "Participant")
	assert.Error(t, err)
	assert.Nil(t, user)

	// Test for invalid role
	userInvalidRole, err := NewUser("valid@example.com", "InvalidRole")
	assert.Error(t, err)
	assert.Nil(t, userInvalidRole)
}
