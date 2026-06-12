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
                foto_url TEXT,
                taxa_pendente REAL DEFAULT 0
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

        // TABELA: agendamentos (Simplificada para TCC, adicionando cliente_id, isManutencao, valor e duracao)
        db.run(`
            CREATE TABLE IF NOT EXISTS agendamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente TEXT NOT NULL,
                cliente_id INTEGER,
                profissional TEXT NOT NULL,
                servico TEXT NOT NULL,
                data TEXT NOT NULL,
                horario TEXT NOT NULL,
                duracao INTEGER DEFAULT 30,
                status TEXT DEFAULT 'pendente', -- 'pendente', 'concluido', 'cancelado'
                isBloqueio BOOLEAN DEFAULT 0,
                isManutencao BOOLEAN DEFAULT 0,
                valor REAL,
                observacoes TEXT,
                nota_cliente INTEGER,
                nota_profissional INTEGER,
                cancelado_por TEXT,
                FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
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

        // Garante que novas colunas existam na tabela de agendamentos e usuarios (migração segura para bancos existentes)
        db.run("ALTER TABLE agendamentos ADD COLUMN cliente_id INTEGER", () => {});
        db.run("ALTER TABLE agendamentos ADD COLUMN isManutencao BOOLEAN DEFAULT 0", () => {});
        db.run("ALTER TABLE agendamentos ADD COLUMN valor REAL", () => {});
        db.run("ALTER TABLE agendamentos ADD COLUMN duracao INTEGER DEFAULT 30", () => {});
        db.run("ALTER TABLE agendamentos ADD COLUMN observacoes TEXT", () => {});
        db.run("ALTER TABLE agendamentos ADD COLUMN nota_cliente INTEGER", () => {});
        db.run("ALTER TABLE agendamentos ADD COLUMN nota_profissional INTEGER", () => {});
        db.run("ALTER TABLE agendamentos ADD COLUMN cancelado_por TEXT", () => {});
        db.run("ALTER TABLE usuarios ADD COLUMN taxa_pendente REAL DEFAULT 0", () => {});

        // Criação de dados padrões (Seeding) para facilitar testes iniciais
        popularBancoInicial();
    });
}

// Insere dados básicos caso as tabelas estejam vazias
function popularBancoInicial() {
    db.get("SELECT COUNT(*) as count FROM procedimentos WHERE nome_servico = 'Classico'", (err, row) => {
        if (!err && row.count === 0) {
            console.log("Reiniciando e inserindo grade fixa de procedimentos...");
            db.run("DELETE FROM procedimentos", () => {
                const stmt = db.prepare("INSERT INTO procedimentos (nome_servico, duracao_minutos, preco) VALUES (?, ?, ?)");
                
                // Laura Alencar (Cílios)
                stmt.run("Classico", 90, 220.0);
                stmt.run("Volume light", 90, 210.0);
                stmt.run("Soft light", 90, 175.0);
                stmt.run("wet", 90, 240.0);
                stmt.run("anime", 90, 250.0);
                stmt.run("soft fox", 90, 175.0);
                stmt.run("delineado", 90, 240.0);
                stmt.run("wispy", 90, 250.0);
                stmt.run("fox eyes", 90, 230.0);
                stmt.run("cat eyes", 90, 200.0);

                // Mayara Vespasiano (Sobrancelha / Lábios / Adicionais)
                stmt.run("Design personalizado", 30, 45.0);
                stmt.run("Design + coloração", 45, 79.0);
                stmt.run("Design + henna", 45, 69.0);
                stmt.run("Light brows", 60, 120.0);
                stmt.run("Brow lamination", 60, 195.0);
                stmt.run("Micropigmentação", 120, 690.0);
                stmt.run("Lip blush", 120, 230.0);
                stmt.run("Protocolo de hidratação", 45, 120.0);
                stmt.run("Microlabial", 120, 690.0);
                stmt.run("Buço", 15, 20.0);
                stmt.run("Epilação facial", 45, 70.0);

                // Ana Paula (Unhas)
                stmt.run("Alongamento em Molde F1 (Natural)", 120, 190.0);
                stmt.run("Alongamento em Molde F1 (Decorada)", 120, 220.0);
                stmt.run("Alongamento em Soft Gel (Natural)", 90, 130.0);
                stmt.run("Alongamento em Soft Gel (Decorada)", 90, 160.0);
                stmt.run("Banho de gel em molde F1 (Natural)", 90, 90.0);
                stmt.run("Banho de gel em molde F1 (Decorada)", 90, 120.0);
                stmt.run("Blindagem estrutural (Natural)", 60, 90.0);
                stmt.run("Blindagem estrutural (Decorada)", 60, 110.0);
                stmt.run("Banho de gel fiber (Natural)", 90, 150.0);
                stmt.run("Banho de gel fiber (Decorada)", 90, 180.0);
                stmt.run("Manutenção em Molde F1 (Natural)", 90, 120.0);
                stmt.run("Manutenção em Molde F1 (Decorada)", 90, 150.0);
                stmt.run("Manutenção em Soft Gel (Natural)", 90, 100.0);
                stmt.run("Manutenção em Soft Gel (Decorada)", 90, 130.0);
                stmt.run("Manutenção Blindagem fiber (Natural)", 90, 100.0);
                stmt.run("Manutenção Blindagem fiber (Decorada)", 90, 130.0);
                stmt.run("Esmaltação em gel (blindagem) *inclui cuticulagem russa* (Esmaltada)", 60, 80.0);
                stmt.run("Esmaltação em gel (blindagem) *inclui cuticulagem russa* (Decorada)", 60, 100.0);
                stmt.run("Reconstrução e alinhamento de unhas quebrada", 30, 20.0);
                stmt.run("Remoção de alongamento", 45, 70.0);
                stmt.run("Reposição unha quebrada", 20, 10.0);
                stmt.run("Remoção de esmaltação", 30, 40.0);
                stmt.run("Remoção de blindagem", 45, 60.0);
                stmt.run("Pedicure *inclui cuticulagem russa* (Esmaltada)", 60, 80.0);
                stmt.run("Pedicure *inclui cuticulagem russa* (Decorada)", 60, 100.0);
                stmt.run("Adicional pedraria", 15, 10.0);
                stmt.run("Cuticulagem com tesoura", 30, 20.0);
                
                stmt.finalize();
            });
        }
    });

    db.get("SELECT COUNT(*) as count FROM profissionais WHERE email IN ('laura@sevenclinic.com', 'mayara@sevenclinic.com', 'ana@sevenclinic.com')", (err, row) => {
        if (!err && row.count < 3) {
            console.log("Reiniciando e inserindo profissionais fixos...");
            db.run("DELETE FROM profissionais", () => {
                const hashSenha = bcrypt.hashSync('senha123', 10);
                const stmt = db.prepare(`
                    INSERT INTO profissionais (nome, email, senha_hash, telefone, role)
                    VALUES (?, ?, ?, ?, 'profissional')
                `);
                stmt.run('Laura Alencar', 'laura@sevenclinic.com', hashSenha, '(41) 99999-1111');
                stmt.run('Mayara Vespasiano', 'mayara@sevenclinic.com', hashSenha, '(41) 99999-2222');
                stmt.run('Ana Paula', 'ana@sevenclinic.com', hashSenha, '(41) 99999-3333');
                stmt.finalize();
            });
        }
    });
}

module.exports = db;
