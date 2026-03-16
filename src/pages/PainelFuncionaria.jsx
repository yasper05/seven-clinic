import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';

const PainelFuncionaria = () => {
    const navigate = useNavigate();
    const { agendamentos, concluirAgendamento } = useContext(AgendamentoContext);

    // View states
    const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal state for viewing appointment details
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const nomeProfissional = 'Você (Profissional)';

    // Array de horários da clínica
    const horariosTrabalho = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
        "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

    // Helper functions for dates
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

    const changeDate = (amount) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(newDate.getDate() + amount);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
        else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + amount);
        setCurrentDate(newDate);
    };

    const goToToday = () => setCurrentDate(new Date());

    const handleAgendamentoClick = (agendamento) => {
        setSelectedAgendamento(agendamento);
        setIsModalOpen(true);
    };

    const handleConcluir = (id) => {
        if(window.confirm('Marcar este atendimento como concluído?')) {
            concluirAgendamento(id);
            setIsModalOpen(false);
        }
    };

    // Filter appointments for the professional
    const meusAgendamentos = agendamentos.filter(ag => ag.status === 'pendente' && ag.profissional === nomeProfissional);

    // RENDER: DAY VIEW
    const renderDayView = () => {
        const dateStr = formatDate(currentDate);
        const agendamentosHoje = meusAgendamentos.filter(ag => ag.data === dateStr);

        return (
            <div className="daily-calendar-wrapper">
                {horariosTrabalho.map(horario => {
                    const agendamentoNesteHorario = agendamentosHoje.find(ag => ag.horario === horario);
                    return (
                        <div key={horario} className="calendar-time-row">
                            <div className="time-label">{horario}</div>
                            <div className="time-slot-content">
                                <div className="time-slot-divider"></div>
                                {agendamentoNesteHorario && (
                                    <div className="calendar-event-card" onClick={() => handleAgendamentoClick(agendamentoNesteHorario)}>
                                        <div className="event-title">{agendamentoNesteHorario.cliente}</div>
                                        <div className="event-desc">{agendamentoNesteHorario.servico}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // RENDER: WEEK VIEW
    const renderWeekView = () => {
        const startOfWeek = getStartOfWeek(currentDate);
        const weekDays = Array.from({length: 7}, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return d;
        });

        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        return (
            <div className="weekly-calendar-wrapper">
                <div className="week-header">
                    <div className="time-spacer"></div>
                    {weekDays.map((day, i) => (
                        <div key={i} className={`day-header ${formatDate(day) === formatDate(new Date()) ? 'today' : ''}`}>
                            <div className="day-name">{dayNames[i]}</div>
                            <div className="day-number">{day.getDate()}</div>
                        </div>
                    ))}
                </div>
                <div className="week-body">
                    {horariosTrabalho.map(horario => (
                        <div key={horario} className="week-time-row">
                            <div className="time-label">{horario}</div>
                            {weekDays.map((day, i) => {
                                const dateStr = formatDate(day);
                                const event = meusAgendamentos.find(ag => ag.data === dateStr && ag.horario === horario);
                                return (
                                    <div key={i} className="week-day-cell">
                                        <div className="time-slot-divider"></div>
                                        {event && (
                                            <div className="calendar-event-card mini" onClick={() => handleAgendamentoClick(event)}>
                                                <div className="event-title">{event.cliente.split(' ')[0]}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // RENDER: MONTH VIEW
    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const blanks = Array.from({length: firstDayOfMonth}, (_, i) => <div key={`blank-${i}`} className="month-cell empty"></div>);
        const days = Array.from({length: daysInMonth}, (_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDate(new Date(year, month, dayNum));
            const eventsToday = meusAgendamentos.filter(ag => ag.data === dateStr);
            const isToday = dateStr === formatDate(new Date());

            return (
                <div key={dayNum} className={`month-cell ${isToday ? 'today' : ''}`} onClick={() => {
                    setCurrentDate(new Date(year, month, dayNum));
                    setViewMode('day');
                }}>
                    <div className="month-day-number">{dayNum}</div>
                    <div className="month-events">
                        {eventsToday.length > 0 && (
                            <div className="month-event-pill">
                                {eventsToday.length} agendamento{eventsToday.length > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
            );
        });

        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        return (
            <div className="monthly-calendar-wrapper">
                <div className="month-header-row">
                    {dayNames.map(d => <div key={d} className="month-day-name">{d}</div>)}
                </div>
                <div className="month-grid">
                    {blanks}
                    {days}
                </div>
            </div>
        );
    };

    // Header Display logic
    const getHeaderLabel = () => {
        if (viewMode === 'day') {
            return currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        } else if (viewMode === 'week') {
            const start = getStartOfWeek(currentDate);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            return `${start.getDate()} a ${end.getDate()} de ${start.toLocaleDateString('pt-BR', { month: 'short' })}`;
        } else {
            return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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
                        <li className="active"><a href="#">Agenda</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/meus-clientes'); }}>Meus Clientes</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/perfil-funcionaria'); }}>Perfil Profissional</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sair</a></li>
                    </ul>
                </nav>
            </aside>
            
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Olá, Profissional!</h1>
                    <p>Aqui está a sua agenda de trabalho.</p>
                </header>

                <section className="dashboard-schedule">
                    {/* CALENDAR CONTROLS */}
                    <div className="calendar-controls">
                        <div className="control-group nav-group">
                            <button className="btn-icon" onClick={() => changeDate(-1)}>&#8592;</button>
                            <button className="btn-today" onClick={goToToday}>Hoje</button>
                            <button className="btn-icon" onClick={() => changeDate(1)}>&#8594;</button>
                            <h2 style={{marginLeft: '15px', textTransform: 'capitalize', fontSize: '1.2rem', fontWeight: '500'}}>{getHeaderLabel()}</h2>
                        </div>
                        <div className="control-group view-group">
                            <button className={`view-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Dia</button>
                            <button className={`view-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Semana</button>
                            <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Mês</button>
                        </div>
                    </div>

                    {/* DYNAMIC RENDERING OF VIEWS */}
                    {viewMode === 'day' && renderDayView()}
                    {viewMode === 'week' && renderWeekView()}
                    {viewMode === 'month' && renderMonthView()}

                </section>

                {/* EVENT DETAILS MODAL */}
                {isModalOpen && selectedAgendamento && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 style={{fontSize: '1.4rem', marginBottom: '5px'}}>Detalhes do Agendamento</h2>
                            <p style={{color: '#666', marginBottom: '25px'}}>Confira os dados e gerencie o serviço.</p>

                            <div className="event-details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Cliente:</span>
                                    <span className="detail-value">{selectedAgendamento.cliente}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Serviço:</span>
                                    <span className="detail-value">{selectedAgendamento.servico}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Data e Hora:</span>
                                    <span className="detail-value">{new Date(`${selectedAgendamento.data}T12:00:00`).toLocaleDateString('pt-BR')} às {selectedAgendamento.horario}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Status:</span>
                                    <span className="status-badge" style={{display: 'inline-block'}}>{selectedAgendamento.status}</span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Fechar</button>
                                <button type="button" className="btn-success" onClick={() => handleConcluir(selectedAgendamento.id)}>Concluir Atendimento</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PainelFuncionaria;
