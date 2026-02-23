package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleAPIMethod(t *testing.T) {
	router := SetTestRouter()

	req, _ := http.NewRequest("GET", "/ping", nil) // fake HTTP request (get to route ping)

	w := httptest.NewRecorder() // recorder for capturing answer from server

	router.ServeHTTP(w, req) // execute request in router

	assert.Equal(t, http.StatusOK, w.Code)      // assert 200 OK response from server
	assert.Contains(t, w.Body.String(), "ping") // assert response body has "ping"
}
