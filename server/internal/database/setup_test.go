package database

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConnectDB(t *testing.T) {
	ConnectDB()          // execute function for testing
	assert.NotNil(t, DB) // assert DB is initialized
}
