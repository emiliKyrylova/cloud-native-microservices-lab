const userRepository = require('../repositories/user-repository.factory');
const { hashPassword, verifyPassword } = require('../auth/password');
const { generateTokens, verifyRefreshToken } = require('../auth/jwt.service');
const eventLogger = require('../events/event.logger');

class AuthService {
    async register(name, email, password) {
        if (!name || !email || !password || password.length < 8) {
            const err = new Error("Invalid input: password must be at least 8 characters");
            err.statusCode = 400;
            throw err;
        }

        const passwordHash = await hashPassword(password);

        // Створюємо юзера (репозиторій сам викине 409 Conflict, якщо email дублюється)
        const newUser = await userRepository.create({
            name,
            email,
            password_hash: passwordHash,
            role: 'user'
        });

        await eventLogger.logEvent('user_registered', newUser.id || newUser._id, { name, email });

        // Формуємо DTO (без password_hash!)
        return {
            id: newUser.id || newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        };
    }

    async login(email, password) {
        if (!email || !password) {
            const err = new Error("Invalid credentials");
            err.statusCode = 401;
            throw err;
        }

        // Шукаємо юзера за email (у всіх репо має бути метод findByEmail або пошук в масиві)
        const users = await userRepository.findAll();
        const user = users.find(u => u.email === email);

        if (!user) {
            await eventLogger.logEvent('login_failed', null, { email, reason: 'user_not_found' });
            const err = new Error("Invalid credentials");
            err.statusCode = 401;
            throw err;
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            await eventLogger.logEvent('login_failed', user.id || user._id, { email, reason: 'wrong_password' });
            const err = new Error("Invalid credentials");
            err.statusCode = 401;
            throw err;
        }

        await eventLogger.logEvent('user_logged_in', user.id || user._id, { email });
        return generateTokens(user);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            const err = new Error("Refresh token required");
            err.statusCode = 401;
            throw err;
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            await eventLogger.logEvent('token_rejected', null, { type: 'refresh_token' });
            const err = new Error("Invalid or expired refresh token");
            err.statusCode = 401;
            throw err;
        }

        // Генеруємо нову пару токенів
        return generateTokens({ id: decoded.sub, role: decoded.role });
    }
}

module.exports = new AuthService();