const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const pool = require('../db/postgres.pool');
const wsManager = require('../websocket/ws.server');

async function exportUsersToCSV() {
    const outputPath = path.join(__dirname, '../../export.csv');
    const writer = fs.createWriteStream(outputPath);

    // Отримуємо загальну кількість для прогресу
    const countRes = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countRes.rows[0].count, 10);
    let processed = 0;

    // Пишемо заголовки CSV
    writer.write('id,name,email,created_at\n');

    // Читаємо дані з БД (умовно порціями або весь результат умовно потоково)
    const result = await pool.query('SELECT id, name, email, created_at FROM users');
    const rows = result.rows;

    // Створюємо Transform stream для перетворення рядка БД у CSV рядок
    const transformer = new Transform({
        objectMode: true,
        transform(row, encoding, callback) {
            processed++;
            const csvLine = `${row.id},"${row.name}","${row.email}",${row.created_at}\n`;

            // Надсилаємо прогрес через WebSocket (Лаба 5)
            wsManager.broadcast({
                type: "export_progress",
                processed,
                total: total > 0 ? total : 1
            });

            callback(null, csvLine);
        }
    });

    // Запускаємо ланцюжок потоків через .pipe() з Backpressure
    // Для цього використаємо Readable.from, яка перетворює масив у Readable Stream
    const { Readable } = require('stream');
    const readable = Readable.from(rows);

    return new Promise((resolve, reject) => {
        readable
            .pipe(transformer)
            .pipe(writer);

        writer.on('finish', () => resolve(outputPath));
        writer.on('error', reject);
    });
}

module.exports = { exportUsersToCSV };