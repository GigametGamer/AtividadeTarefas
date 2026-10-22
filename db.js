require('dotenv').config(); // Obriga a carregar o .env
const mariadb = require('mariadb');

function conectarBanco() {
    const con = mariadb.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'senai2026',
        database: process.env.DB_NAME || 'tarefas_db',
        port: Number(process.env.DB_PORT) || 3306,
        connectionLimit: 5
    });

    return con;
}

module.exports = conectarBanco;