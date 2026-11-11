const express = require('express');
const router = express.Router();
const accountService = require('../services/account.service');

router.post('/api/accounts/transfer', async (req, res, next) => {
    try {
        const { fromAccountId, toAccountId, amount } = req.body;

        if (!fromAccountId || !toAccountId || amount === undefined) {
            return res.status(400).json({ error: "fromAccountId, toAccountId and amount are required" });
        }

        const result = await accountService.transferMoney(fromAccountId, toAccountId, parseFloat(amount));
        res.status(200).json(result);
    } catch (err) {
        // Якщо помилка недостатнього балансу або відсутності рахунку — повертаємо 400 або 404
        const statusCode = err.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({ error: err.message });
    }
});

module.exports = router;