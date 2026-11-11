const pool = require('../db/postgres.pool');

class PostgresUserRepository {
    async findAll() {
        const result = await pool.query('SELECT id, name, email, created_at FROM users');
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async create(userData) {
        try {
            const result = await pool.query(
                'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
                [userData.name, userData.email]
            );
            return result.rows[0];
        } catch (err) {
            if (err.code === '23505') { // Помилка дубліката email у Postgres
                const error = new Error(`User with email ${userData.email} already exists`);
                error.statusCode = 409;
                error.errorCode = "conflict_email";
                throw error;
            }
            throw err;
        }
    }

    async update(id, updateData) {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at',
            [updateData.name, updateData.email, id]
        );
        return result.rows[0] || null;
    }

    async delete(id) {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        return result.rowCount > 0;
    }
}

module.exports = new PostgresUserRepository();