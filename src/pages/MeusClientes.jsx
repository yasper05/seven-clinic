import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';

const MeusClientes = () => {
    const navigate = useNavigate();
    const { agendamentos } = useContext(AgendamentoContext);
    
    // Filtro básico apenas para visualização
    const [busca, setBusca] = useState('');

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
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>
                                            Nenhum cliente encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MeusClientes;
