import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [isProfissional, setIsProfissional] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [lembrarMim, setLembrarMim] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, { email, senha, isProfissional });
        const user = response.data.user;
        
        // Validação básica se a aba selecionada condiz com o tipo da conta
        if (isProfissional && user.tipo_usuario !== 'profissional' && user.tipo_usuario !== 'admin') {
            setErro('Acesso negado. Esta conta não é de um perfil profissional.');
            return;
        }
        if (!isProfissional && user.tipo_usuario === 'profissional') {
            setErro('Profissional, utilize a aba correta para acessar o sistema.');
            return;
        }
        
        // Lógica do Me Manter Conectado
        if (lembrarMim) {
            localStorage.setItem('userLogado', JSON.stringify(user));
            sessionStorage.removeItem('userLogado');
        } else {
            sessionStorage.setItem('userLogado', JSON.stringify(user));
            localStorage.removeItem('userLogado');
        }
        
        if (isProfissional) {
            navigate('/painel-funcionaria');
        } else {
            navigate('/painel-cliente');
        }
    } catch (error) {
        setErro(error.response?.data?.error || 'Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="main-container">
      <div className="left-side">
        <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80" alt="Espelho Seven Clinic" />
        <div className="overlay">
          <h1>Bem-vindo<br />de volta.</h1>
        </div>
      </div>

      <div className="right-side">
        <div className="form-container">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
            <button 
                type="button" 
                onClick={() => setIsProfissional(false)}
                style={{
                    flex: 1, 
                    padding: '10px', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: !isProfissional ? '2px solid #654b42' : 'none',
                    color: !isProfissional ? '#654b42' : '#888',
                    fontWeight: !isProfissional ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginBottom: '-2px'
                }}
            >
                Sou Cliente
            </button>
            <button 
                type="button" 
                onClick={() => setIsProfissional(true)}
                style={{
                    flex: 1, 
                    padding: '10px', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: isProfissional ? '2px solid #654b42' : 'none',
                    color: isProfissional ? '#654b42' : '#888',
                    fontWeight: isProfissional ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginBottom: '-2px'
                }}
            >
                Sou Funcionária
            </button>
          </div>
          
          <h2>{isProfissional ? 'Área da Profissional' : 'Acesse sua conta'}</h2>
          <p className="subtitle">
            {isProfissional 
              ? 'Insira seus dados para acessar sua agenda de trabalho.' 
              : 'Insira seus dados para gerenciar seus agendamentos.'}
          </p>

          {erro && <div style={{backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem'}}>{erro}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <input type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#666' }}>
                <input 
                  type="checkbox" 
                  checked={lembrarMim} 
                  onChange={(e) => setLembrarMim(e.target.checked)} 
                  style={{ cursor: 'pointer', margin: 0 }}
                />
                Me manter conectado
              </label>
              <Link to="/recuperar-senha" style={{ color: '#666', textDecoration: 'none' }}>Esqueceu a senha?</Link>
            </div>

            <button type="submit" className="btn-primary">
                {isProfissional ? 'ENTRAR COMO PROFISSIONAL' : 'ENTRAR'}
            </button>
          </form>

          <div className="links" style={{marginTop: '20px', textAlign: 'center'}}>
            {!isProfissional ? (
                <p>Não tem login? <Link to="/cadastro">Cadastre-se</Link></p>
            ) : (
                <p style={{fontSize: '0.9rem', color: '#666'}}>Acesso restrito para a equipe da Seven Clinic.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
