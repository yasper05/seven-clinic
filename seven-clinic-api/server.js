require('dotenv').config(); // Carrega variáveis do .env
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');
require('./whatsapp');
const { enviarMensagemWhatsApp } = require('./whatsapp');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors({
    origin: '*', // Em produção, trocar pelo domínio real
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => { res.setHeader('ngrok-skip-browser-warning', 'true'); next(); });

// ============================================
// CONFIGURAÇÃO DO NODEMAILER (via .env)
// ============================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((err) => {
    if (err) {
        console.error('[ERRO] Falha ao conectar ao Gmail:', err.message);
    } else {
        console.log('[SUCESSO] Gmail configurado e pronto para enviar e-mails.');
    }
});

// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO JWT
// ============================================
const autenticar = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, usuario) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
        }
        req.usuario = usuario; // { id, email, tipo_usuario }
        next();
    });
};

// ============================================
// ROTAS PÚBLICAS
// ============================================

// Rota de Teste
app.get('/api/status', (req, res) => {
    res.json({ message: 'Servidor Seven Clinic rodando perfeitamente!', status: 'OK' });
});

// 0. CADASTRO — Passo 1: Enviar código de verificação
app.post('/api/usuarios', async (req, res) => {
    const { nome, email, senha, telefone } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, existente) => {
            if (err) return res.status(500).json({ error: 'Erro de validação.' });
            if (existente) return res.status(400).json({ error: 'Este e-mail já está em uso.' });

            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            const expiracao = new Date(Date.now() + 15 * 60 * 1000);

            db.run(
                `INSERT INTO verificacao_email (nome, email, senha_hash, telefone, codigo, expiracao)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON CONFLICT(email) DO UPDATE SET
                     nome=excluded.nome, senha_hash=excluded.senha_hash,
                     telefone=excluded.telefone, codigo=excluded.codigo, expiracao=excluded.expiracao`,
                [nome, email, hashedPassword, telefone, codigo, expiracao.toISOString()],
                function(dbErr) {
                    if (dbErr) return res.status(500).json({ error: 'Erro ao criar verificação.' });

                    const mailOptions = {
                        from: `"Seven Clinic" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: 'Código de Verificação — Seven Clinic',
                        html: `
                            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                                <h2 style="color:#1a1a1a">Bem-vinda à Seven Clinic! 💆‍♀️</h2>
                                <p>Olá <strong>${nome.split(' ')[0]}</strong>, use o código abaixo para confirmar seu e-mail:</p>
                                <div style="font-size:2.5rem;font-weight:bold;letter-spacing:12px;text-align:center;padding:20px;background:#f4f4f4;border-radius:8px;margin:20px 0">
                                    ${codigo}
                                </div>
                                <p style="color:#888;font-size:0.85rem">Este código expira em <strong>15 minutos</strong>. Se não foi você, ignore este e-mail.</p>
                            </div>
                        `
                    };

                    transporter.sendMail(mailOptions, (mailErr) => {
                        if (mailErr) {
                            console.error('[EMAIL] Erro ao enviar código:', mailErr.message);
                            return res.status(500).json({ error: 'Erro ao enviar e-mail de verificação.' });
                        }
                        console.log(`[EMAIL] Código de verificação enviado para ${email}`);
                        res.status(200).json({ message: 'Código enviado para o seu e-mail. Verifique sua caixa de entrada.' });
                    });
                }
            );
        });
    } catch(err) {
        res.status(500).json({ error: 'Erro ao processar cadastro.' });
    }
});

// 0b. CADASTRO — Passo 2: Confirmar código e criar conta
app.post('/api/verificar-email', (req, res) => {
    const { email, codigo } = req.body;

    db.get('SELECT * FROM verificacao_email WHERE email = ?', [email], (err, pendente) => {
        if (err) return res.status(500).json({ error: 'Erro ao verificar.' });
        if (!pendente) return res.status(400).json({ error: 'Nenhum cadastro pendente para este e-mail.' });

        if (new Date() > new Date(pendente.expiracao)) {
            db.run('DELETE FROM verificacao_email WHERE email = ?', [email]);
            return res.status(400).json({ error: 'O código expirou. Tente se cadastrar novamente.' });
        }

        if (pendente.codigo !== codigo.trim()) {
            return res.status(400).json({ error: 'Código incorreto. Verifique e tente novamente.' });
        }

        db.run(
            'INSERT INTO usuarios (nome, email, senha_hash, telefone) VALUES (?, ?, ?, ?)',
            [pendente.nome, pendente.email, pendente.senha_hash, pendente.telefone],
            function(insertErr) {
                if (insertErr) return res.status(500).json({ error: 'Erro ao criar conta.' });
                db.run('DELETE FROM verificacao_email WHERE email = ?', [email]);
                console.log(`[CADASTRO] Conta criada com sucesso para ${email}`);
                res.status(201).json({ message: 'Conta criada com sucesso!' });
            }
        );
    });
});

// 1. LOGIN — Retorna JWT
app.post('/api/login', (req, res) => {
    const { email, senha, isProfissional } = req.body;

    const tabela = isProfissional ? 'profissionais' : 'usuarios';
    const sql = `SELECT * FROM ${tabela} WHERE email = ?`;

    db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

        const validPassword = await bcrypt.compare(senha, user.senha_hash);
        if (validPassword || senha === user.senha_hash) {
            const { senha_hash, ...userData } = user;

            if (isProfissional) {
                userData.tipo_usuario = 'profissional';
            } else {
                userData.tipo_usuario = 'cliente';
            }

            // Gera o JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, tipo_usuario: userData.tipo_usuario },
                JWT_SECRET,
                { expiresIn: '12h' }
            );

            res.json({ message: 'Login realizado com sucesso', user: userData, token });
        } else {
            res.status(401).json({ error: 'Senha incorreta' });
        }
    });
});

// 5. RECUPERAÇÃO DE SENHA — Pública
app.post('/api/recuperar-senha', (req, res) => {
    const { email } = req.body;

    // Detecta automaticamente se está vindo do ngrok ou do localhost
    const origin = req.headers['origin'] || req.headers['referer'] || FRONTEND_URL;
    const frontendUrl = origin.replace(/\/$/, '').split('/').slice(0, 3).join('/');

    db.get(
        'SELECT id, nome, "cliente" as tipo FROM usuarios WHERE email = ? UNION SELECT id, nome, "profissional" as tipo FROM profissionais WHERE email = ?',
        [email, email],
        (err, user) => {
            if (err) return res.status(500).json({ error: 'Erro no servidor' });
            if (!user) {
                return res.json({ message: 'Se o e-mail estiver cadastrado, um link será enviado.' });
            }

            const token = crypto.randomBytes(32).toString('hex');
            const expiracao = new Date(Date.now() + 3600000).toISOString();

            db.run('INSERT INTO recuperacao_senha (email, token, expiracao) VALUES (?, ?, ?)', [email, token, expiracao], function(err) {
                if (err) return res.status(500).json({ error: 'Erro ao gerar token de recuperação' });

                const resetLink = `${frontendUrl}/redefinir-senha?token=${token}`;
                console.log(`[RECUPERAR SENHA] Link gerado para ${email}: ${resetLink}`);

                const mailOptions = {
                    from: `"Seven Clinic Suporte" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Recuperação de Senha - Seven Clinic',
                    html: `<p>Olá ${user.nome},</p>
                           <p>Você solicitou a recuperação de senha. Clique no link abaixo para criar uma nova senha:</p>
                           <p><a href="${resetLink}">Redefinir minha senha</a></p>
                           <p>Este link expira em <strong>1 hora</strong>. Se você não solicitou isso, ignore este e-mail.</p>`
                };

                transporter.sendMail(mailOptions, (error) => {
                    if (error) {
                        console.log('Erro ao enviar email:', error);
                        return res.status(500).json({ error: 'Erro ao enviar o e-mail.' });
                    }
                    res.json({ message: 'Se o e-mail estiver cadastrado, um link será enviado.' });
                });
            });
        }
    );
});

// 6. REDEFINIÇÃO DE SENHA — Pública (via token de e-mail)
app.post('/api/redefinir-senha', async (req, res) => {
    const { token, novaSenha } = req.body;

    const validarSenhaForteServer = (senha) => {
        if (senha.length < 10) return "A senha deve ter pelo menos 10 caracteres.";
        if (!/[A-Z]/.test(senha)) return "A senha deve conter pelo menos uma letra maiúscula.";
        if (!/[a-z]/.test(senha)) return "A senha deve conter pelo menos uma letra minúscula.";
        if (!/[0-9]/.test(senha)) return "A senha deve conter pelo menos um número.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return "A senha deve conter pelo menos um caractere especial.";
        return null;
    };

    const erroSenha = validarSenhaForteServer(novaSenha);
    if (erroSenha) return res.status(400).json({ error: erroSenha });

    db.get('SELECT * FROM recuperacao_senha WHERE token = ? AND expiracao > ?', [token, new Date().toISOString()], async (err, record) => {
        if (err) return res.status(500).json({ error: 'Erro de validação de token' });
        if (!record) return res.status(400).json({ error: 'Token inválido ou expirado.' });

        const email = record.email;

        db.get(
            'SELECT id, nome, "cliente" as tipo FROM usuarios WHERE email = ? UNION SELECT id, nome, "profissional" as tipo FROM profissionais WHERE email = ?',
            [email, email],
            async (err, user) => {
                if (err || !user) return res.status(500).json({ error: 'Usuário não encontrado' });

                const primeiroNome = user.nome.split(' ')[0].toLowerCase();
                if (primeiroNome.length > 2 && novaSenha.toLowerCase().includes(primeiroNome)) {
                    return res.status(400).json({ error: 'A senha não pode conter o seu nome.' });
                }

                const hashedPassword = await bcrypt.hash(novaSenha, 10);
                const tabela = user.tipo === 'profissional' ? 'profissionais' : 'usuarios';

                db.run(`UPDATE ${tabela} SET senha_hash = ? WHERE email = ?`, [hashedPassword, email], function(updateErr) {
                    if (updateErr) return res.status(500).json({ error: 'Erro ao atualizar a senha' });
                    db.run('DELETE FROM recuperacao_senha WHERE token = ?', [token]);
                    res.json({ message: 'Senha redefinida com sucesso!' });
                });
            }
        );
    });
});

// ============================================
// ROTAS PROTEGIDAS (requerem JWT)
// ============================================

// 2. PROCEDIMENTOS
app.get('/api/procedimentos', (req, res) => {
    db.all('SELECT * FROM procedimentos', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. CLIENTES — Protegido
app.get('/api/clientes', autenticar, (req, res) => {
    db.all('SELECT id, nome, email, telefone, foto_url FROM usuarios', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3.B. PROFISSIONAIS
app.get('/api/profissionais', autenticar, (req, res) => {
    db.all('SELECT id, nome, email, telefone, foto_url FROM profissionais', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. AGENDAMENTOS — Protegido
app.get('/api/agendamentos', autenticar, (req, res) => {
    db.all('SELECT * FROM agendamentos', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatados = rows.map(r => ({ 
            ...r, 
            isBloqueio: r.isBloqueio === 1,
            isManutencao: r.isManutencao === 1,
            duracao: r.duracao || 30
        }));
        res.json(formatados);
    });
});

// Buscar agendamentos de uma profissional em uma data específica (para verificação de slots no frontend)
app.get('/api/agendamentos/disponibilidade', autenticar, (req, res) => {
    const { profissional, data } = req.query;
    if (!profissional || !data) {
        return res.status(400).json({ error: 'Parâmetros profissional e data são obrigatórios.' });
    }
    db.all(
        `SELECT horario, duracao FROM agendamentos WHERE profissional = ? AND data = ? AND status != 'cancelado'`,
        [profissional, data],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(r => ({ horario: r.horario, duracao: r.duracao || 30 })));
        }
    );
});

// Criar agendamento — Protegido
app.post('/api/agendamentos', autenticar, (req, res) => {
    const { cliente, profissional, servico, data, horario, isBloqueio, isManutencao, valor, duracao } = req.body;
    const cliente_id = req.usuario.id;
    const tipo_usuario = req.usuario.tipo_usuario;
    const duracaoMinutos = duracao || 30;

    // Helper: converte "HH:MM" para minutos totais desde meia-noite
    const toMinutes = (hhmm) => {
        const [h, m] = hhmm.split(':').map(Number);
        return h * 60 + m;
    };

    // Helper to get client's real name
    const obterNomeCliente = new Promise((resolve) => {
        if (tipo_usuario === 'cliente') {
            db.get('SELECT nome FROM usuarios WHERE id = ?', [cliente_id], (err, row) => {
                resolve(row ? row.nome : cliente);
            });
        } else {
            resolve(cliente);
        }
    });

    obterNomeCliente.then((nomeRealCliente) => {
        // Validação de sobreposição de intervalos de tempo (substitui checagem simples de horário)
        const checkSql = `SELECT horario, duracao FROM agendamentos 
                          WHERE profissional = ? AND data = ? AND status != 'cancelado'`;

        db.all(checkSql, [profissional, data], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Erro na validação de horário.' });

            const startNew = toMinutes(horario);
            const endNew = startNew + duracaoMinutos;

            // Verifica se há sobreposição com qualquer agendamento existente
            const sobreposicao = rows.find(r => {
                const startExist = toMinutes(r.horario);
                const endExist = startExist + (r.duracao || 30);
                return startNew < endExist && endNew > startExist;
            });

            if (sobreposicao) {
                return res.status(400).json({ 
                    error: `Este horário conflita com um agendamento existente com ${profissional}. Por favor, escolha outro horário.` 
                });
            }

            let finalValor = valor || 0.0;
            let finalIsManutencao = isManutencao ? 1 : 0;

            // REGRAS DE NEGÓCIO: Cílios (Laura Alencar)
            if (profissional === 'Laura Alencar' && !isBloqueio) {
                const historySql = `
                    SELECT * FROM agendamentos 
                    WHERE cliente_id = ? 
                      AND profissional = 'Laura Alencar' 
                      AND status != 'cancelado' 
                      AND isBloqueio = 0
                    ORDER BY data DESC, horario DESC
                `;

                db.all(historySql, [cliente_id], (err, historyRows) => {
                    if (err) return res.status(500).json({ error: 'Erro ao buscar histórico de agendamentos.' });

                    if (finalIsManutencao === 1) {
                        if (servico.toLowerCase().includes('anime')) {
                            return res.status(400).json({ error: 'Não é permitida manutenção para cílios do tipo Anime.' });
                        }
                        if (!historyRows || historyRows.length === 0) {
                            return res.status(400).json({ error: 'Você precisa ter feito uma aplicação completa antes de agendar uma manutenção.' });
                        }
                        if (historyRows.length >= 2) {
                            const ult1 = historyRows[0];
                            const ult2 = historyRows[1];
                            if (ult1.isManutencao === 1 && ult2.isManutencao === 1) {
                                return res.status(400).json({ error: 'Não é permitido realizar mais de 2 manutenções seguidas. Por favor, agende uma nova aplicação completa.' });
                            }
                        }
                        const ultimoAtendimento = historyRows[0];
                        const dataNovo = new Date(data);
                        const dataUltimo = new Date(ultimoAtendimento.data);
                        const diffDays = Math.ceil(Math.abs(dataNovo - dataUltimo) / (1000 * 60 * 60 * 24));
                        if (diffDays <= 15) {
                            finalValor = finalValor * 0.70;
                        }
                    }
                    
                    executarInsercao(nomeRealCliente, finalValor, finalIsManutencao);
                });
            } else {
                executarInsercao(nomeRealCliente, finalValor, finalIsManutencao);
            }

            function executarInsercao(nomeClienteReal, finalVal, finalManut) {
                if (tipo_usuario === 'cliente') {
                    db.get('SELECT taxa_pendente FROM usuarios WHERE id = ?', [cliente_id], (err, row) => {
                        let taxa = 0;
                        if (row && row.taxa_pendente > 0) {
                            taxa = row.taxa_pendente;
                            finalVal += taxa;
                            // Zera a taxa do usuario
                            db.run('UPDATE usuarios SET taxa_pendente = 0 WHERE id = ?', [cliente_id]);
                        }
                        inserirAgendamento(nomeClienteReal, finalVal, finalManut);
                    });
                } else {
                    inserirAgendamento(nomeClienteReal, finalVal, finalManut);
                }

                function inserirAgendamento(nomeCR, fVal, fManut) {
                    const insertSql = `
                        INSERT INTO agendamentos (cliente, cliente_id, profissional, servico, data, horario, duracao, isBloqueio, isManutencao, valor) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.run(
                        insertSql, 
                        [nomeCR, cliente_id, profissional, servico, data, horario, duracaoMinutos, isBloqueio ? 1 : 0, fManut, fVal], 
                        function(err) {
                            if (err) return res.status(500).json({ error: 'Erro ao criar agendamento no banco de dados.' });
                            res.status(201).json({ message: 'Agendamento criado com sucesso!', id: this.lastID });
                        }
                    );
                }
            }
        });
    });
});

// Atualizar status do agendamento — Protegido
app.put('/api/agendamentos/:id/status', autenticar, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const usuarioLogado = req.usuario; // id, tipo_usuario

    db.get('SELECT * FROM agendamentos WHERE id = ?', [id], (err, agendamento) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar agendamento' });
        if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });

        // Se for cancelamento ou não compareceu
        if (status === 'cancelado' || status === 'nao_compareceu') {
            const dataHoraAgendamento = new Date(`${agendamento.data}T${agendamento.horario}:00`);
            const agora = new Date();
            const horasDiferenca = (dataHoraAgendamento - agora) / (1000 * 60 * 60);

            // Log de WhatsApp fake
            let msgZap = '';

            if (usuarioLogado.tipo_usuario === 'cliente') {
                msgZap = `[WhatsApp] Para a profissional ${agendamento.profissional}:\nA cliente ${agendamento.cliente} CANCELOU o agendamento de ${agendamento.servico} (Dia ${agendamento.data} às ${agendamento.horario}).`;

                // Fetch professional phone to send WhatsApp
                db.get('SELECT telefone FROM profissionais WHERE nome = ?', [agendamento.profissional], (err, prof) => {
                    if (prof && prof.telefone) {
                        enviarMensagemWhatsApp(prof.telefone, msgZap);
                    }
                });

                // Regra das 72h ou cancelar após a hora
                if (horasDiferenca < 72 || status === 'nao_compareceu') {
                    if (agendamento.cliente_id) {
                        db.run('UPDATE usuarios SET taxa_pendente = taxa_pendente + 50 WHERE id = ?', [agendamento.cliente_id]);
                        console.log(`[TAXA] Aplicada taxa de R$ 50 para o cliente ID ${agendamento.cliente_id} (Cancelamento < 72h).`);
                    }
                }
            } else if (usuarioLogado.tipo_usuario === 'profissional') {
                msgZap = `[WhatsApp] Para a cliente ${agendamento.cliente}:\nOlá! A sua profissional ${agendamento.profissional} precisou CANCELAR o seu agendamento de ${agendamento.servico} (Dia ${agendamento.data} às ${agendamento.horario}). Por favor, entre em contato para reagendar.`;
                
                // Fetch client phone to send WhatsApp
                db.get('SELECT telefone FROM usuarios WHERE id = ?', [agendamento.cliente_id], (err, user) => {
                    if (user && user.telefone) {
                        enviarMensagemWhatsApp(user.telefone, msgZap);
                    }
                });

                // Se o profissional marca o cliente como não compareceu, aplica a taxa
                if (status === 'nao_compareceu' && agendamento.cliente_id) {
                    db.run('UPDATE usuarios SET taxa_pendente = taxa_pendente + 50 WHERE id = ?', [agendamento.cliente_id]);
                    console.log(`[TAXA] Aplicada taxa de R$ 50 para o cliente ID ${agendamento.cliente_id} ('Não compareceu').`);
                }
            }

            if (msgZap) {
                console.log("\n==========================================");
                console.log("             MENSAGEM WHATSAPP            ");
                console.log("==========================================");
                console.log(msgZap);
                console.log("==========================================\n");

                db.run(`INSERT INTO logs_notificacoes (usuario_id, agendamento_id, tipo_notificacao, mensagem, status) VALUES (?, ?, ?, ?, ?)`,
                    [agendamento.cliente_id, agendamento.id, 'whatsapp', msgZap, 'enviado']
                );
            }
        }

        db.run('UPDATE agendamentos SET status = ? WHERE id = ?', [status, id], function(err) {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar status' });
            res.json({ message: 'Status atualizado com sucesso' });
        });
    });
});

// Obter taxa_pendente do cliente
app.get('/api/usuarios/:id/taxa', autenticar, (req, res) => {
    const { id } = req.params;
    if (parseInt(id) !== req.usuario.id) return res.status(403).json({ error: 'Proibido' });
    db.get('SELECT taxa_pendente FROM usuarios WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ taxa_pendente: row ? row.taxa_pendente : 0 });
    });
});

// 7. ATUALIZAÇÃO DE PERFIL — Protegido
app.put('/api/usuarios/:id', autenticar, async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, senha, foto_url } = req.body;

    if (parseInt(id) !== req.usuario.id) {
        return res.status(403).json({ error: 'Você não tem permissão para alterar este perfil.' });
    }

    const tabela = req.usuario.tipo_usuario === 'profissional' ? 'profissionais' : 'usuarios';

    try {
        if (senha && senha.trim() !== '') {
            const hash = await bcrypt.hash(senha, 10);
            db.run(`UPDATE ${tabela} SET nome=?, email=?, telefone=?, foto_url=?, senha_hash=? WHERE id=?`, 
                [nome, email, telefone, foto_url, hash, id], function(err) {
                if (err) return res.status(500).json({ error: 'Erro ao atualizar perfil com nova senha.' });
                res.json({ message: 'Perfil atualizado com sucesso.' });
            });
        } else {
            db.run(`UPDATE ${tabela} SET nome=?, email=?, telefone=?, foto_url=? WHERE id=?`, 
                [nome, email, telefone, foto_url, id], function(err) {
                if (err) return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
                res.json({ message: 'Perfil atualizado com sucesso.' });
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// 8. EXCLUSÃO DE CONTA (Direito ao Esquecimento - LGPD Art. 18) — Protegido
app.delete('/api/usuarios/:id', autenticar, (req, res) => {
    const { id } = req.params;

    // Garante que o usuário só pode deletar a própria conta
    if (parseInt(id) !== req.usuario.id) {
        return res.status(403).json({ error: 'Você não tem permissão para excluir esta conta.' });
    }

    const tabela = req.usuario.tipo_usuario === 'profissional' ? 'profissionais' : 'usuarios';

    db.run(`DELETE FROM ${tabela} WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao excluir a conta.' });
        if (this.changes === 0) return res.status(404).json({ error: 'Conta não encontrada.' });

        console.log(`[LGPD] Conta ID ${id} excluída conforme solicitação (Direito ao Esquecimento).`);
        res.json({ message: 'Sua conta foi excluída com sucesso. Todos os seus dados foram removidos.' });
    });
});

// ============================================
// SERVIR O BUILD DO REACT
// ============================================
const buildPath = path.join(__dirname, '..', 'seven-clinic', 'dist');
app.use(express.static(buildPath));
app.get('/*path', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`[SUCESSO] Backend rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT}/api/status para testar`);
});
