const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const users = require('./mysql');
const { match } = require("assert");

const app = express();
app.use(cors()); // permite chamadas do frontend
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // servir imagens

// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // pasta para salvar as imagens
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });


// //// ///// rota para listar todos os users ..............



// Rota para listar todos os usuários
app.get("/users", async (req, res) => {
    try {
        const allUsers = await users.findAll(); // pega todos os registros
        res.json(allUsers);
    } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
});



////////////rota com dados fichos

// Dados fixos de login
const usuarioFix = {
    nome: "user_omix_escola18",
    senha: "adimi18"
};


app.post("/login", (req, res) => {
    const { nome, senha } = req.body;

    if (nome === usuarioFix.nome && senha === usuarioFix.senha) {
        res.json({
            success: true,
            message: "Login bem-sucedido!",
            usuario: {
                nome: usuarioFix.nome
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Usuário ou senha inválidos!"
        });
    }
});



// Rota que recebe os dados do formulário
app.post("/cad", upload.single("foto"), async (req, res) => {
    try {
        const { nome, data, telefone, sala, periodo, text } = req.body;
        const genero = req.body.genero || "Não informado";
        const imagem = req.file ? `/uploads/${req.file.filename}` : null;

        const usados = new Set();

        function omix() {
            let numero;
            do {
                numero = Math.floor(100000 + Math.random() * 900000); // garante 6 dígitos
            } while (usados.has(numero));

            usados.add(numero);
            return numero;
        }

        const dadosRecebidos = {
            nome,
            data,
            genero,
            telefone,
            sala,
            periodo,
            text,
            imagem,
            omix: omix(),
            status: 'pendente'
        };


        console.log("📥 Dados recebidos:", dadosRecebidos);

        await users.create(dadosRecebidos)

        res.json({
            message: "Cadastro recebido com sucesso!",
            dados: dadosRecebidos,
        });
    } catch (err) {
        console.error("Erro ao processar cadastro:", err);
        res.status(500).json({ error: "Erro no servidor" });
    }
});



// //// ///// /////// rota de busca ....


// Rota para buscar usuário apenas pelo OMIX
app.get("/user/omix/:omix", async (req, res) => {
    try {
        const { omix } = req.params;

        if (!omix) {
            return res.status(400).json({ error: "⚠️ Informe o OMIX do usuário." });
        }

        const usuario = await users.findOne({ where: { omix } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        res.json(usuario);

    } catch (err) {
        console.error("Erro ao buscar usuário pelo OMIX:", err);
        res.status(500).json({ error: "Erro no servidor" });
    }
});



///////////////////// rota para aprovar e reprovar


// Aprovar usuário pelo OMIX
app.put("/user/aprovar/:omix", async (req, res) => {
    try {
        const { omix } = req.params;
        const usuario = await users.findOne({ where: { omix } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        await usuario.update({ status: "aprovado" });
        res.json({ message: `Usuário ${usuario.nome} aprovado com sucesso!`, usuario });

    } catch (err) {
        console.error("Erro ao aprovar usuário:", err);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// Reprovar usuário pelo OMIX
app.put("/user/reprovar/:omix", async (req, res) => {
    try {
        const { omix } = req.params;
        const usuario = await users.findOne({ where: { omix } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        await usuario.update({ status: "reprovado" });
        res.json({ message: `Usuário ${usuario.nome} reprovado com sucesso!`, usuario });

    } catch (err) {
        console.error("Erro ao reprovar usuário:", err);
        res.status(500).json({ error: "Erro no servidor" });
    }
});




//
// Iniciar servidor
const PORT = 8081;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
