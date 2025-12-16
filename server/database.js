const mysql = require('mysql2');
require('dotenv').config();

// Configuração da conexão MySQL
// Na Hostinger, você deve criar o banco e usuário no painel de controle
// e colocar essas informações num arquivo .env na raiz da pasta server
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        console.log('DICA: Verifique se criou o banco de dados no painel da Hostinger e atualizou as credenciais.');
    } else {
        console.log('Conectado ao banco de dados MySQL.');
        initDb();
    }
});

function initDb() {
    // Tabela de Usuários
    const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        avatarUrl TEXT,
        address TEXT,
        balance DECIMAL(10, 2) DEFAULT 0.00
    )`;

    // Tabela de Refeições
    const mealsTable = `
    CREATE TABLE IF NOT EXISTS meals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cookId INT NOT NULL,
        cookName VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        imageUrl TEXT,
        available TINYINT(1) DEFAULT 1
    )`;

    // Tabela de Pedidos
    const ordersTable = `
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientId INT NOT NULL,
        clientName VARCHAR(255),
        cookId INT NOT NULL,
        cookName VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pendente',
        total DECIMAL(10, 2) NOT NULL,
        items TEXT, -- JSON String
        paymentMethod VARCHAR(100),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

    db.query(usersTable, (err) => { if (err) console.error('Erro tabela users:', err); });
    db.query(mealsTable, (err) => { if (err) console.error('Erro tabela meals:', err); });
    db.query(ordersTable, (err) => { if (err) console.error('Erro tabela orders:', err); });
}

module.exports = db;