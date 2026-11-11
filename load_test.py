import time
import requests
import statistics
import concurrent.futures

URLS = {
    "Node.js I/O": "http://localhost:3000/io",
    "Node.js CPU": "http://localhost:3000/cpu",
    "Go I/O": "http://localhost:4000/io",
    "Go CPU (Seq)": "http://localhost:4000/cpu",
    "Go CPU (Concurrent)": "http://localhost:4000/cpu-concurrent",
}


def send_request(url):
    start = time.time()
    try:
        response = requests.get(url, timeout=30)
        duration = (time.time() - start) * 1000  # у мілісекундах
        return response.status_code == 200, duration
    except Exception:
        return False, 0


def benchmark(name, url, requests_count=100, concurrency=10):
    print(f"\nТестуємо: {name} ({url})... Запитів: {requests_count}, Потоків: {concurrency}")

    latencies = []
    success_count = 0

    start_total = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(send_request, url) for _ in range(requests_count)]
        for future in concurrent.futures.as_completed(futures):
            success, latency = future.result()
            if success:
                success_count += 1
                latencies.append(latency)

    total_time = time.time() - start_total
    rps = requests_count / total_time if total_time > 0 else 0

    if latencies:
        avg = statistics.mean(latencies)
        latencies.sort()
        p95 = latencies[int(len(latencies) * 0.95)]
        p99 = latencies[int(len(latencies) * 0.99)]
    else:
        avg = p95 = p99 = 0

    print(f"Результати для {name}:")
    print(f"   RPS: {rps:.2f} req/sec")
    print(f"   Avg Latency: {avg:.2f} ms")
    print(f"   p95: {p95:.2f} ms")
    print(f"   p99: {p99:.2f} ms")


if __name__ == "__main__":
    print("Увага! Перед запуском переконайся, що обидва сервіси запущені (через runner.py).")
    # Тестуємо послідовно
    for name, url in URLS.items():
        # Для CPU ставимо менше запитів і потоків, щоб не покласти комп'ютер, для I/O - більше
        concurrency = 5 if "CPU" in name else 20
        count = 20 if "CPU" in name else 100
        benchmark(name, url, requests_count=count, concurrency=concurrency)