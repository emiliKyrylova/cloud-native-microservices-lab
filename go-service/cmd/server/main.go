package main

import (
	"go-service/internal/controller"
	"go-service/internal/middleware"
	"go-service/internal/repository"
	"go-service/internal/service"
	"log"
	"net/http"
)

func main() {
	// 1. Ініціалізація шару доступу до даних (Repository)
	repo := repository.NewInMemoryRepository()

	// 2. Ініціалізація бізнес-логіки (Service) з передачею репозиторію через інтерфейс
	svc := service.NewUserService(repo)

	// 3. Ініціалізація HTTP контролера
	ctrl := controller.NewUserController(svc)

	// 4. Налаштування маршрутизатора та міжнар (Router & Middleware)
	mux := http.NewServeMux()

	mux.HandleFunc("/health", ctrl.Health)
	mux.HandleFunc("/api/users", ctrl.HandleUsers)
	mux.HandleFunc("/api/users/", ctrl.HandleUserByID)

	// Загортаємо роутер у middleware логування
	loggedMux := middleware.RequestLogger(mux)

	port := ":4000"
	log.Printf("Layered Go service is running on http://localhost%s", port)

	if err := http.ListenAndServe(port, loggedMux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}