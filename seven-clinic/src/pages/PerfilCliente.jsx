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
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [fotoPerfil, setFotoPerfil] = useState(userLogado.foto_url || null);
    const [excluindo, setExcluindo] = useState(false);
    const [menuAberto, setMenuAberto] = useState(false);
    
    const fileInputRef = React.useRef(null);

    const handleSalvar = async (e) => {
        e.preventDefault();
        try {
            const body = {
                nome,
                email,
                telefone,
                senha,
                foto_url: fotoPerfil
            };

            await api.put(`/api/usuarios/${userLogado.id}`, body);

            // Atualiza sessão
            const newUserLogado = { ...userLogado, nome, email, telefone, foto_url: fotoPerfil };
            if (localStorage.getItem('userLogado')) {
                localStorage.setItem('userLogado', JSON.stringify(newUserLogado));
            } else {
                sessionStorage.setItem('userLogado', JSON.stringify(newUserLogado));
            }

            alert('Perfil atualizado com sucesso!');
            setSenha('');
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao atualizar o perfil. Tente novamente.');
        }
    };

    const handleFotoClick = () => {
        fileInputRef.current.click();
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Foto = reader.result;
                setFotoPerfil(base64Foto);
                
                // Salvar automaticamente a foto no banco de dados
                try {
                    const body = { nome, email, telefone, foto_url: base64Foto };
                    const { default: api } = await import('../api');
                    await api.put(`/api/usuarios/${userLogado.id}`, body);
                    
                    const newUserLogado = { ...userLogado, foto_url: base64Foto };
                    if (localStorage.getItem('userLogado')) {
                        localStorage.setItem('userLogado', JSON.stringify(newUserLogado));
                    } else {
                        sessionStorage.setItem('userLogado', JSON.stringify(newUserLogado));
                    }
                } catch (error) {
                    alert('Aviso: A foto foi alterada na tela, mas houve um erro ao salvar no servidor.');
                }
            };
            reader.readAsDataURL(file);
        }
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
                    <button className="menu-hamburger dash-ham" onClick={() => setMenuAberto(!menuAberto)} aria-label="Menu">
                        <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                        <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                        <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                    </button>
                </div>
                <nav className={`sidebar-nav ${menuAberto ? 'menu-open' : ''}`}>
                    <ul>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setMenuAberto(false); navigate('/painel-cliente'); }}>Meus Agendamentos</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setMenuAberto(false); navigate('/painel-cliente'); }}>Novo Agendamento</a></li>
                        <li className="active"><a href="#" onClick={() => setMenuAberto(false)}>Perfil</a></li>
                        <li><a href="#" onClick={(e) => { 
                            e.preventDefault(); 
                            localStorage.removeItem('userLogado'); 
                            localStorage.removeItem('authToken'); 
                            sessionStorage.removeItem('userLogado'); 
                            sessionStorage.removeItem('authToken'); 
                            navigate('/login'); 
                        }}>Sair</a></li>
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
                                <div className="avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {fotoPerfil ? (
                                        <img src={fotoPerfil} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span className="avatar-initials">{nome.charAt(0)}</span>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFotoChange} 
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                />
                                <button type="button" className="btn-secondary btn-small" style={{marginTop: '15px'}} onClick={handleFotoClick}>Trocar Foto</button>
                            </div>

                            <div className="profile-form-col">
                                <form onSubmit={handleSalvar} className="form-agendamento">
                                    <h3 style={{marginBottom: '20px', fontWeight: '500'}}>Dados Pessoais</h3>

                                    <div className="input-group">
                                        <label>Nome Completo (Não pode ser alterado)</label>
                                        <input 
                                            type="text" 
                                            value={nome} 
                                            readOnly 
                                            style={{ backgroundColor: '#f0f0f0', color: '#666', cursor: 'not-allowed' }}
                                        />
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

                                    <div className="input-group" style={{ position: 'relative' }}>
                                        <label>Nova Senha (deixe em branco para não alterar)</label>
                                        <input 
                                            type={mostrarSenha ? "text" : "password"} 
                                            value={senha} 
                                            onChange={(e) => setSenha(e.target.value)} 
                                            placeholder="••••••••" 
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
