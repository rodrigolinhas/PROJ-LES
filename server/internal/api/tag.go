package api

import (
	db "LES/server/internal/database"
	"LES/server/internal/models"
	"LES/server/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type TagResponse struct {
	ID       uint               `json:"id" example:"1"`
	Name     string             `json:"name" example:"Artificial Intelligence"`
	Code     string             `json:"code" example:"AI"`
	Category models.TagCategory `json:"category" example:"0"`
	IsActive bool               `json:"isActive" example:"true"`
}

// GetTags
// @Summary     Get active tags
// @Description Returns all active tags in the system
// @Tags        Tag
// @Param       X-CSRF-Token  header    string  true   "User's CSRF token"
// @Produce     json
// @Success     200 {array} TagResponse
// @Failure     401 {string} string "Invalid credentials"
// @Failure     500 {string} string "Error while fetching tags"
// @Router      /tags/list [get]
func GetTags(c *gin.Context) {
	_, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	var tags []models.Tag

	res := db.DB.Where("is_active = ?", true).Order("category asc").Order("name asc").Find(&tags)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error while fetching tags")
		return
	}

	response := make([]TagResponse, 0, len(tags))
	for _, tag := range tags {
		response = append(response, TagResponse{
			ID:       tag.ID,
			Name:     tag.Name,
			Code:     tag.Code,
			Category: tag.Category,
			IsActive: tag.IsActive,
		})
	}

	c.JSON(http.StatusOK, response)
}

// ArticleAddTags
// @Summary     Add tags to an article
// @Description While the user is logged in, adds one or more tags to an article
// @Tags        Article
// @Accept      mpfd
// @Produce     plain
// @Param       X-CSRF-Token  header    string  true   "User's CSRF Token"
// @Param       articleID     formData  string  true   "ID of the article"
// @Param       tagsID        formData  string  true   "The IDs of the tags, separated by commas"
// @Success     200 {string} string "Tags added successfully"
// @Failure     400 {string} string "Invalid article/tag IDs"
// @Failure     401 {string} string "Invalid credentials"
// @Failure     403 {string} string "User is not the organizer of this event"
// @Failure     404 {string} string "Article/tag not found"
// @Failure     500 {string} string "Error found while adding tags"
// @Router      /article/addTags [post]
func ArticleAddTags(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	articleID := c.Request.FormValue("articleID")
	tagsID := c.Request.FormValue("tagsID")

	if articleID == "" || tagsID == "" {
		c.String(http.StatusBadRequest, "Missing articleID or tagsID")
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

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "User is not the organizer of this event")
		return
	}

	tagIDs, err := utils.ParseIDs(tagsID)
	if err != nil {
		c.String(http.StatusBadRequest, "Invalid tag IDs")
		return
	}

	var currentTags []models.Tag
	if err := db.DB.Model(&article).Association("Tags").Find(&currentTags); err != nil {
		c.String(http.StatusInternalServerError, "Error found while fetching current tags")
		return
	}
	article.Tags = currentTags

	var tags []models.Tag
	res := db.DB.Where("id IN ?", tagIDs).Where("is_active = ?", true).Find(&tags)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found while fetching tags")
		return
	}

	if len(tags) != len(tagIDs) {
		c.String(http.StatusNotFound, "One or more tags were not found")
		return
	}

	added := article.AddTags(tags)
	if added == 0 {
		c.String(http.StatusBadRequest, "No new tags were added")
		return
	}

	if err := db.DB.Model(&article).Association("Tags").Replace(article.Tags); err != nil {
		c.String(http.StatusInternalServerError, "Error found while adding tags")
		return
	}

	c.String(http.StatusOK, "Tags added successfully")
}

// ArticleRemoveTags
// @Summary     Remove tags from an article
// @Description While the user is logged in, removes one or more tags from an article
// @Tags        Article
// @Accept      mpfd
// @Produce     plain
// @Param       X-CSRF-Token  header    string  true   "User's CSRF Token"
// @Param       articleID     formData  string  true   "ID of the article"
// @Param       tagsID        formData  string  true   "The IDs of the tags, separated by commas"
// @Success     200 {string} string "Tags removed successfully"
// @Failure     400 {string} string "Invalid article/tag IDs"
// @Failure     401 {string} string "Invalid credentials"
// @Failure     403 {string} string "User is not the organizer of this event"
// @Failure     404 {string} string "Article/tag not found"
// @Failure     500 {string} string "Error found while removing tags"
// @Router      /article/removeTags [post]
func ArticleRemoveTags(c *gin.Context) {
	user, err := Authorize(c)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	articleID := c.Request.FormValue("articleID")
	tagsID := c.Request.FormValue("tagsID")

	if articleID == "" || tagsID == "" {
		c.String(http.StatusBadRequest, "Missing articleID or tagsID")
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

	if event.OrganizerID != user.ID {
		c.String(http.StatusForbidden, "User is not the organizer of this event")
		return
	}

	tagIDs, err := utils.ParseIDs(tagsID)
	if err != nil {
		c.String(http.StatusBadRequest, "Invalid tag IDs")
		return
	}

	var currentTags []models.Tag
	if err := db.DB.Model(&article).Association("Tags").Find(&currentTags); err != nil {
		c.String(http.StatusInternalServerError, "Error found while fetching current tags")
		return
	}
	article.Tags = currentTags

	var tags []models.Tag
	res := db.DB.Where("id IN ?", tagIDs).Where("is_active = ?", true).Find(&tags)
	if res.Error != nil {
		c.String(http.StatusInternalServerError, "Error found while fetching tags")
		return
	}

	if len(tags) != len(tagIDs) {
		c.String(http.StatusNotFound, "One or more tags were not found")
		return
	}

	removed := article.RemoveTags(tags)
	if removed == 0 {
		c.String(http.StatusBadRequest, "No tags were removed")
		return
	}

	if err := db.DB.Model(&article).Association("Tags").Replace(article.Tags); err != nil {
		c.String(http.StatusInternalServerError, "Error found while removing tags")
		return
	}

	c.String(http.StatusOK, "Tags removed successfully")
}
