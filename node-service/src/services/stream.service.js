const fs = require('fs');
const { Transform } = require('stream');

class StreamService {
    // 1 & 2. Генерація тестового файлу (якщо його ще немає)
    generateTestFile(filePath, sizeInMB = 10) {
        if (fs.existsSync(filePath)) return;

        console.log(`⏳ Генеруємо тестовий файл (${sizeInMB} MB)...`);
        const writer = fs.createWriteStream(filePath);
        const chunk = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Line data record.\n";

        const totalChunks = (sizeInMB * 1024 * 1024) / Buffer.byteLength(chunk);
        for (let i = 0; i < totalChunks; i++) {
            writer.write(chunk);
        }
        writer.end();
        console.log("✅ Тестовий файл успішно згенеровано!");
    }

    // 3, 4 & 5. Потокова обробка з можливістю симуляції повільного споживача (Backpressure)
    processFileStream(inputPath, outputPath, isSlowConsumer = false, onProgress = null) {
        return new Promise((resolve, reject) => {
            const stats = fs.statSync(inputPath);
            const totalSize = stats.size;
            let processedBytes = 0;

            // Readable Stream (читання порціями, висока продуктивність)
            const reader = fs.createReadStream(inputPath, { highWaterMark: 64 * 1024 }); // 64KB буфер

            // Transform Stream (трансформація даних «на льоту»)
            const transformer = new Transform({
                transform(chunk, encoding, callback) {
                    processedBytes += chunk.length;

                    // Відправляємо прогрес через WebSocket, якщо передана функція зворотного виклику
                    if (onProgress) {
                        onProgress({
                            type: "progress",
                            processed: processedBytes,
                            total: totalSize,
                            percent: Math.round((processedBytes / totalSize) * 100)
                        });
                    }

                    // Трансформація: перетворюємо текст на верхній регістр
                    const transformed = chunk.toString().toUpperCase();
                    callback(null, transformed);
                }
            });

            // Writable Stream (штучно повільний або звичайний споживач)
            const writer = new fs.WriteStream(outputPath);

            // Симуляція повільного споживача для демонстрації Backpressure
            if (isSlowConsumer) {
                // Перевизначаємо метод write, щоб створити штучну затримку (затримка 10мс на кожен chunk)
                const originalWrite = writer.write;
                writer.write = (chunk, encoding, cb) => {
                    setTimeout(() => {
                        originalWrite.call(writer, chunk, encoding, cb);
                    }, 10); // Затримуємо запис
                };
            }

            // Зв'язування потоків через .pipe() з урахуванням backpressure
            reader
                .pipe(transformer)
                .pipe(writer);

            writer.on('finish', () => resolve({ processedBytes, outputPath }));
            writer.on('error', (err) => reject(err));
            reader.on('error', (err) => reject(err));
            transformer.on('error', (err) => reject(err));
        });
    }
}

module.exports = new StreamService();