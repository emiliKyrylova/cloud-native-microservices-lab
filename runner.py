import subprocess
import time
import sys
import os


def run_services():
    # Отримуємо шлях до кореневої папки проєкту
    root_dir = os.path.dirname(os.path.abspath(__file__))

    node_dir = os.path.join(root_dir, "node-service")
    go_dir = os.path.join(root_dir, "go-service")

    print("Запускаємо мікросервіси...")

    # Запуск Node.js сервісу
    # Використовуємо npm start або node server.js
    node_process = subprocess.Popen(
        ["node", "server.js"],
        cwd=node_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True
    )

    # Запуск Go сервісу
    go_process = subprocess.Popen(
        ["go", "run", "main.go"],
        cwd=go_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True
    )

    # Даємо серверам кілька секунд на старт
    time.sleep(2)

    print("\n" + "=" * 50)
    print("Сервіси успішно запущені.")
    print("-" * 50)
    print("  Node.js (Express) Health : http://localhost:3000/health")
    print("  Node.js (Express) Gadgets: http://localhost:3000/gadgets")
    print("-" * 50)
    print("  Go (net/http) Health     : http://localhost:4000/health")
    print("  Go (net/http) Gadgets    : http://localhost:4000/gadgets")
    print("=" * 50)

    try:
        # Утримуємо скрипт активним, щоб процеси не закривалися
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nЗупиняємо сервіси...")
        node_process.terminate()
        go_process.terminate()
        print("Успішно зупинено.")


if __name__ == "__main__":
    run_services()