import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cadastro = () => {
    const navigate = useNavigate();
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
                    <h2>Crie sua conta</h2>
                    <p className="subtitle">Preencha seus dados para agendar seu momento.</p>

                    <form onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
                        <div className="input-group">
                            <label htmlFor="nome">Nome Completo</label>
                            <input type="text" id="nome" required />
                        </div>

                        <div className="input-group">
                            <label htmlFor="telefone">Celular</label>
                            <input type="tel" id="telefone" placeholder="(XX) 9XXXX-XXXX" required />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" id="email" required />
                        </div>

                        <div className="input-group">
                            <label htmlFor="senha">Senha</label>
                            <input type="password" id="senha" required />
                        </div>

                        <button type="submit" className="btn-primary">CADASTRAR</button>
                    </form>

                    <div className="links">
                        <p>Já possui cadastro? <Link to="/login">Fazer login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cadastro;
