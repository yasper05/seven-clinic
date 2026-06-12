import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';
import { SERVICOS_POR_PROFISSIONAL } from '../data/servicos';
import api from '../api';

const getMinDate = () => {
    const now = new Date();
    if (now.getHours() >= 19) now.setDate(now.getDate() + 1);
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const MeusClientes = () => {
    const navigate = useNavigate();
    const { agendamentos, adicionarAgendamento, buscarAgendamentos } = useContext(AgendamentoContext);
    const [clientesDb, setClientesDb] = useState([]);

    useEffect(() => {
        if (buscarAgendamentos) buscarAgendamentos();
        api.get('/api/clientes').then(res => setClientesDb(res.data)).catch(console.error);
    }, []);
    
    // Filtro básico apenas para visualização
    const [busca, setBusca] = useState('');
    const [menuAberto, setMenuAberto] = useState(false);

    // Estados do Modal de Agendamento
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [clienteHistoricoSelecionado, setClienteHistoricoSelecionado] = useState('');
    const [novoCliente, setNovoCliente] = useState('');
    const [novoServico, setNovoServico] = useState('');
    const [isManutencao, setIsManutencao] = useState(false);
    const [novaData, setNovaData] = useState(getMinDate());
    const [novoHorario, setNovoHorario] = useState('09:00');

    const userLogado = JSON.parse(localStorage.getItem('userLogado') || sessionStorage.getItem('userLogado') || '{}');
    const nomeProfissional = userLogado.nome || 'Você (Profissional)';

    const profissionalData = SERVICOS_POR_PROFISSIONAL[nomeProfissional];
    const categorias = profissionalData ? profissionalData.categorias : {};
    
    const servicosDisponiveis = [];
    Object.keys(categorias).forEach(cat => {
        categorias[cat].forEach(serv => {
            servicosDisponiveis.push({ ...serv, categoria: cat });
        });
    });

    const servicoObj = servicosDisponiveis.find(s => s.nome === novoServico);

    // Filtra apenas agendamentos dessa profissional
    const meusAgendamentos = agendamentos.filter(ag => ag.profissional === nomeProfissional);

    // Métrica 1: Total de Agendamentos Concluídos
    const agendamentosConcluidos = meusAgendamentos.filter(ag => ag.status === 'concluido').length;

    // Métrica 2: Clientes Únicos (baseado no nome do cliente)
    // Usa um Map para guardar o último registro do cliente
    const clientesUnicosMap = new Map();
    meusAgendamentos.forEach(ag => {
        const clienteReal = clientesDb.find(c => c.nome.toLowerCase() === ag.cliente.toLowerCase()) || {};
        const emailToUse = ag.clienteEmail || clienteReal.email || 'Sem e-mail cadastrado';
        const phoneToUse = ag.clienteTelefone || clienteReal.telefone || 'Sem telefone cadastrado';
        
        if (!clientesUnicosMap.has(ag.cliente)) {
            clientesUnicosMap.set(ag.cliente, {
                nome: ag.cliente,
                email: emailToUse,
                telefone: phoneToUse,
                ultimoServico: ag.servico,
                ultimaData: ag.data,
                totalVisitas: 1
            });
        } else {
            const cliente = clientesUnicosMap.get(ag.cliente);
            cliente.totalVisitas += 1;
            if (cliente.email === 'Sem e-mail cadastrado' && emailToUse !== 'Sem e-mail cadastrado') cliente.email = emailToUse;
            if (cliente.telefone === 'Sem telefone cadastrado' && phoneToUse !== 'Sem telefone cadastrado') cliente.telefone = phoneToUse;
            
            // Atualiza a data se for mais recente
            if (new Date(ag.data) > new Date(cliente.ultimaData)) {
                cliente.ultimaData = ag.data;
                cliente.ultimoServico = ag.servico;
            }
        }
    });

    const clientesUnicos = Array.from(clientesUnicosMap.values());

    // Aplica a busca na lista de clientes
    const clientesFiltrados = clientesUnicos.filter(cliente => 
        cliente.nome.toLowerCase().includes(busca.toLowerCase())
    );

    const handleOpenModal = (nomeDoCliente) => {
        setNovoCliente(nomeDoCliente);
        setIsModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        
        // Validação de horário e dia de funcionamento
        const checkDate = new Date(`${novaData}T12:00:00`);
        if (checkDate.getDay() === 0) {
            alert('A clínica não funciona aos domingos. Por favor, escolha outro dia.');
            return;
        }

        const [h1, m1] = novoHorario.split(':').map(Number);
        const startMins = h1 * 60 + m1;
        
        if (startMins < 480 || startMins >= 1140) { // 08:00 às 19:00
            alert('O agendamento deve estar dentro do horário de funcionamento (08:00 às 19:00).');
            return;
        }
        
        let duracaoMinutos = 30; // default
        let valorFinal = 0;
        let finalServicoTexto = novoServico;

        if (servicoObj) {
            duracaoMinutos = servicoObj.duracao;
            valorFinal = servicoObj.preco || 0;
            if (isManutencao && servicoObj.permiteManutencao) {
                valorFinal = Math.max(0, valorFinal - 90);
                finalServicoTexto += ' (Manutenção)';
            }
        }

        const novoAgendamentoObj = {
            cliente: novoCliente,
            servico: finalServicoTexto,
            data: novaData,
            horario: novoHorario,
            duracao: duracaoMinutos,
            valor: valorFinal,
            isManutencao: isManutencao ? 1 : 0,
            profissional: nomeProfissional,
            isBloqueio: false
        };
        
        adicionarAgendamento(novoAgendamentoObj);
        setIsModalOpen(false);
        setNovoServico('');
        setIsManutencao(false);
        setNovaData(getMinDate());
        setNovoHorario('09:00');
        alert(`Agendamento de ${finalServicoTexto} para ${novoCliente} marcado com sucesso!`);
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
                        <li className="active"><a href="#" onClick={() => setMenuAberto(false)}>Meus Clientes</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setMenuAberto(false); navigate('/perfil-funcionaria'); }}>Perfil Profissional</a></li>
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
                    <h1>Meus Clientes</h1>
                    <p>Acompanhe sua carteira de clientes e histórico de atendimentos.</p>
                </header>

                <section className="clients-list-section">
                    <div className="section-header-flex">
                        <h2>Lista de Clientes ({clientesFiltrados.length})</h2>
                        <div className="search-bar">
                            <input 
                                type="text" 
                                placeholder="Buscar cliente por nome..." 
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-agendamentos">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Contato</th>
                                    <th>Último Serviço</th>
                                    <th>Última Visita</th>
                                    <th>Total de Visitas</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientesFiltrados.length > 0 ? (
                                    clientesFiltrados.map((cliente, index) => (
                                        <tr key={index}>
                                            <td style={{fontWeight: '500'}}>{cliente.nome}</td>
                                            <td>
                                                {cliente.telefone}<br/>
                                                <small style={{color: '#666'}}>{cliente.email}</small>
                                            </td>
                                            <td>{cliente.ultimoServico}</td>
                                            <td>{new Date(`${cliente.ultimaData}T12:00:00`).toLocaleDateString('pt-BR')}</td>
                                            <td><span className="badge-visits">{cliente.totalVisitas}</span></td>
                                            <td style={{display: 'flex', gap: '5px'}}>
                                                <button 
                                                    className="btn-primary" 
                                                    style={{padding: '5px 10px', fontSize: '0.8rem', width: 'auto'}}
                                                    onClick={() => handleOpenModal(cliente.nome)}
                                                >
                                                    Agendar
                                                </button>
                                                <button 
                                                    className="btn-secondary" 
                                                    style={{padding: '5px 10px', fontSize: '0.8rem', width: 'auto'}}
                                                    onClick={() => {
                                                        setClienteHistoricoSelecionado(cliente.nome);
                                                        setIsHistoricoModalOpen(true);
                                                    }}
                                                >
                                                    Histórico
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{textAlign: 'center', padding: '30px'}}>
                                            Nenhum cliente encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL NOVO AGENDAMENTO */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 style={{fontSize: '1.4rem', marginBottom: '5px'}}>
                                Novo Agendamento para {novoCliente}
                            </h2>
                            <p style={{color: '#666', marginBottom: '15px'}}>
                                Selecione o serviço, data e horário desejados.
                            </p>

                            <form className="form-agendamento" onSubmit={handleAddSubmit}>
                                <div className="input-group">
                                    <label>Serviço</label>
                                    {servicosDisponiveis.length > 0 ? (
                                        <select value={novoServico} onChange={(e) => {
                                            setNovoServico(e.target.value);
                                            setIsManutencao(false);
                                        }} required>
                                            <option value="" disabled>Selecione um serviço</option>
                                            {servicosDisponiveis.map((s, idx) => (
                                                <option key={idx} value={s.nome}>{s.nome}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input type="text" value={novoServico} onChange={(e) => setNovoServico(e.target.value)} required placeholder="Ex: Design de Sobrancelha" />
                                    )}
                                </div>
                                
                                {servicoObj && servicoObj.permiteManutencao && (
                                    <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={isManutencao} 
                                                onChange={(e) => setIsManutencao(e.target.checked)} 
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>Este agendamento é uma <strong>manutenção</strong> (Desconto aplicado)</span>
                                        </label>
                                    </div>
                                )}
                                
                                <div style={{display: 'flex', gap: '15px'}}>
                                    <div className="input-group" style={{flex: 1}}>
                                        <label>Data</label>
                                        <input type="date" value={novaData} min={getMinDate()} onChange={(e) => {
                                            const today = getMinDate();
                                            let selected = e.target.value;
                                            if (selected && selected < today) selected = today;
                                            if (selected) {
                                                const dt = new Date(`${selected}T12:00:00`);
                                                if (dt.getDay() === 0) {
                                                    alert('A clínica não funciona aos domingos. Por favor, escolha outro dia.');
                                                    e.target.value = novaData;
                                                    return;
                                                }
                                            }
                                            setNovaData(selected);
                                        }} required />
                                    </div>
                                    <div className="input-group" style={{flex: 1}}>
                                        <label>Horário</label>
                                        <input type="time" value={novoHorario} min="08:00" max="19:00" onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                                const [h, m] = val.split(':').map(Number);
                                                const mins = h * 60 + m;
                                                if (mins < 480 || mins >= 1140) {
                                                    alert('O agendamento deve estar dentro do horário de funcionamento (08:00 às 19:00).');
                                                    return;
                                                }
                                            }
                                            setNovoHorario(val);
                                        }} required />
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn-success">Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DE HISTÓRICO DO CLIENTE */}
                {isHistoricoModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-large" style={{maxWidth: '700px'}}>
                            {(() => {
                                const histAgendamentos = agendamentos.filter(ag => ag.cliente === clienteHistoricoSelecionado && ag.profissional === userLogado.nome && ag.status === 'concluido');
                                const notas = histAgendamentos.filter(ag => ag.nota_cliente).map(ag => ag.nota_cliente);
                                const media = notas.length > 0 ? (notas.reduce((a,b)=>a+b,0)/notas.length).toFixed(1) : 'N/A';
                                
                                return (
                                    <>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px'}}>
                                            <h2 style={{margin: 0}}>Histórico de {clienteHistoricoSelecionado}</h2>
                                            <div style={{background: '#f1f3f4', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold'}}>
                                                Nota Média: <span style={{color: '#f39c12'}}>★ {media}</span>
                                            </div>
                                        </div>
                                        
                                        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                            {histAgendamentos.length > 0 ? (
                                                histAgendamentos.map((ag, idx) => (
                                                    <div key={idx} style={{background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '10px'}}>
                                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>
                                                            <strong style={{color: '#2c3e50', fontSize: '1.1rem'}}>{ag.servico}</strong>
                                                            <span style={{color: '#666', fontSize: '0.9rem', fontWeight: '500'}}>{new Date(`${ag.data}T12:00:00`).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                        <div style={{fontSize: '0.95rem', color: '#444'}}>
                                                            <strong style={{display: 'block', marginBottom: '5px', color: '#555'}}>Observações (Ficha):</strong>
                                                            {ag.observacoes ? ag.observacoes : <span style={{fontStyle: 'italic', color: '#999'}}>Nenhuma observação registrada neste atendimento.</span>}
                                                        </div>
                                                        {ag.nota_cliente && (
                                                            <div style={{marginTop: '12px', fontSize: '0.85rem', color: '#666', background: '#fff', display: 'inline-block', padding: '3px 8px', borderRadius: '12px', border: '1px solid #eee'}}>
                                                                Nota atribuída ao cliente: <span style={{color: '#f39c12', fontSize: '1rem', marginLeft: '5px'}}>{'★'.repeat(ag.nota_cliente)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>Nenhum atendimento concluído encontrado para este cliente.</p>
                                            )}
                                        </div>
                                        
                                        <div className="modal-actions" style={{marginTop: '20px'}}>
                                            <button type="button" className="btn-secondary" onClick={() => setIsHistoricoModalOpen(false)}>Fechar Histórico</button>
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MeusClientes;
