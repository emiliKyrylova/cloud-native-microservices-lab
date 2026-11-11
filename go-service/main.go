package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Gadget описує нашу сутність (як в Node.js)
type Gadget struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Price   float64 `json:"price"`
	InStock bool    `json:"inStock"`
}

// In-memory сховище та м'ютекс для забезпечення потокобезпечності в Go
type Storage struct {
	mu      sync.RWMutex
	gadgets map[string]Gadget
}

func main() {
	// Ініціалізуємо сховище початковими даними
	db := &Storage{
		gadgets: map[string]Gadget{
			"1": {ID: "1", Name: "MacBook Pro", Price: 1999.99, InStock: true},
			"2": {ID: "2", Name: "Logitech MX Master 3", Price: 99.99, InStock: true},
		},
	}

	// Реєструємо маршрути
	http.HandleFunc("/health", db.handleHealth)
	http.HandleFunc("/gadgets", db.handleGadgetsListCreate)
	http.HandleFunc("/gadgets/", db.handleGadgetSingle) // обробка запитів з ID (GET, PUT, DELETE)
	// ЛАБОРАТОРНА РОБОТА №2 ДОДАЄМО МАРШРУТИ
	http.HandleFunc("/io", db.handleIO)
	http.HandleFunc("/cpu", db.handleCPUSequential)
	http.HandleFunc("/cpu-concurrent", db.handleCPUConcurrent)

	port := ":4000"
	println("Go service is running on http://localhost" + port)

	// Запуск HTTP сервера
	if err := http.ListenAndServe(port, nil); err != nil {
		panic(err)
	}
}

// 1. Health check ендпойнт
func (s *Storage) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "UP",
		"service": "go-service",
	})
}

// GET /gadgets та POST /gadgets
func (s *Storage) handleGadgetsListCreate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		s.mu.RLock()
		defer s.mu.RUnlock()

		gadgetsList := make([]Gadget, 0, len(s.gadgets))
		for _, g := range s.gadgets {
			gadgetsList = append(gadgetsList, g)
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(gadgetsList)

	case http.MethodPost:
		var g Gadget
		if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON body"})
			return
		}

		if g.Name == "" || g.Price == 0 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Name and price are required"})
			return
		}

		s.mu.Lock()
		g.ID = strconv.FormatInt(time.Now().UnixNano(), 10) // Генерація ID
		if !g.InStock {
			g.InStock = true
		}
		s.gadgets[g.ID] = g
		s.mu.Unlock()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(g)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// GET, PUT, DELETE для конкретного гаджета за ID (/gadgets/{id})
func (s *Storage) handleGadgetSingle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Витягуємо ID з URL (все, що йде після /gadgets/)
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/gadgets/"), "/")
	id := parts[0]

	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "ID is required"})
		return
	}

	switch r.Method {
	case http.MethodGet:
		s.mu.RLock()
		g, exists := s.gadgets[id]
		s.mu.RUnlock()

		if !exists {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Gadget not found"})
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(g)

	case http.MethodPut:
		s.mu.Lock()
		g, exists := s.gadgets[id]
		if !exists {
			s.mu.Unlock()
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Gadget not found"})
			return
		}

		var updateData Gadget
		if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
			s.mu.Unlock()
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON body"})
			return
		}

		if updateData.Name != "" {
			g.Name = updateData.Name
		}
		if updateData.Price != 0 {
			g.Price = updateData.Price
		}
		g.InStock = updateData.InStock

		s.gadgets[id] = g
		s.mu.Unlock()

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(g)

	case http.MethodDelete:
		s.mu.Lock()
		_, exists := s.gadgets[id]
		if !exists {
			s.mu.Unlock()
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Gadget not found"})
			return
		}

		delete(s.gadgets, id)
		s.mu.Unlock()

		w.WriteHeader(http.StatusNoContent)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
// /io - симуляція неблокуючої I/O операції через time.Sleep
func (s *Storage) handleIO(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Симулюємо затримку 100мс
	time.Sleep(100 * time.Millisecond)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "IO operation completed in Go",
		"timeMs":  100,
	})
}

// /cpu - важка обчислювальна операція (послідовна в одному потоці)
func (s *Storage) handleCPUSequential(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Виконуємо важкий цикл кілька разів послідовно
	var totalSum int64 = 0
	for j := 0; j < 3; j++ {
		var sum int64 = 0
		for i := 0; i < 4e8; i++ {
			sum += int64(i)
		}
		totalSum += sum
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "CPU sequential completed",
		"result":  totalSum,
	})
}

// /cpu-concurrent — та сама важка операція, але розподілена паралельно
func (s *Storage) handleCPUConcurrent(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	numWorkers := 3
	results := make(chan int64, numWorkers)

	// Запускаємо кожну важку задачу в окремій горутині
	for j := 0; j < numWorkers; j++ {
		go func() {
			var sum int64 = 0
			for i := 0; i < 4e8; i++ {
				sum += int64(i)
			}
			results <- sum
		}()
	}

	// Збираємо результати з каналів
	var totalSum int64 = 0
	for j := 0; j < numWorkers; j++ {
		totalSum += <-results
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "CPU concurrent (goroutines) completed",
		"result":  totalSum,
	})
}