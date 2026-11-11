package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// Структури даних
type Job struct {
	ID    int
	Value int
}

type Result struct {
	JobID int
	Value int
}

// Воркер обробляє задачі з каналу jobs і записує результат в results
func worker(ctx context.Context, id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done() // Повідомляємо WaitGroup, що воркер завершив роботу

	for {
		select {
		case <-ctx.Done():
			// Контекст скасовано (таймаут або відміна) - завершуємо роботу
			return
		case job, ok := <-jobs:
			if !ok {
				// Канал задач закритий і пустий - виходимо
				return
			}

			// Симуляція корисної роботи
            time.Sleep(time.Microsecond * 500) // зменшили затримку в 4 рази

			// Обчислюємо результат (наприклад, множимо значення на 2)
			resValue := job.Value * 2

			// Відправляємо результат в канал результатів
			results <- Result{
				JobID: job.ID,
				Value: resValue,
			}
		}
	}
}

// Функція для запуску всього патерну Worker Pool та вимірювання часу
func RunWorkerPoolBenchmark(totalTasks int, numWorkers int, bufferSize int) time.Duration {
	startTime := time.Now()

	// Створюємо канали з урахуванням переданого розміру буфера
	jobs := make(chan Job, bufferSize)
	results := make(chan Result, bufferSize)

	// Створюємо контекст з обмеженням часу (захист від зависань), наприклад 10 секунд
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var wg sync.WaitGroup

	// Запускаємо Worker Pool
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(ctx, w, jobs, results, &wg)
	}

	// Генератор задач запускаємо в окремій горутині, щоб не блокувати головний потік
	go func() {
		for i := 1; i <= totalTasks; i++ {
			jobs <- Job{ID: i, Value: i}
		}
		close(jobs) // Закриваємо канал після відправки всіх задач, щоб воркери знали, що робота закінчена
	}()

	// Збирач результатів — закриваємо канал результатів після завершення всіх воркерів
	go func() {
		wg.Wait()
		close(results)
	}()

	// Читаємо результати з каналу
	processedCount := 0
	for range results {
		processedCount++
	}

	duration := time.Since(startTime)
	return duration
}

func main() {
	fmt.Println("Л.р №3 Дослідження патерну Worker Pool у Go")

	// Тестуємо різні конфігурації
	configs := []struct {
		tasks   int
		workers int
		buffer  int
	}{
		{2000, 1, 0},
		{2000, 2, 0},
		{2000, 4, 0},
		{2000, 8, 0},
		{2000, 4, 100},
		{2000, 8, 100},
	}

	fmt.Println("\nTasks\tWorkers\tBuffer\tTime, ms")
	fmt.Println("-----------------------------------------")

	for _, cfg := range configs {
		duration := RunWorkerPoolBenchmark(cfg.tasks, cfg.workers, cfg.buffer)
		fmt.Printf("%d\t%d\t\t%d\t\t%d ms\n", cfg.tasks, cfg.workers, cfg.buffer, duration.Milliseconds())
	}
}