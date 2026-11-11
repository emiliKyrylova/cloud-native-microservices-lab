const pool = require('../../node-service/src/db/postgres.pool');

class AccountService {
    async transferMoney(fromAccountId, toAccountId, amount) {
        const client = await pool.connect(); // Ручне отримання з'єднання з пулу
        try {
            await client.query('BEGIN'); // Початок транзакції

            // 1. Перевірка балансу відправника
            const senderRes = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromAccountId]);
            if (senderRes.rows.length === 0) throw new Error("Sender account not found");

            const currentBalance = parseFloat(senderRes.rows[0].balance);
            if (currentBalance < amount) {
                throw new Error("Insufficient funds (rollback initiated)");
            }

            // 2. Списання коштів
            await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromAccountId]);

            // 3. Зарахування коштів
            await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toAccountId]);

            await client.query('COMMIT'); // Успіх -> фіксуємо транзакцію
            return { success: true, message: "Transfer completed successfully" };
        } catch (err) {
            await client.query('ROLLBACK'); // Помилка -> скасовуємо зміни
            throw err;
        } finally {
            client.release(); // Обов'язкове повернення з'єднання в пул у блоці finally
        }
    }
}

module.exports = new AccountService();