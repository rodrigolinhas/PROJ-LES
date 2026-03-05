package api

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	db "LES/server/internal/database"
	"LES/server/internal/models"
)

//TODO: Documentation
func EventCreate(c *gin.Context) {
	autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return
	}

	name := c.Request.FormValue("name")
	theme := c.Request.FormValue("theme")
	desc := c.Request.FormValue("description")
	org := c.Request.FormValue("organization")
	email := c.Request.FormValue("email")
	start := c.Request.FormValue("startDate")
	end := c.Request.FormValue("endDate")
	local := c.Request.FormValue("location")

	startt, serr := time.Parse(time.RFC3339, start)
	if serr != nil {
		c.String(http.StatusInternalServerError, "Error found parsing start time: " + serr.Error())
		return
	}

	endt, eerr := time.Parse(time.RFC3339, end)
	if eerr != nil {
		c.String(http.StatusInternalServerError, "Error found parsing end time: " + eerr.Error())
		return
	}

	var user models.User
	db.DB.Where("email = ?", strings.TrimSpace(email)).Take(&user)

	//TODO: This api method currently does 2 DB queries, refactor so that it only needs one
	event, err := models.NewEvent(name, theme, desc, org, user, startt, endt, local, db.DB)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	res := db.DB.Create(event)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found during event creation in the DB")
		return
	}

	c.String(http.StatusCreated, "Event created successfully")
}
