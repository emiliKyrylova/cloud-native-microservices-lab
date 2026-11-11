const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12; // Вимога: cost factor не менше 12

async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };