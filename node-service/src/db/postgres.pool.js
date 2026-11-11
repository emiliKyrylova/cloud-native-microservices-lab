const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DB || 'appdb',
    user: process.env.PG_USER || 'appuser',
    password: process.env.PG_PASSWORD || 'secret',
    max: 15,
    idleTimeoutMillis: 30000,
});

module.exports = pool;