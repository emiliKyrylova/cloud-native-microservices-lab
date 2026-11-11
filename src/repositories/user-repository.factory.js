require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const postgresRepo = require('./postgres-user.repository');
const mongoRepo = require('./mongo-user.repository');
const inMemoryRepo = require('./in-memory-user.repository');

function getUserRepository() {
    const repoType = process.env.REPO_TYPE || 'postgres';
    console.log(`🔍 DEBUG: REPO_TYPE from env is -> [${repoType}]`);

    switch (repoType.trim()) {
        case 'postgres':
            console.log("🗄️ Using PostgreSQL Repository");
            return postgresRepo;
        case 'mongo':
            console.log("🍃 Using MongoDB Repository");
            return mongoRepo;
        case 'memory':
            console.log("🧠 Using InMemory Repository");
            return inMemoryRepo;
        default:
            console.log("🗄️ Using default PostgreSQL Repository");
            return postgresRepo;
    }
}

module.exports = getUserRepository();