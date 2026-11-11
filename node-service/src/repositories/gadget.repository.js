let gadgets = [
    { id: "1", name: "MacBook Pro", price: 1999.99, inStock: true },
    { id: "2", name: "Logitech MX Master 3", price: 99.99, inStock: true }
];

class GadgetRepository {
    async findAll() {
        return gadgets;
    }

    async findById(id) {
        return gadgets.find(g => g.id === id) || null;
    }

    async create(gadgetData) {
        const newGadget = { id: Date.now().toString(), ...gadgetData };
        gadgets.push(newGadget);
        return newGadget;
    }

    async update(id, updateData) {
        const index = gadgets.findIndex(g => g.id === id);
        if (index === -1) return null;
        gadgets[index] = { ...gadgets[index], ...updateData };
        return gadgets[index];
    }

    async delete(id) {
        const index = gadgets.findIndex(g => g.id === id);
        if (index === -1) return false;
        gadgets.splice(index, 1);
        return true;
    }
}

module.exports = new GadgetRepository();