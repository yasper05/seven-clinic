import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      <div className="left-side">
        <img src="/imagem/bonitaseven.png" alt="Espelho Seven Clinic" />
        <div className="overlay">
          <h1>Bem-vindo<br />de volta.</h1>
        </div>
      </div>

      <div className="right-side">
        <div className="form-container">
          <h2>Acesse sua conta</h2>
          <p className="subtitle">Insira seus dados para gerenciar seus agendamentos.</p>

          <form onSubmit={(e) => { e.preventDefault(); navigate('/painel-cliente'); }}>
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" placeholder="seu@email.com" required />
            </div>

            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <input type="password" id="senha" required />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <a href="#" style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'none' }}>Esqueceu a senha?</a>
            </div>

            <button type="submit" className="btn-primary">ENTRAR</button>
          </form>

          <div className="links">
            <p>Não tem login? <Link to="/cadastro">Cadastre-se</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
