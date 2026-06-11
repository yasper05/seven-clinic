import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [isProfissional, setIsProfissional] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [lembrarMim, setLembrarMim] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  React.useEffect(() => {
    const userJson = localStorage.getItem('userLogado') || sessionStorage.getItem('userLogado');
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (userJson && token) {
      try {
        const user = JSON.parse(userJson);
        if (user.tipo_usuario === 'profissional' || user.tipo_usuario === 'admin') {
          navigate('/painel-funcionaria', { replace: true });
        } else {
          navigate('/painel-cliente', { replace: true });
        }
      } catch (e) {
        console.error("Erro ao ler dados do login persistido:", e);
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await api.post('/api/login', { email, senha, isProfissional });
      const { user, token } = response.data;

      // Validação básica se a aba selecionada condiz com o tipo da conta
      if (isProfissional && user.tipo_usuario !== 'profissional' && user.tipo_usuario !== 'admin') {
        setErro('Acesso negado. Esta conta não é de um perfil profissional.');
        return;
      }
      if (!isProfissional && user.tipo_usuario === 'profissional') {
        setErro('Profissional, utilize a aba correta para acessar o sistema.');
        return;
      }

      // Salva o token JWT e dados do usuário
      if (lembrarMim) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userLogado', JSON.stringify(user));
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userLogado');
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userLogado', JSON.stringify(user));
        localStorage.removeItem('authToken');
        localStorage.removeItem('userLogado');
      }

      if (isProfissional) {
        navigate('/painel-funcionaria');
      } else {
        navigate('/painel-cliente');
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setErro(error.response?.data?.error || `Falha no sistema: ${error.message}`);
    }
  };

  return (
    <div className="main-container">
      <div className="left-side">
        <img src="/imagem/IMG_2119.PNG" alt="Espelho Seven Clinic" style={{ objectPosition: 'top' }} />
        <div className="overlay">
          <h1>Bem-vindo<br />de volta.</h1>
        </div>
      </div>

      <div className="right-side" style={{ position: 'relative' }}>
        <Link to="/" style={{ position: 'absolute', top: '30px', left: '40px', color: '#aaa', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>
          ← Voltar ao Início
        </Link>
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

          {erro && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>{erro}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <label htmlFor="senha">Senha</label>
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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

          <div className="links" style={{ marginTop: '20px', textAlign: 'center' }}>
            {!isProfissional ? (
              <p>Não tem login? <Link to="/cadastro">Cadastre-se</Link></p>
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Acesso restrito para a equipe da Seven Clinic.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
