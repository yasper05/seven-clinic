import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RecuperarSenha = () => {
    const [email, setEmail] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [erro, setErro] = useState('');

    const handleRecuperar = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        if (!email) {
            setErro('Por favor, informe um e-mail válido.');
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/recuperar-senha`, { email });
            setSucesso(response.data.message || 'Se este e-mail estiver cadastrado, você receberá um link de recuperação em instantes.');
            setEmail('');
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao solicitar recuperação. Tente novamente mais tarde.');
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
                    <h2>Recuperar Senha</h2>
                    <p className="subtitle">
                        Informe o e-mail associado à sua conta para receber instruções de redefinição de senha.
                    </p>

                    {erro && <div style={{backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem'}}>{erro}</div>}
                    {sucesso && <div style={{backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem'}}>{sucesso}</div>}

                    <form onSubmit={handleRecuperar}>
                        <div className="input-group">
                            <label htmlFor="email">E-mail Cadastrado</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="seu@email.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                            ENVIAR LINK DE RECUPERAÇÃO
                        </button>
                    </form>

                    <div className="links" style={{marginTop: '20px', textAlign: 'center'}}>
                        <Link to="/login" style={{ color: '#654b42', fontWeight: 'bold' }}>&larr; Voltar para o Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecuperarSenha;
