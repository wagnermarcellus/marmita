const express = require('express');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'marmita_secret_key';

app.use(cors());
app.use(express.json());

// --- Authentication ---

app.post('/auth/register', (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [name, email, hashedPassword, role], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: err.message });
        }
        
        const user = { id: result.insertId, name, email, role };
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
        res.json({ user, token });
    });
});

app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;

    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "User not found" });

        const user = results[0];
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
        // Don't send password back
        const { password: _, ...userData } = user;
        res.json({ user: userData, token });
    });
});

// --- Meals ---

app.get('/meals', (req, res) => {
    db.query(`SELECT * FROM meals WHERE available = 1`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        // MySQL stores booleans as TINYINT (0 or 1), let's ensure frontend gets boolean if needed, 
        // though JS treats 1 as true usually.
        res.json(results);
    });
});

app.post('/meals', (req, res) => {
    const { cookId, cookName, title, description, price, imageUrl } = req.body;
    const sql = `INSERT INTO meals (cookId, cookName, title, description, price, imageUrl, available) VALUES (?, ?, ?, ?, ?, ?, 1)`;

    db.query(sql, [cookId, cookName, title, description, price, imageUrl], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// --- Orders ---

app.get('/orders', (req, res) => {
    const { userId, role } = req.query; 
    let sql = '';
    let params = [];

    if (role === 'cliente') {
        sql = 'SELECT * FROM orders WHERE clientId = ? ORDER BY id DESC';
        params = [userId];
    } else {
        sql = 'SELECT * FROM orders WHERE cookId = ? ORDER BY id DESC';
        params = [userId];
    }
    
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // MySQL returns items as a JSON string (TEXT field), need to parse it back to object
        const orders = results.map(r => ({
            ...r,
            items: JSON.parse(r.items)
        }));
        res.json(orders);
    });
});

app.post('/orders', (req, res) => {
    const { clientId, clientName, cookId, cookName, items, total, paymentMethod } = req.body;
    const itemsJson = JSON.stringify(items);
    
    const sql = `INSERT INTO orders (clientId, clientName, cookId, cookName, status, total, items, paymentMethod, createdAt) VALUES (?, ?, ?, ?, 'pendente', ?, ?, ?, NOW())`;

    db.query(sql, [clientId, clientName, cookId, cookName, total, itemsJson, paymentMethod], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, status: 'pendente' });
    });
});

// Root route for health check
app.get('/', (req, res) => {
    res.send('Marmita Connect API (MySQL) is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});