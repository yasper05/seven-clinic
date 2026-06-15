import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';
import '../App.css';

const DashboardFuncionaria = () => {
    const navigate = useNavigate();
    const { agendamentos, buscarAgendamentos } = useContext(AgendamentoContext);
    const [userLogado, setUserLogado] = useState(null);
    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('userLogado') || sessionStorage.getItem('userLogado');
        if (storedUser) {
            setUserLogado(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        buscarAgendamentos();
    }, []);

    if (!userLogado) return <div style={{padding: '20px', textAlign: 'center'}}>Carregando...</div>;

    // Filtros de Data (Mês Atual)
    const dataAtual = new Date();
    const mesAtual = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const anoAtual = String(dataAtual.getFullYear());

    // Filtra agendamentos concluídos da profissional no mês atual
    const agendamentosMes = agendamentos.filter(ag => {
        if (ag.profissional !== userLogado.nome) return false;
        if (ag.status !== 'concluido') return false;
        if (ag.isBloqueio) return false;
        
        const [ano, mes] = ag.data.split('-');
        return ano === anoAtual && mes === mesAtual;
    });

    // Métricas Gerais (Todo o período)
    const agendamentosProfissional = agendamentos.filter(ag => ag.profissional === userLogado?.nome && !ag.isBloqueio);
    const agendamentosConcluidosGeral = agendamentosProfissional.filter(ag => ag.status === 'concluido').length;
    const clientesUnicos = new Set(agendamentosProfissional.map(ag => ag.cliente)).size;

    // Cálculos das Métricas
    const totalAtendimentos = agendamentosMes.length;
    
    const faturamentoTotal = agendamentosMes.reduce((acc, ag) => acc + (ag.valor || 0), 0);
    
    const avaliacoes = agendamentosMes.filter(ag => ag.nota_profissional).map(ag => ag.nota_profissional);
    const notaMedia = avaliacoes.length > 0 
        ? (avaliacoes.reduce((acc, nota) => acc + nota, 0) / avaliacoes.length).toFixed(1) 
        : 'N/A';

    // Ranking de Serviços
    const servicosContagem = {};
    agendamentosMes.forEach(ag => {
        const s = ag.servico.replace(' (Manutenção)', '');
        servicosContagem[s] = (servicosContagem[s] || 0) + 1;
    });
    
    const rankingServicos = Object.keys(servicosContagem)
        .map(servico => ({ nome: servico, quantidade: servicosContagem[servico] }))
        .sort((a, b) => b.quantidade - a.quantidade);

    const nomeMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const nomeMesAtual = nomeMeses[dataAtual.getMonth()];

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
                        <li className="active"><a href="#" onClick={() => setMenuAberto(false)}>Painel de Controle</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setMenuAberto(false); navigate('/meus-clientes'); }}>Meus Clientes</a></li>
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
                    <h1>Painel de Controle</h1>
                    <p>Resumo de desempenho e faturamento de {nomeMesAtual} de {anoAtual}.</p>
                </header>

                {/* Cards de Métricas */}
                <section className="metrics-grid" style={{marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                    
                    <div className="metric-card" style={{background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #2ecc71'}}>
                        <h3 style={{color: '#7f8c8d', fontSize: '1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600'}}>Faturamento do Mês</h3>
                        <p className="metric-value" style={{fontSize: '2.5rem', color: '#2c3e50', fontWeight: 'bold', margin: 0}}>
                            R$ {faturamentoTotal.toFixed(2).replace('.', ',')}
                        </p>
                    </div>

                    <div className="metric-card" style={{background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #3498db'}}>
                        <h3 style={{color: '#7f8c8d', fontSize: '1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600'}}>Serviços Concluídos</h3>
                        <p className="metric-value" style={{fontSize: '2.5rem', color: '#2c3e50', fontWeight: 'bold', margin: 0}}>
                            {totalAtendimentos}
                        </p>
                    </div>

                    <div className="metric-card" style={{background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #f1c40f'}}>
                        <h3 style={{color: '#7f8c8d', fontSize: '1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600'}}>Nota de Avaliação</h3>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <p className="metric-value" style={{fontSize: '2.5rem', color: '#2c3e50', fontWeight: 'bold', margin: 0}}>
                                {notaMedia}
                            </p>
                            <span style={{color: '#f1c40f', fontSize: '1.8rem'}}>★</span>
                        </div>
                        <p style={{fontSize: '0.8rem', color: '#95a5a6', marginTop: '5px'}}>Média das avaliações dos clientes</p>
                    </div>

                </section>

                {/* Cards de Métricas (Geral) */}
                <section style={{marginTop: '20px'}}>
                    <div className="metrics-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                        <div className="metric-card" style={{background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #9b59b6'}}>
                            <h3 style={{color: '#7f8c8d', fontSize: '1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600'}}>Total de Clientes</h3>
                            <p className="metric-value" style={{fontSize: '2.5rem', color: '#2c3e50', fontWeight: 'bold', margin: 0}}>{clientesUnicos}</p>
                            <p style={{fontSize: '0.8rem', color: '#95a5a6', marginTop: '5px'}}>Clientes únicos atendidos</p>
                        </div>

                    </div>
                </section>

                <section style={{marginTop: '40px'}}>
                    <h2 style={{fontSize: '1.3rem', color: '#2c3e50', marginBottom: '15px'}}>Serviços Mais Realizados</h2>
                    <div style={{background: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '20px'}}>
                        {rankingServicos.length > 0 ? (
                            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                {rankingServicos.map((item, index) => (
                                    <li key={index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: index < rankingServicos.length - 1 ? '1px solid #eee' : 'none'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                            <span style={{background: '#f1f3f4', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#2c3e50'}}>{index + 1}º</span>
                                            <span style={{fontSize: '1.1rem', color: '#34495e'}}>{item.nome}</span>
                                        </div>
                                        <span style={{background: '#3498db', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold'}}>
                                            {item.quantidade} {item.quantidade === 1 ? 'vez' : 'vezes'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{color: '#7f8c8d', textAlign: 'center', padding: '20px 0'}}>Nenhum serviço concluído neste mês ainda.</p>
                        )}
                    </div>
                </section>
                
            </main>
        </div>
    );
};

export default DashboardFuncionaria;
