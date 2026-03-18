import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';

const MeusClientes = () => {
    const navigate = useNavigate();
    const { agendamentos, adicionarAgendamento } = useContext(AgendamentoContext);
    
    // Filtro básico apenas para visualização
    const [busca, setBusca] = useState('');

    // Estados do Modal de Agendamento
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [novoCliente, setNovoCliente] = useState('');
    const [novoServico, setNovoServico] = useState('');
    const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
    const [novoHorario, setNovoHorario] = useState('09:00');

    // Em um app real, o nome profissional viria do usuário logado
    const nomeProfissional = 'Você (Profissional)';

    // Filtra apenas agendamentos dessa profissional
    const meusAgendamentos = agendamentos.filter(ag => ag.profissional === nomeProfissional);

    // Métrica 1: Total de Agendamentos Concluídos
    const agendamentosConcluidos = meusAgendamentos.filter(ag => ag.status === 'concluido').length;

    // Métrica 2: Clientes Únicos (baseado no nome do cliente)
    // Usa um Map para guardar o último registro do cliente
    const clientesUnicosMap = new Map();
    meusAgendamentos.forEach(ag => {
        if (!clientesUnicosMap.has(ag.cliente)) {
            clientesUnicosMap.set(ag.cliente, {
                nome: ag.cliente,
                email: `${ag.cliente.toLowerCase().split(' ')[0]}@exemplo.com`, // mock email
                telefone: '(41) 9' + Math.floor(10000000 + Math.random() * 90000000).toString(), // mock phone
                ultimoServico: ag.servico,
                ultimaData: ag.data,
                totalVisitas: 1
            });
        } else {
            const cliente = clientesUnicosMap.get(ag.cliente);
            cliente.totalVisitas += 1;
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
        const novoAgendamentoObj = {
            cliente: novoCliente,
            servico: novoServico,
            data: novaData,
            horario: novoHorario,
            profissional: nomeProfissional
        };
        adicionarAgendamento(novoAgendamentoObj);
        setIsModalOpen(false);
        setNovoServico('');
        setNovaData(new Date().toISOString().split('T')[0]);
        setNovoHorario('09:00');
        alert(`Agendamento de ${novoServico} para ${novoCliente} marcado com sucesso!`);
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
                        <li className="active"><a href="#">Meus Clientes</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/perfil-funcionaria'); }}>Perfil Profissional</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sair</a></li>
                    </ul>
                </nav>
            </aside>
            
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Meus Clientes</h1>
                    <p>Acompanhe sua carteira de clientes e histórico de atendimentos.</p>
                </header>

                {/* Cards de Métricas */}
                <section className="metrics-grid">
                    <div className="metric-card">
                        <h3>Total de Clientes</h3>
                        <p className="metric-value">{clientesUnicos.length}</p>
                        <p className="metric-desc">Clientes atendidos</p>
                    </div>
                    <div className="metric-card">
                        <h3>Agendamentos Concluídos</h3>
                        <p className="metric-value">{agendamentosConcluidos}</p>
                        <p className="metric-desc">Serviços finalizados com sucesso</p>
                    </div>
                </section>

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
                                            <td>
                                                <button 
                                                    className="btn-primary" 
                                                    style={{padding: '5px 10px', fontSize: '0.8rem', width: 'auto'}}
                                                    onClick={() => handleOpenModal(cliente.nome)}
                                                >
                                                    Agendar
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
                                    <input type="text" value={novoServico} onChange={(e) => setNovoServico(e.target.value)} required placeholder="Ex: Manutenção de Cílios" />
                                </div>
                                
                                <div style={{display: 'flex', gap: '15px'}}>
                                    <div className="input-group" style={{flex: 1}}>
                                        <label>Data</label>
                                        <input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} required />
                                    </div>
                                    <div className="input-group" style={{flex: 1}}>
                                        <label>Horário</label>
                                        <input type="time" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} required />
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
            </main>
        </div>
    );
};

export default MeusClientes;
