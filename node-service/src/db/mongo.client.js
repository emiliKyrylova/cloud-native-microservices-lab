const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri, {
    maxPoolSize: 15
});

let dbConnection;

async function connectMongo() {
    if (!dbConnection) {
        await client.connect();
        dbConnection = client.db(process.env.MONGO_DB || 'appdb');
        console.log("📦 Connected to MongoDB successfully");

        // Створення унікального індексу на email та колекції events
        await dbConnection.collection('users').createIndex({ email: 1 }, { unique: true });
    }
    return dbConnection;
}

module.exports = { connectMongo, client };