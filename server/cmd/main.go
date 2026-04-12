package main

import (
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swagfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"LES/server/docs"
	"LES/server/internal/api"
	db "LES/server/internal/database"
	"LES/server/internal/utils"
)

// @title Scientific Event Manager API
// @version 0.1
// @description Local Scientific Event Manager System

// @tag.name Dev
// @tag.description Endpoints only available for development purposes

// @tag.name User
// @tag.description Endpoints related with user account management

// @tag.name Auth
// @tag.description Endpoints related with user authentication

// @tag.name Event
// @tag.description Endpoints related to event management

// @tag.name EventActivity
// @tag.description Endpoints related to event activity management

// @tag.name Article
// @tag.description Endpoints related to article management

// @host localhost:8080
// @BasePath /
func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println("Warning: could not load .env file:", err)
	}

	api.InitGoogleAuth()
	db.ConnectDB()
	fmt.Println("Database Connected")

	docs.SwaggerInfo.BasePath = "/"

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://" + utils.EnvHostFrontend()},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))
	setEndpoints(router)
	router.Run()
}

func setEndpoints(router *gin.Engine) {
	//example endpoint
	router.GET("/ping", api.ExampleAPIMethod)

	//auth
	router.POST("/user/register", api.UserRegister)
	router.POST("/user/login", api.UserLogin)
	router.POST("/user/logout", api.UserLogout)

	//google oauth
	router.GET("/auth/google", api.GoogleAuthBegin)
	router.GET("/auth/google/callback", api.GoogleAuthCallback)

	//user
	router.GET("/user/me", api.UserMe)
	router.POST("/user/account/edit", api.UserInfoEdit)

	//event
	router.POST("/event/create", api.EventCreate)
	router.POST("/event/publish", api.EventPublish)
	router.GET("/event/list", api.EventList)
	router.GET("/event/my", api.EventMyList)
	router.POST("/event/delete", api.EventDelete)
	router.POST("/event/edit", api.EventEdit)
	router.GET("/event/view/:id", api.EventView)

	//event registration
	router.POST("/event/register", api.EventRegister)
	router.POST("/event/pay", api.EventPay)
	router.GET("/event/my/enroll", api.EventRegistrationList)

	//registration types
	router.POST("/event/regtype/create", api.RegistrationTypeCreate)
	router.POST("/event/regtype/edit", api.RegistrationTypeEdit)
	router.POST("/event/regtype/delete", api.RegistrationTypeDelete)
	router.GET("/event/view/:id/regtypes", api.RegistrationTypeList)
	router.GET("/event/view/:id/benefits", api.EventBenefitsList)
	router.GET("/event/view/:id/benefit_participants/:benefitID", api.EventBenefitsParticipants)

	//event activities
	router.POST("/event/:eventId/activity/create", api.EventActivityCreate)
	router.GET("/event/:eventId/activity/list", api.EventActivityList)
	router.POST("/event/:eventId/activity/edit/:id", api.EventActivityEdit)
	router.POST("/event/:eventId/activity/delete/:id", api.EventActivityDelete)
	router.GET("/event/:eventId/activity/view/:id", api.EventActivityView)

	//articles
	router.POST("/article/create", api.ArticleCreate)
	router.POST("/article/edit", api.ArticleEdit)
	router.POST("/article/delete", api.ArticleDelete)
	router.GET("/article/list", api.ArticleList)
	router.POST("/article/addTags", api.ArticleAddTags)
	router.POST("/article/removeTags", api.ArticleRemoveTags)
	router.GET("/article/details", api.ArticleGetById)
	router.POST("/article/add-auhors", api.ArticleAddAuthors)
	router.POST("/article/delete-auhors", api.ArticleDeleteAuthors)

	//tags
	router.GET("/tags/list", api.GetTags)

	// swagger handler
	router.GET("/docs/*any", ginSwagger.WrapHandler(swagfiles.Handler))
}
