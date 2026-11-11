const { connectMongo } = require('../db/mongo.client');

class EventLogger {
    async logEvent(eventType, entityId, data) {
        try {
            const db = await connectMongo();
            const eventsCollection = db.collection('events');

            await eventsCollection.insertOne({
                type: eventType,
                entityId: entityId,
                data: data,
                timestamp: new Date()
            });
            console.log(`📝 Event logged to MongoDB: [${eventType}] for entity ID ${entityId}`);
        } catch (err) {
            console.error("⚠️ Failed to log event to MongoDB:", err.message);
        }
    }
}

module.exports = new EventLogger();