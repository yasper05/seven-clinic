import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Cadastro = () => {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [etapa, setEtapa] = useState('formulario');
    const [codigo, setCodigo] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [aceitouTermos, setAceitouTermos] = useState(false);
    const [senhaFocada, setSenhaFocada] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    // Máscara de telefone (XX) XXXXX-XXXX
    const formatarTelefone = (valor) => {
        const nums = valor.replace(/\D/g, '').slice(0, 11);
        if (nums.length === 0) return '';
        if (nums.length <= 2) return `(${nums}`;
        if (nums.length <= 7) return `(${nums.slice(0,2)}) ${nums.slice(2)}`;
        return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
    };

    const handleTelefone = (e) => {
        setTelefone(formatarTelefone(e.target.value));
    };

    // Regras de senha
    const regras = [
        { label: 'Mínimo de 10 caracteres', ok: senha.length >= 10 },
        { label: 'Uma letra maiúscula (A-Z)', ok: /[A-Z]/.test(senha) },
        { label: 'Uma letra minúscula (a-z)', ok: /[a-z]/.test(senha) },
        { label: 'Um número (0-9)', ok: /[0-9]/.test(senha) },
        { label: 'Um caractere especial (!@#$...)', ok: /[!@#$%^&*(),.?":{}|<>]/.test(senha) },
        {
            label: 'Não pode conter seu nome',
            ok: senha.length > 0 && (() => {
                const primeiroNome = nome.split(' ')[0].toLowerCase();
                return !(primeiroNome.length > 2 && senha.toLowerCase().includes(primeiroNome));
            })()
        },
    ];

    const validarSenhaForte = (senha, nomeUsuario) => {
        if (senha.length < 10) return "A senha deve ter pelo menos 10 caracteres.";
        if (!/[A-Z]/.test(senha)) return "A senha deve conter pelo menos uma letra maiúscula.";
        if (!/[a-z]/.test(senha)) return "A senha deve conter pelo menos uma letra minúscula.";
        if (!/[0-9]/.test(senha)) return "A senha deve conter pelo menos um número.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return "A senha deve conter pelo menos um caractere especial.";
        if (nomeUsuario) {
            const primeiroNome = nomeUsuario.split(' ')[0].toLowerCase();
            if (primeiroNome.length > 2 && senha.toLowerCase().includes(primeiroNome)) {
                return "A senha não pode conter o seu nome.";
            }
        }
        return null;
    };

    const handleCadastro = async (e) => {
        if (e) e.preventDefault();
        setErro('');
        setSucesso('');

        const erroSenha = validarSenhaForte(senha, nome);
        if (erroSenha) { setErro(erroSenha); return; }
        if (!aceitouTermos) { setErro('Você precisa aceitar a Política de Privacidade para se cadastrar.'); return; }

        setCarregando(true);
        try {
            const res = await api.post('/api/usuarios', {
                nome, telefone, email, senha, tipo_usuario: 'cliente'
            });
            setSucesso(res.data.message);
            setEtapa('verificacao');
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao criar cadastro.');
        } finally {
            setCarregando(false);
        }
    };

    const handleVerificar = async (e) => {
        e.preventDefault();
        setErro('');
        if (codigo.trim().length !== 6) { setErro('O código deve ter 6 dígitos.'); return; }

        setCarregando(true);
        try {
            await api.post('/api/verificar-email', { email, codigo });
            setSucesso('E-mail verificado! Conta criada com sucesso. Redirecionando...');
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao verificar o código.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="main-container">
            <div className="left-side">
                <img
                    src="/imagem/IMG_9051.JPG.jpeg"
                    alt="Ambiente Seven Clinic"
                    style={{ objectPosition: 'top' }}
                />
                <div className="overlay">
                    <h1>Sua beleza,<br />nossa arte.</h1>
                </div>
            </div>

            <div className="right-side" style={{ position: 'relative' }}>
                <Link to="/" style={{ position: 'absolute', top: '30px', left: '40px', color: '#aaa', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>
                    ← Voltar ao Início
                </Link>
                <div className="form-container">

                    {etapa === 'formulario' && (
                        <>
                            <h2>Crie sua conta</h2>
                            <p className="subtitle">Preencha seus dados para agendar seu momento.</p>

                            {erro && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>{erro}</div>}

                            <form onSubmit={handleCadastro}>
                                <div className="input-group">
                                    <label htmlFor="nome">Nome Completo</label>
                                    <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="telefone">Celular</label>
                                    <input
                                        type="tel"
                                        id="telefone"
                                        placeholder="(XX) XXXXX-XXXX"
                                        value={telefone}
                                        onChange={handleTelefone}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="email">E-mail</label>
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <label htmlFor="senha">Senha</label>
                                    <input
                                        type={mostrarSenha ? "text" : "password"}
                                        id="senha"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        onFocus={() => setSenhaFocada(true)}
                                        required
                                        style={{ paddingRight: '80px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        style={{
                                            position: 'absolute',
                                            right: '15px',
                                            bottom: '14px',
                                            background: 'none',
                                            border: 'none',
                                            color: '#888',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                </div>

                                {/* Regras de senha — aparece ao clicar no campo */}
                                {senhaFocada && (
                                    <ul className="regras-senha">
                                        {regras.map((r, i) => (
                                            <li key={i} className={r.ok ? 'regra-ok' : 'regra-erro'}>
                                                <span className="regra-icone">{r.ok ? '✓' : '✗'}</span>
                                                {r.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div style={{ margin: '15px 0', fontSize: '0.85rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', color: '#666', lineHeight: '1.4' }}>
                                        <input
                                            type="checkbox"
                                            checked={aceitouTermos}
                                            onChange={(e) => setAceitouTermos(e.target.checked)}
                                            style={{ marginTop: '2px', cursor: 'pointer', flexShrink: 0 }}
                                        />
                                        <span>
                                            Li e concordo com a{' '}
                                            <Link to="/politica-de-privacidade" target="_blank" style={{ color: '#654b42', fontWeight: '600' }}>
                                                Política de Privacidade
                                            </Link>.
                                            Entendo que meus dados serão usados para gerenciar meus agendamentos e enviar lembretes.
                                        </span>
                                    </label>
                                </div>
                                <button type="submit" className="btn-primary" disabled={carregando || !aceitouTermos}>
                                    {carregando ? 'ENVIANDO...' : 'CADASTRAR'}
                                </button>
                            </form>

                            <div className="links">
                                <p>Já possui cadastro? <Link to="/login">Fazer login</Link></p>
                            </div>
                        </>
                    )}

                    {etapa === 'verificacao' && (
                        <>
                            <h2>Confirme seu e-mail</h2>
                            <p className="subtitle">
                                Enviamos um código de 6 dígitos para <strong style={{ color: '#fff' }}>{email}</strong>. Insira-o abaixo para ativar sua conta.
                            </p>

                            {erro && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>{erro}</div>}
                            {sucesso && <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>{sucesso}</div>}

                            <form onSubmit={handleVerificar}>
                                <div className="input-group">
                                    <label htmlFor="codigo">Código de Verificação</label>
                                    <input
                                        type="text"
                                        id="codigo"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={codigo}
                                        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                                        style={{ fontSize: '1.5rem', letterSpacing: '8px', textAlign: 'center' }}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={carregando}>
                                    {carregando ? 'VERIFICANDO...' : 'CONFIRMAR E-MAIL'}
                                </button>
                            </form>

                            <div className="links" style={{ marginTop: '15px' }}>
                                <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                    Não recebeu?{' '}
                                    <button
                                        onClick={handleCadastro}
                                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
                                    >
                                        Reenviar código
                                    </button>
                                </p>
                                <p>
                                    <button
                                        onClick={() => { setEtapa('formulario'); setErro(''); setSucesso(''); }}
                                        style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.85rem', marginTop: '5px' }}
                                    >
                                        ← Voltar ao formulário
                                    </button>
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Cadastro;
