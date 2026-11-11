class InMemoryUserRepository {
    constructor() {
        this.users = [
            { id: "1", name: "John Doe", email: "john@example.com" },
            { id: "2", name: "Jane Smith", email: "jane@example.com" }
        ];
    }

    async findAll() {
        return this.users;
    }

    async findById(id) {
        return this.users.find(u => u.id === id) || null;
    }

    async create(userData) {
        const newUser = { id: Date.now().toString(), ...userData };
        this.users.push(newUser);
        return newUser;
    }

    async update(id, updateData) {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) return null;
        this.users[index] = { ...this.users[index], ...updateData };
        return this.users[index];
    }

    async delete(id) {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) return false;
        this.users.splice(index, 1);
        return true;
    }
}

module.exports = new InMemoryUserRepository();