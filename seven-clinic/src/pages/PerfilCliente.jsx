import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PerfilCliente = () => {
    const navigate = useNavigate();
    
    // Estados locais para simular os campos do perfil
    const [nome, setNome] = useState('Cliente Exemplo');
    const [email, setEmail] = useState('cliente@exemplo.com');
    const [telefone, setTelefone] = useState('(41) 99999-9999');
    const [senha, setSenha] = useState('');

    const handleSalvar = (e) => {
        e.preventDefault();
        alert('Perfil atualizado com sucesso!');
        setSenha(''); // Limpa a senha por segurança após salvar
    };

    return (
        <div className="dashboard-container">
            {/* Mantemos a mesma barra lateral para navegação consistente */}
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
                            {/* Lado Esquerdo: Foto */}
                            <div className="profile-avatar-col">
                                <div className="avatar-circle">
                                    <span className="avatar-initials">{nome.charAt(0)}</span>
                                </div>
                                <button className="btn-secondary btn-small" style={{marginTop: '15px'}}>Trocar Foto</button>
                            </div>

                            {/* Lado Direito: Formulário */}
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
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PerfilCliente;
