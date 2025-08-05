package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// Data structures for admin dashboard
type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

type Notification struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	Type      string    `json:"type"`
	Priority  string    `json:"priority"`
	CreatedAt time.Time `json:"createdAt"`
	Sent      bool      `json:"sent"`
}

type Repository struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	URL         string    `json:"url"`
	Description string    `json:"description"`
	IsActive    bool      `json:"isActive"`
	SourceCount int       `json:"sourceCount"`
	LastUpdated time.Time `json:"lastUpdated"`
}

type Stats struct {
	Total  int `json:"total"`
	Active int `json:"active"`
	Sent   int `json:"sent"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// In-memory storage (for demo purposes)
var (
	currentUser     *User
	notifications   []Notification
	repositories    []Repository
	notificationID  int = 1
	repositoryID    int = 1
	isAuthenticated bool = false
)

func init() {
	// Initialize with sample data
	notifications = []Notification{
		{
			ID:        "1",
			Title:     "مرحباً بك في لوحة التحكم",
			Body:      "تم تفعيل لوحة التحكم بنجاح. يمكنك الآن إدارة الإشعارات والمستودعات.",
			Type:      "general",
			Priority:  "medium",
			CreatedAt: time.Now().Add(-time.Hour * 2),
			Sent:      true,
		},
		{
			ID:        "2",
			Title:     "تحديث النظام",
			Body:      "تم تحديث النظام إلى الإصدار الجديد مع تحسينات في الأداء.",
			Type:      "update",
			Priority:  "high",
			CreatedAt: time.Now().Add(-time.Hour * 24),
			Sent:      true,
		},
	}

	repositories = []Repository{
		{
			ID:          "1",
			Name:        "مستودع المانجا الرئيسي",
			URL:         "https://example.com/manga-repo",
			Description: "المستودع الرئيسي لمصادر المانجا",
			IsActive:    true,
			SourceCount: 150,
			LastUpdated: time.Now().Add(-time.Hour * 6),
		},
		{
			ID:          "2",
			Name:        "مستودع المانجا الثانوي",
			URL:         "https://example.com/manga-repo-2",
			Description: "مستودع إضافي للمصادر الجديدة",
			IsActive:    false,
			SourceCount: 75,
			LastUpdated: time.Now().Add(-time.Hour * 12),
		},
	}
}

// CORS middleware
func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Allow-Credentials", "true")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
}

// Authentication middleware
func requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == "OPTIONS" {
			return
		}

		if !isAuthenticated {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(Response{
				Success: false,
				Message: "غير مصرح بالوصول",
			})
			return
		}
		next(w, r)
	}
}

// Auth handlers
func handleLogin(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	if r.Method == "OPTIONS" {
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var loginReq LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "بيانات غير صحيحة",
		})
		return
	}

	// Simple authentication (admin/admin)
	if loginReq.Username == "admin" && loginReq.Password == "admin" {
		isAuthenticated = true
		currentUser = &User{
			ID:       "1",
			Username: "admin",
			Role:     "administrator",
		}

		json.NewEncoder(w).Encode(Response{
			Success: true,
			Message: "تم تسجيل الدخول بنجاح",
			Data: map[string]interface{}{
				"user": currentUser,
			},
		})
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "اسم المستخدم أو كلمة المرور غير صحيحة",
		})
	}
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	if r.Method == "OPTIONS" {
		return
	}

	w.Header().Set("Content-Type", "application/json")
	isAuthenticated = false
	currentUser = nil

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "تم تسجيل الخروج بنجاح",
	})
}

func handleAuthCheck(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	if r.Method == "OPTIONS" {
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if isAuthenticated && currentUser != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": true,
			"user":          currentUser,
		})
	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": false,
		})
	}
}

// Notification handlers
func handleGetNotifications(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"notifications": notifications,
	})
}

func handleSendNotification(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var notification Notification
	if err := json.NewDecoder(r.Body).Decode(&notification); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "بيانات غير صحيحة",
		})
		return
	}

	notification.ID = strconv.Itoa(notificationID)
	notification.CreatedAt = time.Now()
	notification.Sent = true
	notificationID++

	notifications = append([]Notification{notification}, notifications...)

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "تم إرسال الإشعار بنجاح",
	})
}

func handleDeleteNotification(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	for i, notification := range notifications {
		if notification.ID == id {
			notifications = append(notifications[:i], notifications[i+1:]...)
			json.NewEncoder(w).Encode(Response{
				Success: true,
				Message: "تم حذف الإشعار بنجاح",
			})
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Message: "الإشعار غير موجود",
	})
}

func handleNotificationStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	total := len(notifications)
	sent := 0
	for _, notification := range notifications {
		if notification.Sent {
			sent++
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"stats": Stats{
			Total: total,
			Sent:  sent,
		},
	})
}

// Repository handlers
func handleGetRepositories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"repositories": repositories,
	})
}

func handleAddRepository(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var repo Repository
	if err := json.NewDecoder(r.Body).Decode(&repo); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "بيانات غير صحيحة",
		})
		return
	}

	repo.ID = strconv.Itoa(repositoryID)
	repo.IsActive = true
	repo.SourceCount = 0
	repo.LastUpdated = time.Now()
	repositoryID++

	repositories = append(repositories, repo)

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "تم إضافة المستودع بنجاح",
	})
}

func handleUpdateRepository(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var updateData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "بيانات غير صحيحة",
		})
		return
	}

	for i, repo := range repositories {
		if repo.ID == id {
			if isActive, ok := updateData["isActive"].(bool); ok {
				repositories[i].IsActive = isActive
				repositories[i].LastUpdated = time.Now()
			}
			json.NewEncoder(w).Encode(Response{
				Success: true,
				Message: "تم تحديث المستودع بنجاح",
			})
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Message: "المستودع غير موجود",
	})
}

func handleDeleteRepository(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	for i, repo := range repositories {
		if repo.ID == id {
			repositories = append(repositories[:i], repositories[i+1:]...)
			json.NewEncoder(w).Encode(Response{
				Success: true,
				Message: "تم حذف المستودع بنجاح",
			})
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Message: "المستودع غير موجود",
	})
}

func handleRefreshRepository(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	for i, repo := range repositories {
		if repo.ID == id {
			repositories[i].LastUpdated = time.Now()
			// Simulate source count update
			repositories[i].SourceCount += 5
			json.NewEncoder(w).Encode(Response{
				Success: true,
				Message: "تم تحديث المستودع بنجاح",
			})
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Message: "المستودع غير موجود",
	})
}

func handleRepositoryStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	total := len(repositories)
	active := 0
	for _, repo := range repositories {
		if repo.IsActive {
			active++
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"stats": Stats{
			Total:  total,
			Active: active,
		},
	})
}

func handleRefreshAllRepositories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	for i := range repositories {
		if repositories[i].IsActive {
			repositories[i].LastUpdated = time.Now()
			repositories[i].SourceCount += 3
		}
	}

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "تم تحديث جميع المستودعات بنجاح",
	})
}

// Quick actions
func handleQuickAction(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	action := vars["action"]

	var message string
	switch action {
	case "clear-cache":
		message = "تم تنظيف الذاكرة المؤقتة بنجاح"
	case "export-data":
		message = "تم تصدير البيانات بنجاح"
	default:
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "إجراء غير صحيح",
		})
		return
	}

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: message,
	})
}

func main() {
	r := mux.NewRouter()

	// Static files
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./")))

	// API routes
	api := r.PathPrefix("/api").Subrouter()

	// Auth routes
	api.HandleFunc("/auth/login", handleLogin).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/logout", handleLogout).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/check", handleAuthCheck).Methods("GET", "OPTIONS")

	// Protected routes
	api.HandleFunc("/notifications", requireAuth(handleGetNotifications)).Methods("GET", "OPTIONS")
	api.HandleFunc("/notifications/send", requireAuth(handleSendNotification)).Methods("POST", "OPTIONS")
	api.HandleFunc("/notifications/{id}", requireAuth(handleDeleteNotification)).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/notifications/stats", requireAuth(handleNotificationStats)).Methods("GET", "OPTIONS")

	api.HandleFunc("/repositories", requireAuth(handleGetRepositories)).Methods("GET", "OPTIONS")
	api.HandleFunc("/repositories", requireAuth(handleAddRepository)).Methods("POST", "OPTIONS")
	api.HandleFunc("/repositories/{id}", requireAuth(handleUpdateRepository)).Methods("PUT", "OPTIONS")
	api.HandleFunc("/repositories/{id}", requireAuth(handleDeleteRepository)).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/repositories/{id}/refresh", requireAuth(handleRefreshRepository)).Methods("POST", "OPTIONS")
	api.HandleFunc("/repositories/stats", requireAuth(handleRepositoryStats)).Methods("GET", "OPTIONS")
	api.HandleFunc("/repositories/refresh-all", requireAuth(handleRefreshAllRepositories)).Methods("POST", "OPTIONS")

	api.HandleFunc("/quick-actions/{action}", requireAuth(handleQuickAction)).Methods("POST", "OPTIONS")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	fmt.Println("🚀 خادم لوحة التحكم يعمل على http://localhost:8080")
	fmt.Println("📝 بيانات تسجيل الدخول: admin / admin")
	log.Fatal(http.ListenAndServe(":8080", handler))
}