const express = require('express');
const dotenv = require('dotenv');
const conectarBanco = require('./db.js');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

const PORTA = process.env.PORTA || 3000;
const conexao = conectarBanco();

// Testar conexão (Variáveis alinhadas corretamente)
conexao.getConnection()
    .then(conn => {
        console.log("Conexão com o MariaDB estabelecida com sucesso!");
        conn.release();
    })
    .catch(err => {
        console.error("Erro crítico ao ligar ao MariaDB:", err.message);
    });

app.get('/', (req, res) => {
    res.json("Servidor a correr");
});

app.get("/tarefas", async (req, res) => {
    try {
        const resposta = await conexao.query("SELECT * FROM tarefas");
        res.json(resposta);
    } catch (erro) {
        res.status(500).json({ message: "Erro ao buscar tarefas", erro: erro.message });
    }
});

app.get("/tarefas/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const resposta = await conexao.query("SELECT * FROM tarefas WHERE id = ?", [id]);
        
        if (resposta.length === 0) {
            return res.status(404).json({ message: "Tarefa não encontrada" });
        }
        
        res.json(resposta[0]);
    } catch (erro) {
        res.status(500).json({ message: "Erro ao buscar a tarefa", erro: erro.message });
    }
});

app.post("/tarefas", async (req, res) => {
    const { nome, descricao, responsavel, data_tarefa, concluido } = req.body || {};

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
    }

    try {
        const query = `
            INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const resultado = await conexao.query(query, [
            nome, 
            descricao || null, 
            responsavel || null,
            data_tarefa || null,
            concluido !== undefined ? concluido : false
        ]);

        res.status(201).json({
            id: resultado.insertId.toString(),
            nome,
            descricao: descricao || null,
            responsavel: responsavel || null,
            data_tarefa: data_tarefa || null,
            concluido: concluido !== undefined ? concluido : false
        });
    } catch (erro) {
        res.status(500).json({ message: "Erro ao criar tarefa", erro: erro.message });
    }
});

app.put("/tarefas/:id", async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, responsavel, data_tarefa, concluido } = req.body || {};

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ message: "O campo 'nome' é obrigatório e não pode ser nulo ou vazio." });
    }

    try {
        const query = `
            UPDATE tarefas 
            SET nome = ?, descricao = ?, responsavel = ?, data_tarefa = ?, concluido = ? 
            WHERE id = ?
        `;
        const resultado = await conexao.query(query, [
            nome, 
            descricao || null, 
            responsavel || null,
            data_tarefa || null,
            concluido !== undefined ? concluido : false, 
            id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: "Tarefa não encontrada para atualização" });
        }

        res.json({ message: "Tarefa atualizada com sucesso", id, nome, descricao, responsavel, data_tarefa, concluido });
    } catch (erro) {
        res.status(500).json({ message: "Erro ao atualizar tarefa", erro: erro.message });
    }
});

app.delete("/tarefas/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await conexao.query("DELETE FROM tarefas WHERE id = ?", [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: "Tarefa não encontrada para remoção" });
        }

        res.json({ message: "Tarefa eliminada com sucesso", id });
    } catch (erro) {
        res.status(500).json({ message: "Erro ao deletar tarefa", erro: erro.message });
    }
});

app.listen(PORTA, () => {
    console.log(`Servidor a correr na porta ${PORTA}`);
});