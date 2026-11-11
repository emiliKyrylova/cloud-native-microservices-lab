const userRepository = require('../repositories/user-repository.factory');
const eventLogger = require('../events/event.logger');
const wsManager = require('../websocket/ws.server'); // З лаби 5

class UserService {
    async getAllUsers() {
        return await userRepository.findAll();
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            const error = new Error(`User with id ${id} was not found`);
            error.statusCode = 404;
            error.errorCode = "user_not_found";
            throw error;
        }
        return user;
    }

    async createUser(data) {
        const newUser = await userRepository.create(data);

        // Поліглот: логування події в MongoDB
        await eventLogger.logEvent('user_created', newUser.id || newUser._id, newUser);

        // WS Broadcast (з Лаби 5)
        wsManager.broadcast({
            type: 'user_created',
            data: newUser,
            timestamp: new Date().toISOString()
        });

        return newUser;
    }

    async updateUser(id, data) {
        const updated = await userRepository.update(id, data);
        if (!updated) {
            const error = new Error(`User with id ${id} was not found`);
            error.statusCode = 404;
            error.errorCode = "user_not_found";
            throw error;
        }

        await eventLogger.logEvent('user_updated', id, updated);
        wsManager.broadcast({
            type: 'user_updated',
            data: updated,
            timestamp: new Date().toISOString()
        });

        return updated;
    }

    async deleteUser(id) {
        const deleted = await userRepository.delete(id);
        if (!deleted) {
            const error = new Error(`User with id ${id} was not found`);
            error.statusCode = 404;
            error.errorCode = "user_not_found";
            throw error;
        }

        await eventLogger.logEvent('user_deleted', id, { id });
        wsManager.broadcast({
            type: 'user_deleted',
            data: { id },
            timestamp: new Date().toISOString()
        });

        return true;
    }
}

module.exports = new UserService();