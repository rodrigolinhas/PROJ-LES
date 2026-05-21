package database

import (
	"errors"
	"log"
	"time"

	"LES/server/internal/models"
	"LES/server/internal/utils"

	"gorm.io/gorm"
)

// SeedEvalData populates the database with one instance of every main entity
// for evaluation / demo purposes. It is idempotent — if the demo user already
// exists, the function returns immediately.
func SeedEvalData() {
	// ── Guard: only seed once ──────────────────────────────────────────
	var existing models.User
	if err := DB.Where("email = ?", "admin@mail.com").First(&existing).Error; err == nil {
		log.Println("[Seeder] Eval data already present — skipping.")
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Printf("[Seeder] Error checking for existing data: %v\n", err)
		return
	}

	log.Println("[Seeder] Seeding evaluation data…")

	// ── 1. User (EventOrganizer) ───────────────────────────────────────
	hashedPass, err := utils.HashPassword("12345678")
	if err != nil {
		log.Printf("[Seeder] Error hashing password: %v\n", err)
		return
	}

	user, err := models.NewUser("Admin", "Seeder", "EventOrganizer", "admin@mail.com", hashedPass)
	if err != nil {
		log.Printf("[Seeder] Error creating user model: %v\n", err)
		return
	}
	if res := DB.Create(user); res.Error != nil {
		log.Printf("[Seeder] Error saving user: %v\n", res.Error)
		return
	}
	log.Printf("[Seeder] User created  (ID=%d, email=%s)\n", user.ID, user.Email)

	// ── 2. Second user (Student — for article co-author / registration)
	hashedPass2, _ := utils.HashPassword("12345678")
	student, _ := models.NewUser("Maria", "Silva", "Student", "student@mail.com", hashedPass2)
	if res := DB.Create(student); res.Error != nil {
		log.Printf("[Seeder] Error saving student: %v\n", res.Error)
		return
	}
	log.Printf("[Seeder] Student created (ID=%d, email=%s)\n", student.ID, student.Email)

	// ── 3. Event ───────────────────────────────────────────────────────
	start := time.Now().Add(24 * time.Hour)
	end := start.Add(72 * time.Hour)

	event, err := models.NewEvent(
		"Conferência LES 2026",
		"Engenharia de Software",
		"Conferência anual de Laboratório de Engenharia de Software.",
		"Universidade do Minho",
		*user,
		start,
		end,
		"Auditório Principal - Campus de Gualtar",
	)
	if err != nil {
		log.Printf("[Seeder] Error creating event model: %v\n", err)
		return
	}
	if res := DB.Create(event); res.Error != nil {
		log.Printf("[Seeder] Error saving event: %v\n", res.Error)
		return
	}
	log.Printf("[Seeder] Event created  (ID=%d)\n", event.ID)

	// ── 4. Registration Type ───────────────────────────────────────────
	benefits := []models.Benefit{}
	var coffeeBenefit models.Benefit
	if err := DB.Where("name = ?", "Coffee Break").First(&coffeeBenefit).Error; err == nil {
		benefits = append(benefits, coffeeBenefit)
	}
	var lunchBenefit models.Benefit
	if err := DB.Where("name = ?", "Lunch").First(&lunchBenefit).Error; err == nil {
		benefits = append(benefits, lunchBenefit)
	}

	regType, err := models.NewRegistrationType(event.ID, "Estudante", "Inscrição para estudantes", 15.00, benefits)
	if err != nil {
		log.Printf("[Seeder] Error creating registration type model: %v\n", err)
		return
	}
	if res := DB.Create(regType); res.Error != nil {
		log.Printf("[Seeder] Error saving registration type: %v\n", res.Error)
		return
	}
	log.Printf("[Seeder] RegistrationType created (ID=%d)\n", regType.ID)

	// Reload event with its RegTypes so NewEventRegistration validation works
	DB.Preload("RegTypes").First(event, event.ID)

	// ── 5. Discount Code ──────────────────────────────────────────────
	discount, err := models.NewDiscountCode("LES2026", "percentage", 20, 100)
	if err != nil {
		log.Printf("[Seeder] Error creating discount code model: %v\n", err)
		return
	}
	if res := DB.Create(discount); res.Error != nil {
		log.Printf("[Seeder] Error saving discount code: %v\n", res.Error)
		return
	}
	log.Printf("[Seeder] DiscountCode created (ID=%d, code=%s)\n", discount.ID, discount.Code)

	// ── 6. Event Registration (student enrolls in event) ──────────────
	registration, err := models.NewEventRegistration(*student, *event, discount, *regType)
	if err != nil {
		log.Printf("[Seeder] Error creating event registration model: %v\n", err)
		return
	}
	if res := DB.Create(registration); res.Error != nil {
		log.Printf("[Seeder] Error saving event registration: %v\n", res.Error)
		return
	}
	log.Println("[Seeder] EventRegistration created")

	// ── 7. Event Activity ─────────────────────────────────────────────
	actStart := start.Add(2 * time.Hour)
	actEnd := actStart.Add(1 * time.Hour)

	activity, err := models.NewEventActivity(
		"Apresentação de Projetos",
		"Sessão de apresentação dos projetos finais de LES.",
		actStart,
		actEnd,
		"Sala 1.01",
		*event,
	)
	if err != nil {
		log.Printf("[Seeder] Error creating activity model: %v\n", err)
		return
	}
	if res := DB.Create(activity); res.Error != nil {
		log.Printf("[Seeder] Error saving activity: %v\n", res.Error)
		return
	}
	log.Printf("[Seeder] EventActivity created (ID=%d)\n", activity.ID)

	// ── 8. Article ────────────────────────────────────────────────────
	article, err := models.NewArticle(
		"Arquitetura de Microsserviços em Aplicações Académicas",
		*user,
		"IEEE",
		"https://doi.org/10.1234/les2026.001",
	)
	if err != nil {
		log.Printf("[Seeder] Error creating article model: %v\n", err)
		return
	}
	article.EventActivityID = activity.ID
	article.DOI = "10.1234/les2026.001"
	if res := DB.Create(article); res.Error != nil {
		log.Printf("[Seeder] Error saving article: %v\n", res.Error)
		return
	}
	log.Printf("[Seeder] Article created (ID=%d)\n", article.ID)

	// Add a tag to the article
	var seTag models.Tag
	if err := DB.Where("code = ?", "SE").First(&seTag).Error; err == nil {
		DB.Model(article).Association("Tags").Append(&seTag)
		log.Println("[Seeder] Tag 'SE' linked to article")
	}

	// Add student as co-author
	DB.Model(article).Association("CoAuthors").Append(student)
	log.Println("[Seeder] Student added as co-author")

	log.Println("[Seeder] Evaluation data seeded successfully!")
	log.Println("[Seeder] Admin login: admin@mail.com / 12345678")
	log.Println("[Seeder] Student login: student@mail.com / 12345678")
}
