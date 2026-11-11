const gadgetService = require('../services/gadget.service');

class GadgetController {
    async health(req, res) {
        res.status(200).json({ status: "UP", service: "node-service-layered" });
    }

    async getAll(req, res, next) {
        try {
            const gadgets = await gadgetService.getAllGadgets();
            res.status(200).json(gadgets);
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const gadget = await gadgetService.getGadgetById(req.params.id);
            res.status(200).json(gadget);
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const newGadget = await gadgetService.createGadget(req.body);
            res.status(201).json(newGadget);
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const updated = await gadgetService.updateGadget(req.params.id, req.body);
            res.status(200).json(updated);
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await gadgetService.deleteGadget(req.params.id);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new GadgetController();