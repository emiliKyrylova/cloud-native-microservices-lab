const { connectMongo } = require('../../node-service/src/db/mongo.client');
const { ObjectId } = require('mongodb');

class MongoUserRepository {
    async findAll() {
        const db = await connectMongo();
        return await db.collection('users').find({}).toArray();
    }

    async findById(id) {
        const db = await connectMongo();
        try {
            return await db.collection('users').findOne({ _id: new ObjectId(id) });
        } catch {
            return null;
        }
    }

    async create(userData) {
        const db = await connectMongo();
        try {
            const result = await db.collection('users').insertOne(userData);
            return { id: result.insertedId, ...userData };
        } catch (err) {
            if (err.code === 11000) { // Код помилки MongoDB для дубліката індексу (email)
                const error = new Error(`User with email ${userData.email} already exists`);
                error.statusCode = 409;
                error.errorCode = "conflict_email";
                throw error;
            }
            throw err;
        }
    }

    async update(id, updateData) {
        const db = await connectMongo();
        try {
            const result = await db.collection('users').findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );
            return result.value || null;
        } catch {
            return null;
        }
    }

    async delete(id) {
        const db = await connectMongo();
        try {
            const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch {
            return false;
        }
    }
}

module.exports = new MongoUserRepository();