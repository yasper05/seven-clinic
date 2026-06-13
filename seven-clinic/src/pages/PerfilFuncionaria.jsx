import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PerfilFuncionaria = () => {
    const navigate = useNavigate();
    
    // Referência para o input de arquivo oculto
    const fileInputRef = useRef(null);

    const userLogado = JSON.parse(localStorage.getItem('userLogado') || sessionStorage.getItem('userLogado') || '{}');

    // Estados locais para os campos do perfil profissional
    const [nome, setNome] = useState(userLogado.nome || 'Você (Profissional)');
    const [fotoPerfil, setFotoPerfil] = useState(userLogado.foto_url || null);
    const [email, setEmail] = useState(userLogado.email || '');
    const [telefone, setTelefone] = useState(userLogado.telefone || '');
    const [senha, setSenha] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    
    // Bio e Especialidades (agora usando dados reais ou defaults se vazio)
    const [bio, setBio] = useState(userLogado.bio || 'Especialista com mais de 5 anos de experiência.');
    const [novaEspecialidade, setNovaEspecialidade] = useState('');
    const [especialidades, setEspecialidades] = useState(() => {
        if (userLogado.especialidades) {
            return userLogado.especialidades.split(',').map(s => s.trim()).filter(Boolean);
        }
        return ['Cílios', 'Design de Sobrancelha'];
    });
    
    const [menuAberto, setMenuAberto] = useState(false);

    const handleSalvar = async (e) => {
        e.preventDefault();
        try {
            const body = {
                nome,
                email,
                telefone,
                senha,
                senha_atual: senhaAtual,
                foto_url: fotoPerfil,
                bio,
                especialidades: especialidades.join(', ')
            };

            // Using the same endpoint as clients for now, since it handles both based on user type
            const { default: api } = await import('../api');
            await api.put(`/api/usuarios/${userLogado.id}`, body);

            // Atualiza sessão
            const newUserLogado = { ...userLogado, nome, email, telefone, foto_url: fotoPerfil, bio, especialidades: especialidades.join(', ') };
            if (localStorage.getItem('userLogado')) {
                localStorage.setItem('userLogado', JSON.stringify(newUserLogado));
            } else {
                sessionStorage.setItem('userLogado', JSON.stringify(newUserLogado));
            }

            alert('Perfil profissional atualizado com sucesso!');
            setSenha('');
            setSenhaAtual('');
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
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
                    const MAX_HEIGHT = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const base64Foto = canvas.toDataURL('image/jpeg', 0.8);
                    setFotoPerfil(base64Foto);
                    
                    // Salvar automaticamente a foto no banco de dados
                    try {
                        const body = { nome, email, telefone, foto_url: base64Foto, bio, especialidades: especialidades.join(', ') };
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
            };
            reader.readAsDataURL(file);
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
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setMenuAberto(false); navigate('/painel-funcionaria'); }}>Agenda do Dia</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setMenuAberto(false); navigate('/dashboard-funcionaria'); }}>Painel de Controle</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setMenuAberto(false); navigate('/meus-clientes'); }}>Meus Clientes</a></li>
                        <li className="active"><a href="#" onClick={() => setMenuAberto(false)}>Perfil Profissional</a></li>
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
                    <h1>Perfil Profissional</h1>
                    <p>Atualize seus dados e como os clientes veem você.</p>
                </header>

                <section className="profile-section">
                    <div className="profile-card">
                        <div className="profile-layout">
                            {/* Lado Esquerdo: Foto */}
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

                            {/* Lado Direito: Formulário */}
                            <div className="profile-form-col">
                                <form onSubmit={handleSalvar} className="form-agendamento">
                                    <h3 style={{marginBottom: '20px', fontWeight: '500'}}>Dados Pessoais</h3>
                                    
                                    <div className="input-group">
                                        <label>Nome / Como deseja ser chamada (Não pode ser alterado)</label>
                                        <input 
                                            type="text" 
                                            value={nome} 
                                            readOnly 
                                            style={{ backgroundColor: '#f0f0f0', color: '#666', cursor: 'not-allowed' }}
                                        />
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
                                        <label>Especialidades</label>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                            <input 
                                                type="text" 
                                                value={novaEspecialidade} 
                                                onChange={(e) => setNovaEspecialidade(e.target.value)} 
                                                placeholder="Digite uma especialidade"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (novaEspecialidade.trim()) {
                                                            setEspecialidades([...especialidades, novaEspecialidade.trim()]);
                                                            setNovaEspecialidade('');
                                                        }
                                                    }
                                                }}
                                            />
                                            <button 
                                                type="button" 
                                                className="btn-secondary" 
                                                style={{ width: 'auto', padding: '0 20px', borderRadius: '4px' }}
                                                onClick={() => {
                                                    if (novaEspecialidade.trim()) {
                                                        setEspecialidades([...especialidades, novaEspecialidade.trim()]);
                                                        setNovaEspecialidade('');
                                                    }
                                                }}
                                            >
                                                Adicionar
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {especialidades.map((esp, idx) => (
                                                <div key={idx} style={{ 
                                                    backgroundColor: '#eaddd7', 
                                                    color: '#654b42', 
                                                    padding: '5px 12px', 
                                                    borderRadius: '20px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '8px',
                                                    fontSize: '0.9rem',
                                                    border: '1px solid #d5c4bd'
                                                }}>
                                                    {esp}
                                                    <span 
                                                        style={{ cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }} 
                                                        onClick={() => setEspecialidades(especialidades.filter((_, i) => i !== idx))}
                                                    >
                                                        ×
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
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
                                        <label>Senha Atual (Obrigatória se for alterar a senha)</label>
                                        <input 
                                            type={mostrarSenha ? "text" : "password"} 
                                            value={senhaAtual} 
                                            onChange={(e) => setSenhaAtual(e.target.value)} 
                                            placeholder="••••••••" 
                                        />
                                    </div>

                                    <div className="input-group" style={{ position: 'relative' }}>
                                        <label>Nova Senha</label>
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
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PerfilFuncionaria;
