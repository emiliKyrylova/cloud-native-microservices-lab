const express = require('express');
const router = express.Router();
const gadgetController = require('../controllers/gadget.controller');

router.get('/health', gadgetController.health);
router.get('/api/users', gadgetController.getAll); // для сумісності з назвами вимог лаби (або /api/gadgets)
router.get('/api/users/:id', gadgetController.getById);
router.post('/api/users', gadgetController.create);
router.put('/api/users/:id', gadgetController.update);
router.delete('/api/users/:id', gadgetController.delete);

module.exports = router;