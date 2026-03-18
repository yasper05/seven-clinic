const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db'); // Importa a conexão com o banco SQLite
require('./whatsapp');     // Inicia WhatsApp e lembretes automáticos

const app = express();
const PORT = process.env.PORT || 3001; // Rodará na porta 3001 para não conflitar com o React web no 5173

// Middlewares
app.use(cors()); // Permite que o frontend React faça requisições
app.use(express.json()); // Permite ler JSON no corpo das requisições
// Aceita header do ngrok para evitar tela de aviso
app.use((req, res, next) => { res.setHeader('ngrok-skip-browser-warning', 'true'); next(); });

// Rota de Teste
app.get('/api/status', (req, res) => {
    res.json({ message: 'Servidor Seven Clinic rodando perfeitamente!', status: 'OK' });
});

// === ROTAS DA API ===

// 0. CADASTRO DE USUÁRIOS — Passo 1: Enviar código de verificação
app.post('/api/usuarios', async (req, res) => {
    const { nome, email, senha, telefone } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Verifica se email já existe em usuários ou está em verificação pendente
        db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, existente) => {
            if (err) return res.status(500).json({ error: 'Erro de validação.' });
            if (existente) return res.status(400).json({ error: 'Este e-mail já está em uso.' });

            // Gera código de 6 dígitos
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            const expiracao = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

            // Salva ou atualiza o cadastro pendente
            db.run(
                `INSERT INTO verificacao_email (nome, email, senha_hash, telefone, codigo, expiracao)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON CONFLICT(email) DO UPDATE SET
                     nome=excluded.nome, senha_hash=excluded.senha_hash,
                     telefone=excluded.telefone, codigo=excluded.codigo, expiracao=excluded.expiracao`,
                [nome, email, hashedPassword, telefone, codigo, expiracao.toISOString()],
                function(dbErr) {
                    if (dbErr) return res.status(500).json({ error: 'Erro ao criar verificação.' });

                    // Envia o e-mail com o código
                    const mailOptions = {
                        from: '"Seven Clinic" <sevenclinic.suporte@gmail.com>',
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

        // Verifica expiração
        if (new Date() > new Date(pendente.expiracao)) {
            db.run('DELETE FROM verificacao_email WHERE email = ?', [email]);
            return res.status(400).json({ error: 'O código expirou. Tente se cadastrar novamente.' });
        }

        // Verifica o código
        if (pendente.codigo !== codigo.trim()) {
            return res.status(400).json({ error: 'Código incorreto. Verifique e tente novamente.' });
        }

        // Cria a conta definitiva
        db.run(
            'INSERT INTO usuarios (nome, email, senha_hash, telefone) VALUES (?, ?, ?, ?)',
            [pendente.nome, pendente.email, pendente.senha_hash, pendente.telefone],
            function(insertErr) {
                if (insertErr) return res.status(500).json({ error: 'Erro ao criar conta.' });

                // Remove o registro pendente
                db.run('DELETE FROM verificacao_email WHERE email = ?', [email]);
                console.log(`[CADASTRO] Conta criada com sucesso para ${email}`);
                res.status(201).json({ message: 'Conta criada com sucesso!' });
            }
        );
    });
});



// 1. LOGIN (Autenticação)
app.post('/api/login', (req, res) => {
    const { email, senha, isProfissional } = req.body;
    
    // Define a tabela baseada no tipo de login solicitado pelo app React
    const tabela = isProfissional ? 'profissionais' : 'usuarios';
    const sql = `SELECT * FROM ${tabela} WHERE email = ?`;
    
    db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        
        // Verificação segura do Hash da Senha (com fallback para senhas antigas em texto plano)
        const validPassword = await bcrypt.compare(senha, user.senha_hash);
        if (validPassword || senha === user.senha_hash) {
            const { senha_hash, ...userData } = user;
            
            // Injeta o tipo de usuário no retorno
            if (isProfissional) {
                 userData.tipo_usuario = 'profissional';
            } else {
                 userData.tipo_usuario = 'cliente';
            }
            
            res.json({ message: 'Login realizado com sucesso', user: userData });
        } else {
            res.status(401).json({ error: 'Senha incorreta' });
        }
    });
});

// 2. PROCEDIMENTOS
app.get('/api/procedimentos', (req, res) => {
    db.all('SELECT * FROM procedimentos', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. CLIENTES
app.get('/api/clientes', (req, res) => {
    db.all('SELECT id, nome, email, telefone, foto_url FROM usuarios WHERE tipo_usuario = "cliente"', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3.B. PROFISSIONAIS (Para popular selects da agenda)
app.get('/api/profissionais', (req, res) => {
    db.all('SELECT id, nome, email, telefone, foto_url FROM profissionais', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. AGENDAMENTOS
// Listar todos os agendamentos (pode ser filtrado por data ou profissional no front)
app.get('/api/agendamentos', (req, res) => {
    db.all('SELECT * FROM agendamentos', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Formatamos o boolean isBloqueio para o JavaScript
        const formatados = rows.map(r => ({
            ...r,
            isBloqueio: r.isBloqueio === 1
        }));
        res.json(formatados);
    });
});

// Criar novo agendamento
app.post('/api/agendamentos', (req, res) => {
    const { cliente, profissional, servico, data, horario, isBloqueio } = req.body;
    
    // Verificar se o horário já está ocupado por este profissional
    const checkSql = 'SELECT * FROM agendamentos WHERE profissional = ? AND data = ? AND horario = ? AND status != "cancelado"';
    
    db.get(checkSql, [profissional, data, horario], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro na validação de horário' });
        
        if (row) {
            return res.status(400).json({ error: 'Este horário já está reservado.' });
        }
        
        // Se estiver livre, insere o agendamento
        const insertSql = `
            INSERT INTO agendamentos (cliente, profissional, servico, data, horario, isBloqueio)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(insertSql, [cliente, profissional, servico, data, horario, isBloqueio ? 1 : 0], function(err) {
            if (err) return res.status(500).json({ error: 'Erro ao criar agendamento' });
            res.status(201).json({ message: 'Agendamento criado com sucesso', id: this.lastID });
        });
    });
});

const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuração do Nodemailer com Gmail real
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sevenclinic.suporte@gmail.com',
        pass: 'lvfqlexy pbum domb'.replace(/ /g, '')
    }
});

transporter.verify((err) => {
    if (err) {
        console.error('[ERRO] Falha ao conectar ao Gmail:', err.message);
    } else {
        console.log('[SUCESSO] Gmail configurado e pronto para enviar e-mails.');
    }
});

// Cancelar/Concluir agendamento (Atualizar status)
app.put('/api/agendamentos/:id/status', (req, res) => {
    const { status } = req.body; // 'pendente', 'concluido', 'cancelado'
    const { id } = req.params;
    
    db.run('UPDATE agendamentos SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar status' });
        res.json({ message: 'Status atualizado com sucesso' });
    });
});

// 5. RECUPERAÇÃO DE SENHA (Solicitar)
app.post('/api/recuperar-senha', (req, res) => {
    const { email } = req.body;

    // Verifica se o email existe (procurando em usuários e profissionais)
    db.get('SELECT id, nome, "cliente" as tipo FROM usuarios WHERE email = ? UNION SELECT id, nome, "profissional" as tipo FROM profissionais WHERE email = ?', [email, email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        if (!user) {
            // Retorna sucesso para evitar vazamento de dados de quais e-mails estão cadastrados
            return res.json({ message: 'Se o e-mail estiver cadastrado, um link será enviado.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiracao = new Date(Date.now() + 3600000).toISOString(); // 1 hora de validade

        db.run('INSERT INTO recuperacao_senha (email, token, expiracao) VALUES (?, ?, ?)', [email, token, expiracao], function(err) {
            if (err) return res.status(500).json({ error: 'Erro ao gerar token de recuperação' });

            const FRONTEND_URL = 'https://colligative-dedicatorily-concepcion.ngrok-free.dev';
            const resetLink = `${FRONTEND_URL}/redefinir-senha?token=${token}`;
            
            const mailOptions = {
                from: '"Seven Clinic Suporte" <sevenclinic.suporte@gmail.com>',
                to: email,
                subject: 'Recuperação de Senha - Seven Clinic',
                html: `<p>Olá ${user.nome},</p>
                       <p>Você solicitou a recuperação de senha. Clique no link abaixo para criar uma nova senha:</p>
                       <p><a href="${resetLink}">Redefinir minha senha</a></p>
                       <p>Se você não solicitou isso, ignore este e-mail.</p>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Erro ao enviar email:', error);
                    return res.status(500).json({ error: 'Erro ao enviar o e-mail.' });
                }
                console.log('[SUCESSO] E-mail de recuperação enviado para:', email);
                res.json({ message: 'Se o e-mail estiver cadastrado, um link será enviado.' });
            });
        });
    });
});

// 6. REDEFINIÇÃO DE SENHA (Confirmar)
app.post('/api/redefinir-senha', async (req, res) => {
    const { token, novaSenha } = req.body;

    // Verificação de senha forte igual ao do frontend
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

    // Busca o token válido
    db.get('SELECT * FROM recuperacao_senha WHERE token = ? AND expiracao > ?', [token, new Date().toISOString()], async (err, record) => {
        if (err) return res.status(500).json({ error: 'Erro de validação de token' });
        if (!record) return res.status(400).json({ error: 'Token inválido ou expirado.' });

        const email = record.email;

        // Precisamos do nome para garantir a mesma validação frontend de não conter o nome
        db.get('SELECT id, nome, "cliente" as tipo FROM usuarios WHERE email = ? UNION SELECT id, nome, "profissional" as tipo FROM profissionais WHERE email = ?', [email, email], async (err, user) => {
            if (err || !user) return res.status(500).json({ error: 'Usuário não encontrado' });

            const primeiroNome = user.nome.split(' ')[0].toLowerCase();
            if (primeiroNome.length > 2 && novaSenha.toLowerCase().includes(primeiroNome)) {
                return res.status(400).json({ error: 'A senha não pode conter o seu nome.' });
            }

            try {
                const hashedPassword = await bcrypt.hash(novaSenha, 10);
                const tabela = user.tipo === 'profissional' ? 'profissionais' : 'usuarios';

                db.run(`UPDATE ${tabela} SET senha_hash = ? WHERE email = ?`, [hashedPassword, email], function(updateErr) {
                    if (updateErr) return res.status(500).json({ error: 'Erro ao atualizar a senha' });
                    
                    // Invalida o token usado
                    db.run('DELETE FROM recuperacao_senha WHERE token = ?', [token]);
                    
                    res.json({ message: 'Senha redefinida com sucesso!' });
                });
            } catch (hashErr) {
                res.status(500).json({ error: 'Erro ao processar nova senha' });
            }
        });
    });
});

// Serve o build do React (frontend)
const path = require('path');
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
