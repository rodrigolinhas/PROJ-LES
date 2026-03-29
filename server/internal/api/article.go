package api

import (
	db "LES/server/internal/database"
	"LES/server/internal/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// ArticleCreate
// @Summary     Create article
// @Description While the user is logged in, creates an article and associates it to an event activity
// @Tags        Article
// @Accept      mpfd
// @Produce 	plain
// @Param 		X-CSRF-Token 	header		string	true	"User's CSRF Token"
// @Param 		eventID 		formData 	string 	true 	"ID of the associated event"
// @Param 		activityID 		formData 	string 	true 	"ID of the associated activity"
// @Param       title           formData 	string  true    "Title of the article"
// @Param       firstAuthorID   formData 	string  true    "ID of the article's first author"
// @Param       coAuthorsID	    formData 	string  false   "The IDs of the co-authors, separated by commas"
// @Param       publisher 	    formData 	string  true    "Publisher of the article"
// @Param       doi             formData 	string  false   "Article's DOI"
// @Param       isbn            formData 	string  false   "Article's ISBN"
// @Param       url             formData 	string  true    "URL where the article is accessible"
// @Success     201 {string} string "Article created successfully"
// @Failure		401 {string} string "Invalid credentials"
// @Failure 	404 {string} string "User/event/activity not found"
// @Failure 	400 {string} string "The activity does not belong to the event"
// @Failure 	500 {string} string "Error found during article creation"
// @Router 		/article/create [post]
func ArticleCreate(c *gin.Context) {
	event, err := eventEditPreface(c)
	if err != nil {
		return
	}
	
	title := c.Request.FormValue("title")
	firstAuthorID := c.Request.FormValue("firstAuthorID")
	coAuthorsID := c.Request.FormValue("coAuthorsID") // 1, 2, 3, 4
	publisher := c.Request.FormValue("publisher")
	doi := c.Request.FormValue("doi")
	isbn := c.Request.FormValue("isbn")
	url := c.Request.FormValue("url")
	actID := c.Request.FormValue("activityID")

	act := &models.EventActivity{}
	dberr := db.DB.Where("id = ?", actID).Take(act)
	if dberr.Error != nil || dberr.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Activity not found")
		return
	}

	if act.EventID != event.ID {
		c.String(http.StatusBadRequest, "The activity does not belong to the event")
		return
	}
	
	firstAuthor := &models.User{}
	dberr = db.DB.Where("id = ?", firstAuthorID).Take(firstAuthor)
	if dberr.Error != nil || dberr.RowsAffected != 1 {
		c.String(http.StatusNotFound, "First author not found")
		return
	}

	coAuthors := []models.User{}
	ids := strings.Split(coAuthorsID, ",")
	for _, v := range ids {
		v = strings.TrimSpace(v)
		if v == "" {
			continue
		}

		author := &models.User{}
		dberr = db.DB.Where("id = ?", v).Take(author)
		if dberr.Error != nil || dberr.RowsAffected != 1 {
			c.String(http.StatusNotFound, "Co-author not found")
			return
		}

		coAuthors = append(coAuthors, *author)
	}

	article, aerr := models.NewArticle(title, *firstAuthor, publisher, url)
	if aerr != nil {
		c.String(http.StatusInternalServerError, aerr.Error())
		return
	}

	if doi != "" {
		doi = strings.TrimSpace(doi)
		article.DOI = doi
	}

	if isbn != "" {
		isbn = strings.TrimSpace(isbn)
		article.ISBN = isbn
	}

	article.AddCoAuthors(coAuthors)

	aerr = act.AddArticle(*article)
	if aerr != nil {
		c.String(http.StatusInternalServerError, aerr.Error())
	}
	
	dberr = db.DB.Save(act)
	if dberr.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	c.String(http.StatusCreated, "Article created successfully")
	return
}
