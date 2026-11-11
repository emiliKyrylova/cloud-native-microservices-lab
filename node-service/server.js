const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let gadgets = [
    { id: "1", name: "MacBook Pro", price: 1999.99, inStock: true },
    { id: "2", name: "Logitech MX Master 3", price: 99.99, inStock: true }
];

app.get('/health', (req, res) => {
    res.status(200).json({ status: "UP", service: "node-service" });
});

app.post('/gadgets', (req, res) => {
    const { name, price, inStock } = req.body;
    if (!name || price === undefined) {
        return res.status(400).json({ error: "Name and price are required" });
    }
    const newGadget = {
        id: Date.now().toString(),
        name,
        price,
        inStock: inStock ?? true
    };
    gadgets.push(newGadget);
    return res.status(201).json(newGadget);
});

app.get('/gadgets', (req, res) => {
    return res.status(200).json(gadgets);
});

app.get('/gadgets/:id', (req, res) => {
    const gadget = gadgets.find(g => g.id === req.params.id);
    if (!gadget) {
        return res.status(404).json({ error: "Gadget not found" });
    }
    return res.status(200).json(gadget);
});

app.put('/gadgets/:id', (req, res) => {
    const gadget = gadgets.find(g => g.id === req.params.id);
    if (!gadget) {
        return res.status(404).json({ error: "Gadget not found" });
    }
    const { name, price, inStock } = req.body;
    if (name !== undefined) gadget.name = name;
    if (price !== undefined) gadget.price = price;
    if (inStock !== undefined) gadget.inStock = inStock;
    return res.status(200).json(gadget);
});

app.delete('/gadgets/:id', (req, res) => {
    const index = gadgets.findIndex(g => g.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: "Gadget not found" });
    }
    gadgets.splice(index, 1);
    return res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Node.js service is running on http://localhost:${PORT}`);
});

// Л.р №2 I/O та CPU емюляція

// /io Асинхронна I/O операція (симуляція запиту до бази/API через setTimeout)
app.get('/io', (req, res) => {
    // Симулюємо затримку введення-виведення на 100мс (не блокує Event Loop у Node.js)
    setTimeout(() => {
        res.status(200).json({ status: "success", message: "IO operation completed", timeMs: 100 });
    }, 100);
});

// /cpu Важка синхронна обчислювальна операція
app.get('/cpu', (req, res) => {
    let sum = 0;
    // Велика кількість ітерацій навантажує один єдиний потік Node.js
    for (let i = 0; i < 1e9; i++) {
        sum += i;
    }
    res.status(200).json({ status: "success", message: "CPU heavy operation completed", result: sum });
});