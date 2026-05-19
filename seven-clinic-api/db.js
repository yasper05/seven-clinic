const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Cria e conecta ao arquivo de banco de dados SQLite na mesma pasta raiz do projeto de backend
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco SQLite:', err.message);
    } else {
        console.log('[SUCESSO] Conectado ao banco de dados SQLite.');
        inicializarBanco();
    }
});

// Função para criar as estruturas do banco de dados se não existirem
function inicializarBanco() {
    db.serialize(() => {

        // TABELA: usuarios (nossos Clientes)
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha_hash TEXT NOT NULL,
                telefone TEXT,
                foto_url TEXT
            )
        `);

        // TABELA: profissionais (Nossa equipe de atendimento)
        db.run(`
            CREATE TABLE IF NOT EXISTS profissionais (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha_hash TEXT NOT NULL,
                telefone TEXT,
                foto_url TEXT,
                role TEXT DEFAULT 'profissional' 
            )
        `);

        // TABELA: procedimentos
        db.run(`
            CREATE TABLE IF NOT EXISTS procedimentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_servico TEXT NOT NULL,
                descricao TEXT,
                duracao_minutos INTEGER NOT NULL,
                preco REAL
            )
        `);

        // TABELA: agendamentos (Simplificada para bater exatamente com o Frontend do TCC)
        db.run(`
            CREATE TABLE IF NOT EXISTS agendamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente TEXT NOT NULL,
                profissional TEXT NOT NULL,
                servico TEXT NOT NULL,
                data TEXT NOT NULL,
                horario TEXT NOT NULL,
                status TEXT DEFAULT 'pendente', -- 'pendente', 'concluido', 'cancelado'
                isBloqueio BOOLEAN DEFAULT 0
            )
        `);

        // TABELA: recuperacao_senha
        db.run(`
            CREATE TABLE IF NOT EXISTS recuperacao_senha (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                token TEXT NOT NULL,
                expiracao DATETIME NOT NULL
            )
        `);

        // TABELA: verificacao_email (cadastros pendentes de verificação)
        db.run(`
            CREATE TABLE IF NOT EXISTS verificacao_email (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                senha_hash TEXT NOT NULL,
                telefone TEXT,
                codigo TEXT NOT NULL,
                expiracao DATETIME NOT NULL
            )
        `);

        // TABELA: horarios_trabalho (Disponibilidade dos profissionais)
        db.run(`
            CREATE TABLE IF NOT EXISTS horarios_trabalho (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                profissional_id INTEGER NOT NULL,
                dia_semana INTEGER NOT NULL, -- 0=Domingo, 1=Segunda, etc.
                hora_inicio TEXT NOT NULL,
                hora_fim TEXT NOT NULL,
                FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
            )
        `);

        // TABELA: historico_atendimento (Prontuário/fichas de anamnese)
        db.run(`
            CREATE TABLE IF NOT EXISTS historico_atendimento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agendamento_id INTEGER,
                usuario_id INTEGER NOT NULL,
                profissional_id INTEGER NOT NULL,
                descricao TEXT NOT NULL,
                data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
            )
        `);

        // TABELA: avaliacoes (Feedback do cliente)
        db.run(`
            CREATE TABLE IF NOT EXISTS avaliacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agendamento_id INTEGER NOT NULL,
                usuario_id INTEGER NOT NULL,
                nota INTEGER CHECK(nota >= 1 AND nota <= 5),
                comentario TEXT,
                data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);

        // TABELA: logs_notificacoes (Registro de envio de WhatsApp/Email)
        db.run(`
            CREATE TABLE IF NOT EXISTS logs_notificacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                agendamento_id INTEGER,
                tipo_notificacao TEXT NOT NULL, -- 'whatsapp' ou 'email'
                mensagem TEXT,
                status TEXT NOT NULL, -- 'enviado', 'falha'
                data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id)
            )
        `);

        console.log('[SUCESSO] Tabelas criadas/verificadas com sucesso no banco de dados.');

        // Criação de dados padrões (Seeding) para facilitar testes iniciais
        popularBancoInicial();
    });
}

// Insere dados básicos caso as tabelas estejam vazias
function popularBancoInicial() {
    db.get("SELECT COUNT(*) as count FROM procedimentos", (err, row) => {
        if (!err && row.count === 0) {
            console.log("Inserindo procedimentos iniciais...");
            const stmt = db.prepare("INSERT INTO procedimentos (nome_servico, duracao_minutos, preco) VALUES (?, ?, ?)");
            stmt.run("Cílios Volume Brasileiro", 90, 150.0);
            stmt.run("Design de Sobrancelha", 30, 45.0);
            stmt.run("Limpeza de Pele", 60, 120.0);
            stmt.run("Unhas (Mão e Pé)", 90, 80.0);
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM profissionais", (err, row) => {
        if (!err && row.count === 0) {
            console.log("Inserindo profissional padrão na tabela de profissionais...");
            const hashSenha = bcrypt.hashSync('senha123', 10);
            db.run(`
                INSERT INTO profissionais (nome, email, senha_hash, telefone, role)
                VALUES ('Profissional Maria', 'maria@sevenclinic.com', '${hashSenha}', '(41) 99999-9999', 'profissional')
            `);
        }
    });
}

module.exports = db;
