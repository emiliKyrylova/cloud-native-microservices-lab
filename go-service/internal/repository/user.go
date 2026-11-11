package repository

import (
	"errors"
	"go-service/internal/model"
	"sync"
)

// UserRepository визначає контракт (інтерфейс), завдяки якому можна легко підмінити InMemory на БД
type UserRepository interface {
	FindAll() ([]model.User, error)
	FindByID(id string) (model.User, error)
	Create(user model.User) (model.User, error)
	Update(id string, user model.User) (model.User, error)
	Delete(id string) error
}

// InMemoryRepository реалізує UserRepository за допомогою мапи в пам'яті
type InMemoryRepository struct {
	mu    sync.RWMutex
	users map[string]model.User
}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{
		users: map[string]model.User{
			"1": {ID: "1", Name: "John Doe", Email: "john@example.com"},
			"2": {ID: "2", Name: "Jane Smith", Email: "jane@example.com"},
		},
	}
}

func (r *InMemoryRepository) FindAll() ([]model.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	users := make([]model.User, 0, len(r.users))
	for _, u := range r.users {
		users = append(users, u)
	}
	return users, nil
}

func (r *InMemoryRepository) FindByID(id string) (model.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	u, exists := r.users[id]
	if !exists {
		return model.User{}, errors.New("user not found")
	}
	return u, nil
}

func (r *InMemoryRepository) Create(user model.User) (model.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.users[user.ID] = user
	return user, nil
}

func (r *InMemoryRepository) Update(id string, user model.User) (model.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.users[id]; !exists {
		return model.User{}, errors.New("user not found")
	}
	r.users[id] = user
	return user, nil
}

func (r *InMemoryRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.users[id]; !exists {
		return errors.New("user not found")
	}
	delete(r.users, id)
	return nil
}