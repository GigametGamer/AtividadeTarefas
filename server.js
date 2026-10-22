const express = require('express');
const dotenv = require('dotenv');
const conectarBanco = require('./db.js');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static('./public'));

const PORTA = process.env.PORTA || 3000;
const conexao = conectarBanco();

app.get('/', (req, res) => {
    res.json("Servidor a correr");
})

app.get("/tarefas", async (req, res) => {
    try {
        // O pool da lib 'mariadb' aceita chamadas diretas a .query()
        const resposta = await conexao.query("SELECT * FROM tarefas");
        
        // Em mariadb, os BigInt (como IDs) podem precisar de tratamento caso a resposta falhe a serializar JSON
        res.json(resposta);
    } catch (erro) {
        res.status(500).json({ message: "Erro ao buscar tarefas", erro: erro.message });
    }
});

app.listen(PORTA, () => {
    console.log(`Servidor a correr na porta ${PORTA}`);
});


// Adicione isto logo após criar a constante conexao no server.js:
conexao.getConnection()
    .then(conn => {
        console.log("Conexão com o MariaDB estabelecida com sucesso!");
        conn.release();
    })
    .catch(err => {
        console.error("Erro crítico ao ligar ao MariaDB:", err.message);
    });