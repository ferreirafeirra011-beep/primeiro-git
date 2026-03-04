const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

const ARQUIVO = "produtos.json";

app.use(express.json());
app.use(express.static("public"));

// Criar arquivo se não existir
if (!fs.existsSync(ARQUIVO)) {
    fs.writeFileSync(ARQUIVO, JSON.stringify([]));
}

function carregarProdutos() {
    return JSON.parse(fs.readFileSync(ARQUIVO));
}

function salvarProdutos(produtos) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(produtos, null, 2));
}

// LISTAR
app.get("/produtos", (req, res) => {
    res.json(carregarProdutos());
});

// CADASTRAR
app.post("/produtos", (req, res) => {
    const produtos = carregarProdutos();
    const { nome, preco, quantidade } = req.body;

    if (produtos.find(p => p.nome.toLowerCase() === nome.toLowerCase())) {
        return res.status(400).json({ erro: "Produto já existe" });
    }

    produtos.push({ nome, preco, quantidade });
    salvarProdutos(produtos);
    res.json({ mensagem: "Produto cadastrado" });
});

// EXCLUIR
app.delete("/produtos/:nome", (req, res) => {
    let produtos = carregarProdutos();
    produtos = produtos.filter(p => p.nome !== req.params.nome);
    salvarProdutos(produtos);
    res.json({ mensagem: "Produto removido" });
});

// VENDER
app.post("/vender/:nome", (req, res) => {
    const produtos = carregarProdutos();
    const produto = produtos.find(p => p.nome === req.params.nome);

    if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

    if (produto.quantidade <= 0)
        return res.status(400).json({ erro: "Sem estoque" });

    produto.quantidade--;
    salvarProdutos(produtos);

    res.json({ mensagem: "Venda realizada" });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});