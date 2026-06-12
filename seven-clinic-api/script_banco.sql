-- TABELA: usuarios (Clientes)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    telefone TEXT,
    foto_url TEXT
);

-- TABELA: profissionais (Equipe de atendimento)
CREATE TABLE IF NOT EXISTS profissionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    telefone TEXT,
    foto_url TEXT,
    role TEXT DEFAULT 'profissional' 
);

-- TABELA: procedimentos (Catálogo de serviços)
CREATE TABLE IF NOT EXISTS procedimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_servico TEXT NOT NULL,
    descricao TEXT,
    duracao_minutos INTEGER NOT NULL,
    preco REAL
);

-- TABELA: agendamentos (Fluxo principal de atendimento)
CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT NOT NULL,
    profissional TEXT NOT NULL,
    servico TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    status TEXT DEFAULT 'pendente', -- 'pendente', 'concluido', 'cancelado'
    isBloqueio BOOLEAN DEFAULT 0,
    observacoes TEXT,
    nota_cliente INTEGER,
    nota_profissional INTEGER
);

-- TABELA: recuperacao_senha (Controle de tokens)
CREATE TABLE IF NOT EXISTS recuperacao_senha (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expiracao DATETIME NOT NULL
);

-- TABELA: verificacao_email (Cadastros pendentes)
CREATE TABLE IF NOT EXISTS verificacao_email (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    telefone TEXT,
    codigo TEXT NOT NULL,
    expiracao DATETIME NOT NULL
);

-- TABELA: horarios_trabalho (Disponibilidade)
CREATE TABLE IF NOT EXISTS horarios_trabalho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profissional_id INTEGER NOT NULL,
    dia_semana INTEGER NOT NULL, -- 0=Domingo, 1=Segunda, etc.
    hora_inicio TEXT NOT NULL,
    hora_fim TEXT NOT NULL,
    FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
);

-- TABELA: historico_atendimento (Fichas de anamnese)
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
);

-- TABELA: avaliacoes (Feedback do cliente)
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agendamento_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    nota INTEGER CHECK(nota >= 1 AND nota <= 5),
    comentario TEXT,
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- TABELA: logs_notificacoes (Registro de envio via WhatsApp/Email)
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
);
