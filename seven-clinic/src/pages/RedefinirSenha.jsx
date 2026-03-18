import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const RedefinirSenha = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const validarSenhaForte = (senha) => {
        if (senha.length < 10) return "A senha deve ter pelo menos 10 caracteres.";
        if (!/[A-Z]/.test(senha)) return "A senha deve conter pelo menos uma letra maiúscula.";
        if (!/[a-z]/.test(senha)) return "A senha deve conter pelo menos uma letra minúscula.";
        if (!/[0-9]/.test(senha)) return "A senha deve conter pelo menos um número.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return "A senha deve conter pelo menos um caractere especial.";
        return null;
    };

    const handleRedefinir = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        if (!token) {
            setErro('Token de recuperação inválido ou ausente da URL.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        const erroSenha = validarSenhaForte(novaSenha);
        if (erroSenha) {
            setErro(erroSenha);
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/redefinir-senha`, { token, novaSenha });
            setSucesso(response.data.message || 'Senha redefinida com sucesso! Redirecionando...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao redefinir a senha. O link pode ter expirado.');
        }
    };

    return (
        <div className="main-container">
            <div className="left-side">
                <img src="/imagem/bonitaseven.png" alt="Espelho Seven Clinic" />
                <div className="overlay">
                    <h1>Tranquilidade<br />e segurança.</h1>
                </div>
            </div>

            <div className="right-side">
                <div className="form-container">
                    <h2>Redefinir Senha</h2>
                    <p className="subtitle">Crie uma nova senha forte para a sua conta.</p>

                    {erro && <div style={{backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem'}}>{erro}</div>}
                    {sucesso && <div style={{backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem'}}>{sucesso}</div>}

                    <form onSubmit={handleRedefinir}>
                        <div className="input-group">
                            <label htmlFor="novaSenha">Nova Senha</label>
                            <input 
                                type="password" 
                                id="novaSenha" 
                                value={novaSenha} 
                                onChange={(e) => setNovaSenha(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
                            <input 
                                type="password" 
                                id="confirmarSenha" 
                                value={confirmarSenha} 
                                onChange={(e) => setConfirmarSenha(e.target.value)} 
                                required 
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                            SALVAR NOVA SENHA
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RedefinirSenha;
