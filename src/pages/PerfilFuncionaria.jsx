import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PerfilFuncionaria = () => {
    const navigate = useNavigate();
    
    // Estados locais para simular os campos do perfil profissional
    const [nome, setNome] = useState('Você (Profissional)');
    const [email, setEmail] = useState('profissional@sevenclinic.com');
    const [telefone, setTelefone] = useState('(41) 98888-8888');
    const [senha, setSenha] = useState('');
    const [bio, setBio] = useState('Especialista em Cílios e Design de Sobrancelha com mais de 5 anos de experiência em visagismo facial.');
    const [especialidades, setEspecialidades] = useState('Cílios Volume Brasileiro, Design de Sobrancelha');

    const handleSalvar = (e) => {
        e.preventDefault();
        alert('Perfil profissional atualizado com sucesso!');
        setSenha(''); // Limpa a senha por segurança após salvar
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>SEVEN <span className="logo-sub">CLINIC</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/painel-funcionaria'); }}>Agenda do Dia</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/meus-clientes'); }}>Meus Clientes</a></li>
                        <li className="active"><a href="#">Perfil Profissional</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sair</a></li>
                    </ul>
                </nav>
            </aside>
            
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Perfil Profissional</h1>
                    <p>Atualize seus dados e como os clientes veem você.</p>
                </header>

                <section className="profile-section">
                    <div className="profile-card">
                        <div className="profile-layout">
                            {/* Lado Esquerdo: Foto */}
                            <div className="profile-avatar-col">
                                <div className="avatar-circle">
                                    <span className="avatar-initials">{nome.charAt(0)}</span>
                                </div>
                                <button className="btn-secondary btn-small" style={{marginTop: '15px'}}>Atualizar Foto</button>
                            </div>

                            {/* Lado Direito: Formulário */}
                            <div className="profile-form-col">
                                <form onSubmit={handleSalvar} className="form-agendamento">
                                    <h3 style={{marginBottom: '20px', fontWeight: '500'}}>Dados Pessoais</h3>
                                    
                                    <div className="input-group">
                                        <label>Nome / Como deseja ser chamada</label>
                                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                    </div>
                                    
                                    <div style={{display: 'flex', gap: '15px'}}>
                                        <div className="input-group" style={{flex: 1}}>
                                            <label>E-mail Profissional</label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                        <div className="input-group" style={{flex: 1}}>
                                            <label>Celular</label>
                                            <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                                        </div>
                                    </div>

                                    <h3 style={{marginTop: '20px', marginBottom: '20px', fontWeight: '500'}}>Perfil Público</h3>
                                    
                                    <div className="input-group">
                                        <label>Especialidades (separadas por vírgula)</label>
                                        <input type="text" value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} required />
                                    </div>

                                    <div className="input-group">
                                        <label>Mini-Biografia</label>
                                        <textarea 
                                            value={bio} 
                                            onChange={(e) => setBio(e.target.value)} 
                                            rows="4" 
                                            style={{width: '100%', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', fontFamily: 'inherit', resize: 'vertical'}}
                                        ></textarea>
                                    </div>

                                    <h3 style={{marginTop: '20px', marginBottom: '20px', fontWeight: '500'}}>Segurança</h3>
                                    
                                    <div className="input-group">
                                        <label>Nova Senha</label>
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

export default PerfilFuncionaria;
