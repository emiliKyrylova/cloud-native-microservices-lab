const express = require('express');
const router = express.Router();
const { connectMongo } = require('../db/mongo.client');

router.get('/api/events', async (req, res, next) => {
    try {
        const db = await connectMongo();
        // Отримуємо останні 50 подій з MongoDB, відсортовані за часом
        const events = await db.collection('events')
            .find({})
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();

        res.status(200).json(events);
    } catch (err) {
        next(err);
    }
});

module.exports = router;