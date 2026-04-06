package api

import (
	db "LES/server/internal/database"
	"LES/server/internal/models"
	"net/http"
	"strings"
	"errors"

	"github.com/gin-gonic/gin"
)

type ArticleResponse struct {
	Message   string `json:"message"`
	ArticleID uint   `json:"articleID"`
}

type Article struct {
	ID				uint
	Title           string 
	FirstAuthorID   uint   
	CoAuthorsID     []uint 
	Publisher       string 
	DOI             string
	ISBN            string
	URL             string        
	Tags            []string   
}

// ArticleCreate
// @Summary     Create article
// @Description While the user is logged in, creates an article and associates it to an event activity
// @Tags        Article
// @Accept      mpfd
// @Produce 	json
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
// @Success     201 {object} 	ArticleResponse
// @Failure		401 {string} string "Invalid credentials"
// @Failure 	404 {string} string "User/event/activity not found"
// @Failure 	400 {string} string "The activity does not belong to the event"
// @Failure 	500 {string} string "Error found during article creation"
// @Router 		/article/create [post]
func ArticleCreate(c *gin.Context) {
	//TODO: Use another preface
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

	article.FirstAuthorID = firstAuthor.ID
	article.EventActivityID = act.ID
	article.AddCoAuthors(coAuthors)

	aerr = act.AddArticle(*article)
	if aerr != nil {
		c.String(http.StatusInternalServerError, aerr.Error())
	}

	dberr = db.DB.Create(article)
	if dberr.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	c.JSON(http.StatusCreated, ArticleResponse{
		Message:   "Article created successfully",
		ArticleID: article.ID,
	})
}

func articleEditPreface(c *gin.Context) (*models.Article, error) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid authentication: " + autherr.Error())
		return nil, errors.New("Error sent")
	}

	artID := c.Request.FormValue("articleID")

	var article models.Article
	res := db.DB.Preload("EventActivity").Preload("EventActivity.Event").Where("ID = ?", artID).First(&article)
	if res.Error != nil || res.RowsAffected != 1 {
		c.String(http.StatusNotFound, "Article not found")
		return nil, errors.New("Error sent")
	}

	if article.EventActivity.Event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "User is not the organizer of this event")
		return nil, errors.New("Error sent")
	}

	return &article, nil
}

// ArticleEdit
// @Summary     Edit an article
// @Description While the user is logged in, edits an article associated to an event which the user is the organizer
// @Tags        Article
// @Accept      mpfd
// @Produce 	json
// @Param 		X-CSRF-Token 	header		string	true	"User's CSRF Token"
// @Param 		articleID 		formData 	string 	true 	"ID of the article"
// @Param       title           formData 	string  false    "Title of the article"
// @Param       firstAuthorID   formData 	string  false    "ID of the article's first author"
// @Param       coAuthorsID	    formData 	string  false   "The IDs of the co-authors, separated by commas"
// @Param       publisher 	    formData 	string  false    "Publisher of the article"
// @Param       doi             formData 	string  false   "Article's DOI"
// @Param       isbn            formData 	string  false   "Article's ISBN"
// @Param       url             formData 	string  false    "URL where the article is accessible"
// @Success     200 {object} 	ArticleResponse
// @Failure		401 {string} string "Invalid credentials"
// @Failure 	404 {string} string "Article/user/event/activity not found"
// @Failure 	403 {string} string "User is not the event organizer"
// @Failure 	500 {string} string "Error found during article edition"
// @Router 		/article/edit [post]
func ArticleEdit(c *gin.Context) {
	article, err := articleEditPreface(c)
	if err != nil {
		return
	}

	title := c.Request.FormValue("title")
	firstAuthorID := c.Request.FormValue("firstAuthorID")
	publisher := c.Request.FormValue("publisher")
	doi := c.Request.FormValue("doi")
	isbn := c.Request.FormValue("isbn")
	url := c.Request.FormValue("url")

	if(firstAuthorID != "") {
		firstAuthor := &models.User{}
		dberr := db.DB.Where("id = ?", firstAuthorID).Take(firstAuthor)
		if dberr.Error != nil || dberr.RowsAffected != 1 {
			c.String(http.StatusNotFound, "First author not found")
			return
		}

		article.FirstAuthor = *firstAuthor;
	}

	if title != "" {
		title = strings.TrimSpace(title)
		article.Title = title
	}

	if publisher != "" {
		publisher = strings.TrimSpace(publisher)
		article.Publisher = publisher
	}

	if url != "" {
		url = strings.TrimSpace(url)
		article.URL = url
	}

	if doi != "" {
		doi = strings.TrimSpace(doi)
		article.DOI = doi
	}

	if isbn != "" {
		isbn = strings.TrimSpace(isbn)
		article.ISBN = isbn
	}

	dberr := db.DB.Save(article)
	if dberr.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	c.JSON(http.StatusOK, ArticleResponse{
		Message:   "Article edited successfully",
		ArticleID: article.ID,
	})
}

// ArticleDelete
// @Summary     Delete an article
// @Description While the user is logged in, deletes an article associated to an event which the user is the organizer
// @Tags        Article
// @Accept      mpfd
// @Produce 	json
// @Param 		X-CSRF-Token 	header		string	true	"User's CSRF Token"
// @Param 		articleID 		formData 	string 	true 	"ID of the article"
// @Success     200 {string} string	"Article deleted successfully"
// @Failure		401 {string} string "Invalid credentials"
// @Failure 	404 {string} string "Article/event/activity not found"
// @Failure 	403 {string} string "User is not the event organizer"
// @Failure 	500 {string} string "Error found during article deletion"
// @Router 		/article/delete [post]
func ArticleDelete(c *gin.Context) {
	article, err := articleEditPreface(c)
	if err != nil {
		return
	}

	dberr := db.DB.Delete(article)
	if dberr.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	c.String(http.StatusOK, "Article deleted successfully")
}

// ArticleList
// @Summary 	List the articles associated to an activity
// @Description A user can view and filter the articles associated to an activity of a event that was published or which the user is the organizer
// @Tags 		Article
// @Accept		plain
// @Produce 	json
// @Param 		X-CSRF-Token	header		string	true	"User's CSRF Token"
// @Param 		activityID		query		string	true	"ID of the associated activity" 
// @Param 		filter			query		string	false	"Filter the name of the events shown" 
// @Param 		limit			query		int		false	"Number of events shown" maximum(50) default(20)
// @Param 		offset			query		int		false	"Number of events to skip in the search" default(0)
// @Success 	200 {array} Article
// @Failure		401 {string} string "Invalid credentials"
// @Failure		403 {string} string "Event was not published yet and the user is not the orgaziner"
// @Failure		404 {string} string "No article found"
// @Router 		/article/list [get]
func ArticleList(c *gin.Context) {
	user, limit, offset, filter, err := eventListPreface(c)
	if err != nil { return }

	actID := c.Query("activityID")

	activity := models.EventActivity{}
	dberr := db.DB.Preload("Event").Preload("Articles").Where("id = ?", actID).Take(&activity)
	if dberr.Error != nil {
		c.String(http.StatusInternalServerError, "Error found in DB")
		return
	}

	if !activity.Event.Published && activity.Event.Organizer.ID != user.ID {
		c.String(http.StatusForbidden, "Event was not published yet and the user is not the orgaziner")
		return
	}

	var articles []models.Article
	err = db.DB.Model(&activity).
				 Limit(limit).
				 Offset(offset).
				 Where("title LIKE ?", "%"+filter+"%").
				 Association("Articles").
				 Find(&articles)
	//TODO: Check error

	res := []Article{}
	for _, v := range articles {
		coauthors := []uint{}
		tags := []string{}
		verr := db.DB.Preload("CoAuthors").Preload("Tags").Take(&v)
		if verr.Error != nil {
			c.String(http.StatusInternalServerError, "Error found in DB")
			return
		}

		for _, ca := range v.CoAuthors {
			coauthors = append(coauthors, ca.ID)
		}

		for _, t := range v.Tags {
			if t.IsActive {
				tags = append(tags, t.Name)
			}
		}

		res = append(res, Article{
			ID				: v.ID,
			Title           : v.Title,
			FirstAuthorID	: v.FirstAuthorID, 
			CoAuthorsID     : coauthors,
			Publisher       : v.Publisher,
			DOI             : v.DOI,
			ISBN            : v.ISBN,
			URL             : v.URL,
			Tags            : tags, 
		})
	}

	if len(res) == 0 {
		c.String(http.StatusNotFound, "No article found")
		return
	}

	c.IndentedJSON(http.StatusOK, res)
}

// ArticleGetById
// @Summary     Get article by ID
// @Description Returns an article with its associated tags. Unpublished articles can only be viewed by the event organizer.
// @Tags        Article
// @Produce     json
// @Param       id  query     string  true  "Article ID"
// @Param       X-CSRF-Token  header    string  true   "User's CSRF Token"
// @Success     200 {object} map[string]interface{}
// @Failure     400 {string} string "Missing article ID"
// @Failure     401 {string} string "Invalid credentials"
// @Failure     403 {string} string "You can't view this article (need to be the event organizer)"
// @Failure     404 {string} string "Article not found"
// @Failure     500 {string} string "Internal server error"
// @Router      /article/details [get]
func ArticleGetById(c *gin.Context) {
	user, autherr := Authorize(c)
	if autherr != nil {
		c.String(http.StatusUnauthorized, "Invalid credentials")
		return
	}

	articleID := c.Query("id")
	if articleID == "" {
		c.String(http.StatusBadRequest, "Missing article ID")
		return
	}

	var article models.Article
	if err := db.DB.Where("id = ?", articleID).Take(&article).Error; err != nil {
		c.String(http.StatusNotFound, "Article not found")
		return
	}

	var activity models.EventActivity
	if err := db.DB.Where("id = ?", article.EventActivityID).Take(&activity).Error; err != nil {
		c.String(http.StatusNotFound, "Activity not found")
		return
	}

	var event models.Event
	if err := db.DB.Where("id = ?", activity.EventID).Take(&event).Error; err != nil {
		c.String(http.StatusNotFound, "Event not found")
		return
	}

	if !event.Published && event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "You can't view this article (need to be the event organizer)")
		return
	}

	var firstAuthor map[string]interface{}
	if err := db.DB.Model(&models.User{}).
		Select("id").
		Where("id = ?", article.FirstAuthorID).
		Take(&firstAuthor).Error; err != nil {
		c.String(http.StatusNotFound, "First author not found")
		return
	}

	var coAuthors []map[string]interface{}
	if err := db.DB.Table("users").
		Select("users.id").
		Joins("JOIN article_coauthors ON article_coauthors.user_id = users.id").
		Where("article_coauthors.article_id = ?", article.ID).
		Scan(&coAuthors).Error; err != nil {
		c.String(http.StatusInternalServerError, "Error while fetching co-authors")
		return
	}

	var tags []models.Tag
	if err := db.DB.Model(&article).Association("Tags").Find(&tags); err != nil {
		c.String(http.StatusInternalServerError, "Error while fetching tags")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":            article.ID,
		"title":         article.Title,
		"firstAuthor":   firstAuthor,
		"coAuthors":     coAuthors,
		"publisher":     article.Publisher,
		"doi":           article.DOI,
		"isbn":          article.ISBN,
		"url":           article.URL,
		"eventActivity": activity,
		"tags":          tags,
		"createdAt":     article.CreatedAt,
		"updatedAt":     article.UpdatedAt,
	})
}
