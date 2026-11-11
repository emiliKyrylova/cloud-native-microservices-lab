const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const { exportUsersToCSV } = require('../streams/export.stream');

router.get('/api/users', async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

router.post('/api/users', async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
});

router.get('/api/users/export', async (req, res, next) => {
    try {
        const filePath = await exportUsersToCSV();
        res.status(200).json({ message: "Export completed successfully", file: filePath });
    } catch (err) {
        next(err);
    }
});

router.put('/api/users/:id', async (req, res, next) => {
    try {
        const updated = await userService.updateUser(req.params.id, req.body);
        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
});

router.delete('/api/users/:id', async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;