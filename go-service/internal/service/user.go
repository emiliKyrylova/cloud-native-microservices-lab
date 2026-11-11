package service

import (
	"errors"
	"fmt"
	"go-service/internal/model"
	"go-service/internal/repository"
	"time"
)

type UserService struct {
	repo repository.UserRepository // Залежність від інтерфейсу, а не від конкретної БД!
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) GetAllUsers() ([]model.User, error) {
	return s.repo.FindAll()
}

func (s *UserService) GetUserByID(id string) (model.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return model.User{}, fmt.Errorf("user_not_found: User with id %s was not found", id)
	}
	return user, nil
}

func (s *UserService) CreateUser(name, email string) (model.User, error) {
	if name == "" || email == "" {
		return model.User{}, errors.New("invalid_payload: Name and email are required")
	}

	newUser := model.User{
	    ID:    fmt.Sprintf("%d", time.Now().UnixNano()),
		Name:  name,
		Email: email,
	}

	return s.repo.Create(newUser)
}

func (s *UserService) UpdateUser(id string, name, email string) (model.User, error) {
	_, err := s.GetUserByID(id) // перевіряємо чи існує
	if err != nil {
		return model.User{}, err
	}

	updatedUser := model.User{
		ID:    id,
		Name:  name,
		Email: email,
	}

	return s.repo.Update(id, updatedUser)
}

func (s *UserService) DeleteUser(id string) error {
	_, err := s.GetUserByID(id) // перевіряємо чи існує
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}