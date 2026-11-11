const gadgetRepository = require('../repositories/gadget.repository');

class GadgetService {
    async getAllGadgets() {
        return await gadgetRepository.findAll();
    }

    async getGadgetById(id) {
        const gadget = await gadgetRepository.findById(id);
        if (!gadget) {
            const error = new Error(`Gadget with id ${id} was not found`);
            error.statusCode = 404;
            error.errorCode = "gadget_not_found";
            throw error;
        }
        return gadget;
    }

    async createGadget(data) {
        if (!data.name || data.price === undefined) {
            const error = new Error("Name and price are required fields");
            error.statusCode = 400;
            error.errorCode = "invalid_payload";
            throw error;
        }
        return await gadgetRepository.create(data);
    }

    async updateGadget(id, data) {
        await this.getGadgetById(id); // Перевірка чи існує
        const updated = await gadgetRepository.update(id, data);
        return updated;
    }

    async deleteGadget(id) {
        await this.getGadgetById(id); // Перевірка чи існує
        await gadgetRepository.delete(id);
        return true;
    }
}

module.exports = new GadgetService();