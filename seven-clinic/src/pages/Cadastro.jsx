import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cadastro = () => {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [etapa, setEtapa] = useState('formulario'); // 'formulario' | 'verificacao'
    const [codigo, setCodigo] = useState('');
    const [carregando, setCarregando] = useState(false);

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

    // Passo 1: envia os dados e recebe o código no email
    const handleCadastro = async (e) => {
        if (e) e.preventDefault();
        setErro('');
        setSucesso('');

        const erroSenha = validarSenhaForte(senha, nome);
        if (erroSenha) { setErro(erroSenha); return; }

        setCarregando(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/usuarios`, {
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

    // Passo 2: confirma o código de 6 dígitos
    const handleVerificar = async (e) => {
        e.preventDefault();
        setErro('');
        if (codigo.trim().length !== 6) { setErro('O código deve ter 6 dígitos.'); return; }

        setCarregando(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/verificar-email`, { email, codigo });
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
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop"
                    alt="Ambiente Seven Clinic"
                />
                <div className="overlay">
                    <h1>Sua beleza,<br />nossa arte.</h1>
                </div>
            </div>

            <div className="right-side">
                <div className="form-container">

                    {etapa === 'formulario' && (
                        <>
                            <h2>Crie sua conta</h2>
                            <p className="subtitle">Preencha seus dados para agendar seu momento.</p>

                            {erro && <div style={{backgroundColor:'#ffebee',color:'#c62828',padding:'10px',borderRadius:'4px',marginBottom:'15px',fontSize:'0.9rem'}}>{erro}</div>}

                            <form onSubmit={handleCadastro}>
                                <div className="input-group">
                                    <label htmlFor="nome">Nome Completo</label>
                                    <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="telefone">Celular</label>
                                    <input type="tel" id="telefone" placeholder="(XX) 9XXXX-XXXX" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="email">E-mail</label>
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="senha">Senha</label>
                                    <input type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn-primary" disabled={carregando}>
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
                                Enviamos um código de 6 dígitos para <strong style={{color:'#fff'}}>{email}</strong>. Insira-o abaixo para ativar sua conta.
                            </p>

                            {erro && <div style={{backgroundColor:'#ffebee',color:'#c62828',padding:'10px',borderRadius:'4px',marginBottom:'15px',fontSize:'0.9rem'}}>{erro}</div>}
                            {sucesso && <div style={{backgroundColor:'#e8f5e9',color:'#2e7d32',padding:'10px',borderRadius:'4px',marginBottom:'15px',fontSize:'0.9rem'}}>{sucesso}</div>}

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

                            <div className="links" style={{marginTop:'15px'}}>
                                <p style={{fontSize:'0.85rem',color:'#aaa'}}>
                                    Não recebeu?{' '}
                                    <button
                                        onClick={handleCadastro}
                                        style={{background:'none',border:'none',color:'#fff',cursor:'pointer',textDecoration:'underline',fontSize:'0.85rem'}}
                                    >
                                        Reenviar código
                                    </button>
                                </p>
                                <p>
                                    <button
                                        onClick={() => { setEtapa('formulario'); setErro(''); setSucesso(''); }}
                                        style={{background:'none',border:'none',color:'#aaa',cursor:'pointer',fontSize:'0.85rem',marginTop:'5px'}}
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
