import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PerfilCliente = () => {
    const navigate = useNavigate();

    const userLogado = JSON.parse(localStorage.getItem('userLogado') || sessionStorage.getItem('userLogado') || '{}');

    const [nome, setNome] = useState(userLogado.nome || 'Cliente');
    const [email, setEmail] = useState(userLogado.email || '');
    const [telefone, setTelefone] = useState(userLogado.telefone || '');
    const [senha, setSenha] = useState('');
    const [excluindo, setExcluindo] = useState(false);

    const handleSalvar = (e) => {
        e.preventDefault();
        alert('Perfil atualizado com sucesso!');
        setSenha('');
    };

    const handleExcluirConta = async () => {
        const confirmado = window.confirm(
            '⚠️ Tem certeza que deseja excluir sua conta?\n\n' +
            'Esta ação é permanente e removerá todos os seus dados de acordo com a LGPD (Art. 18). ' +
            'Você será desconectada imediatamente.'
        );
        if (!confirmado) return;

        setExcluindo(true);
        try {
            await api.delete(`/api/usuarios/${userLogado.id}`);

            // Limpa todos os dados de sessão
            localStorage.removeItem('userLogado');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('userLogado');
            sessionStorage.removeItem('authToken');

            alert('Sua conta foi excluída com sucesso. Obrigada por usar a Seven Clinic.');
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao excluir conta. Tente novamente.');
        } finally {
            setExcluindo(false);
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>SEVEN <span className="logo-sub">CLINIC</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/painel-cliente'); }}>Meus Agendamentos</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/painel-cliente'); }}>Novo Agendamento</a></li>
                        <li className="active"><a href="#">Perfil</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sair</a></li>
                    </ul>
                </nav>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Meu Perfil</h1>
                    <p>Gerencie suas informações pessoais e de contato.</p>
                </header>

                <section className="profile-section">
                    <div className="profile-card">
                        <div className="profile-layout">
                            <div className="profile-avatar-col">
                                <div className="avatar-circle">
                                    <span className="avatar-initials">{nome.charAt(0)}</span>
                                </div>
                                <button className="btn-secondary btn-small" style={{marginTop: '15px'}}>Trocar Foto</button>
                            </div>

                            <div className="profile-form-col">
                                <form onSubmit={handleSalvar} className="form-agendamento">
                                    <h3 style={{marginBottom: '20px', fontWeight: '500'}}>Dados Pessoais</h3>

                                    <div className="input-group">
                                        <label>Nome Completo</label>
                                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                    </div>

                                    <div style={{display: 'flex', gap: '15px'}}>
                                        <div className="input-group" style={{flex: 1}}>
                                            <label>E-mail</label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                        <div className="input-group" style={{flex: 1}}>
                                            <label>Celular</label>
                                            <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                                        </div>
                                    </div>

                                    <h3 style={{marginTop: '20px', marginBottom: '20px', fontWeight: '500'}}>Segurança</h3>

                                    <div className="input-group">
                                        <label>Nova Senha (deixe em branco para não alterar)</label>
                                        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
                                    </div>

                                    <button type="submit" className="btn-primary" style={{marginTop: '20px', width: 'auto', padding: '12px 30px'}}>
                                        SALVAR ALTERAÇÕES
                                    </button>
                                </form>

                                {/* Zona de Perigo - LGPD Art. 18 */}
                                <div style={{marginTop: '40px', padding: '20px', border: '1px solid #ffcdd2', borderRadius: '8px', background: '#fff8f8'}}>
                                    <h3 style={{color: '#c62828', marginBottom: '8px', fontWeight: '600', fontSize: '0.95rem'}}>⚠️ Zona de Perigo</h3>
                                    <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '15px'}}>
                                        De acordo com a <strong>LGPD (Art. 18)</strong>, você tem o direito de solicitar a exclusão dos seus dados pessoais a qualquer momento. Esta ação é permanente e não pode ser desfeita.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleExcluirConta}
                                        disabled={excluindo}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #c62828',
                                            color: '#c62828',
                                            padding: '8px 20px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {excluindo ? 'Excluindo...' : 'Excluir minha conta'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PerfilCliente;
