import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';

const PainelCliente = () => {
    const navigate = useNavigate();
    const { agendamentos, adicionarAgendamento, cancelarAgendamento } = useContext(AgendamentoContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state for new appointment
    const [novoServico, setNovoServico] = useState('Cílios Volume Brasileiro');
    const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
    const [novoHorario, setNovoHorario] = useState('');
    const [novoProfissional, setNovoProfissional] = useState('Maria');

    // Horários de funcionamento (08h as 19h)
    const horariosPossiveis = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
        "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

    // Verifica quais horários estão ocupados para o profissional e data selecionados
    const horariosOcupados = agendamentos
        .filter(ag => ag.status === 'pendente' && ag.profissional === novoProfissional && ag.data === novaData)
        .map(ag => ag.horario);
        
    // Horários realmente disponíveis para exibir
    const horariosDisponiveis = horariosPossiveis.filter(h => !horariosOcupados.includes(h));

    // Filter appointments for the client
    const meusAgendamentos = agendamentos.filter(ag => ag.cliente === 'Você');
    const agendamentosPendentes = meusAgendamentos.filter(ag => ag.status === 'pendente').sort((a, b) => new Date(a.data) - new Date(b.data));
    const historico = meusAgendamentos.filter(ag => ag.status === 'concluido').sort((a, b) => new Date(b.data) - new Date(a.data));

    const proximoAgendamento = agendamentosPendentes.length > 0 ? agendamentosPendentes[0] : null;

    const handleAgendar = (e) => {
        e.preventDefault();
        if(!novaData || !novoHorario) {
            alert("Por favor, selecione uma data e um horário livre.");
            return;
        }
        
        adicionarAgendamento({
            cliente: 'Você',
            servico: novoServico,
            data: novaData,
            horario: novoHorario,
            profissional: novoProfissional
        });
        
        setIsModalOpen(false);
        setNovaData('');
    };

    const handleCancelar = (id) => {
        if(window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
            cancelarAgendamento(id);
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
                        <li className="active"><a href="#">Meus Agendamentos</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>Novo Agendamento</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/perfil-cliente'); }}>Perfil</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sair</a></li>
                    </ul>
                </nav>
            </aside>
            
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Olá, Cliente!</h1>
                    <p>Bem-vinda de volta ao seu espaço de beleza e bem-estar.</p>
                </header>

                <section className="dashboard-cards">
                    {proximoAgendamento ? (
                        <div className="card-agendamento destaquecard">
                            <h3>Próximo Agendamento</h3>
                            <div className="agendamento-details">
                                <p><strong>Serviço:</strong> {proximoAgendamento.servico}</p>
                                <p><strong>Data:</strong> {new Date(proximoAgendamento.data).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Horário:</strong> {proximoAgendamento.horario}</p>
                                <p><strong>Profissional:</strong> {proximoAgendamento.profissional}</p>
                            </div>
                            <button className="btn-secondary" onClick={() => handleCancelar(proximoAgendamento.id)}>Cancelar Agendamento</button>
                        </div>
                    ) : (
                        <div className="card-agendamento destaquecard">
                            <h3>Nenhum agendamento futuro</h3>
                            <p style={{color: '#666', marginTop: '10px'}}>Você não possui serviços agendados no momento.</p>
                        </div>
                    )}

                    <div className="card-action">
                        <h3>Quer agendar um novo momento?</h3>
                        <p>Explore nossos serviços e garanta seu horário.</p>
                        <button className="btn-primary" style={{marginTop: '15px'}} onClick={() => setIsModalOpen(true)}>AGENDAR AGORA</button>
                    </div>
                </section>

                <section className="dashboard-history">
                    <h2>Histórico de Agendamentos</h2>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Serviço</th>
                                <th>Data</th>
                                <th>Profissional</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meusAgendamentos.map(ag => (
                                <tr key={ag.id}>
                                    <td>{ag.servico}</td>
                                    <td>{new Date(ag.data).toLocaleDateString('pt-BR')} {ag.horario}</td>
                                    <td>{ag.profissional}</td>
                                    <td>
                                        <span className={ag.status === 'concluido' ? 'status-concluido' : 'status-badge'}>
                                            {ag.status === 'concluido' ? 'Concluído' : 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {meusAgendamentos.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Nenhum histórico encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* MODAL NOVO AGENDAMENTO EXIBIDO COMO GOOGLE CALENDAR */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-large">
                            <h2>Agendar um Momento</h2>
                            <form onSubmit={handleAgendar} className="form-agendamento">
                                <div className="modal-grid">
                                    
                                    {/* Lado Esquerdo: Formulário Básico */}
                                    <div className="modal-form-col">
                                        <div className="input-group">
                                            <label>Serviço</label>
                                            <select value={novoServico} onChange={(e) => setNovoServico(e.target.value)} required>
                                                <option value="Cílios Volume Brasileiro">Cílios Volume Brasileiro</option>
                                                <option value="Unhas (Mão e Pé)">Unhas (Mão e Pé)</option>
                                                <option value="Design de Sobrancelha">Design de Sobrancelha</option>
                                                <option value="Lip Blush">Lip Blush</option>
                                                <option value="Maquiagem">Maquiagem</option>
                                                <option value="Limpeza de Pele">Limpeza de Pele</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>Profissional</label>
                                            <select value={novoProfissional} onChange={(e) => {
                                                setNovoProfissional(e.target.value);
                                                setNovoHorario(''); // Reset time when changing professional
                                            }} required>
                                                <option value="Maria">Maria (Cílios, Sobrancelha)</option>
                                                <option value="Ana">Ana (Unhas)</option>
                                                <option value="Julia">Julia (Estética, Maquiagem)</option>
                                                <option value="Você (Profissional)">Profissional 1</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Lado Direito: Calendário de Horários */}
                                    <div className="modal-calendar-col">
                                        <div className="calendar-header">
                                            <h3>{novoProfissional} - {novoServico}</h3>
                                            <p>Selecione um horário disponível</p>
                                        </div>
                                        
                                        <div className="date-selector-wrapper">
                                            <input 
                                                type="date" 
                                                value={novaData} 
                                                onChange={(e) => {
                                                    setNovaData(e.target.value);
                                                    setNovoHorario(''); // Reset time when changing date
                                                }} 
                                                min={new Date().toISOString().split('T')[0]} 
                                                required 
                                            />
                                        </div>

                                        <div className="time-slots-grid">
                                            {horariosDisponiveis.length > 0 ? (
                                                horariosDisponiveis.map(horario => {
                                                    const isSelected = novoHorario === horario;
                                                    
                                                    return (
                                                        <div 
                                                            key={horario}
                                                            className={`time-slot ${isSelected ? 'slot-selected' : ''}`}
                                                            onClick={() => setNovoHorario(horario)}
                                                        >
                                                            {horario}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666', border: '1px dashed #ccc', borderRadius: '4px'}}>
                                                    Nenhum horário disponível para esta data e profissional.
                                                </div>
                                            )}
                                        </div>
                                        {novoHorario && (
                                            <p style={{marginTop: '15px', fontSize: '0.9rem', color: '#2e7d32', fontWeight: '500'}}>
                                                ✓ Horário {novoHorario} selecionado.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                    <button 
                                        type="submit" 
                                        className="btn-primary" 
                                        style={{marginTop: 0, width: 'auto', padding: '10px 20px', backgroundColor: '#000', color: '#fff', opacity: !novoHorario ? 0.5 : 1}}
                                        disabled={!novoHorario}
                                    >
                                        Confirmar Agendamento
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PainelCliente;
