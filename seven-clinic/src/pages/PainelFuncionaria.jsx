import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';

const PainelFuncionaria = () => {
    const navigate = useNavigate();
    const { agendamentos, concluirAgendamento, adicionarAgendamento } = useContext(AgendamentoContext);

    // View states
    const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal state for viewing appointment details
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal state for adding new appointment/block
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBloqueio, setIsBloqueio] = useState(false);
    const [novoCliente, setNovoCliente] = useState('');
    const [novoServico, setNovoServico] = useState('');
    const [novoTituloBloqueio, setNovoTituloBloqueio] = useState('');
    const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
    const [novoHorario, setNovoHorario] = useState('09:00');

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

    const handleAddSubmit = (e) => {
        e.preventDefault();
        
        const novoAgendamentoObj = {
            cliente: isBloqueio ? 'Compromisso Pessoal' : novoCliente,
            servico: isBloqueio ? (novoTituloBloqueio || 'Bloqueio de Agenda') : novoServico,
            data: novaData,
            horario: novoHorario,
            profissional: nomeProfissional,
            isBloqueio: isBloqueio // Flag indicando que é um bloqueio
        };
        
        adicionarAgendamento(novoAgendamentoObj);
        setIsAddModalOpen(false);
        
        // Form reset
        setIsBloqueio(false);
        setNovoCliente('');
        setNovoServico('');
        setNovoTituloBloqueio('');
        setNovaData(new Date().toISOString().split('T')[0]);
        setNovoHorario('09:00');
    };

    // Filter appointments for the professional
    const meusAgendamentos = agendamentos.filter(ag => ag.status === 'pendente' && ag.profissional === nomeProfissional);

    // RENDER: DAY VIEW AS CARDS (NOVO DESIGN BASEADO NA IMAGEM MAIS RECENTE)
    const renderDayView = () => {
        const dateStr = formatDate(currentDate);
        const agendamentosHoje = meusAgendamentos.filter(ag => ag.data === dateStr);

        // Sort by time
        agendamentosHoje.sort((a, b) => a.horario.localeCompare(b.horario));

        return (
            <div className="daily-cards-wrapper">
                {agendamentosHoje.length === 0 ? (
                    <div className="empty-day-message">Nenhum agendamento para este dia.</div>
                ) : (
                    <div className="daily-cards-list">
                        {agendamentosHoje.map((evento, idx) => {
                            const isBlock = evento.isBloqueio;
                            return (
                                <div key={idx} className={`daily-event-card-standalone ${isBlock ? 'mock-gray' : ''}`} onClick={() => handleAgendamentoClick(evento)}>
                                    <div className="card-time">{evento.horario}</div>
                                    <div className="card-content-black" style={isBlock ? {backgroundColor: '#f1f3f4', color: '#3c4043', border: '1px solid #dadce0'} : {}}>
                                        <div className="card-title">{isBlock ? evento.servico : evento.cliente.split(' ')[0]}</div>
                                        {!isBlock && <div className="card-subtitle">{evento.servico}</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // RENDER: WEEK VIEW AS TIME GRID (NOVO DESIGN "GOOGLE CALENDAR" BASEADO NA ÚLTIMA IMAGEM)
    const renderWeekView = () => {
        const startOfWeek = getStartOfWeek(currentDate);
        const weekDays = Array.from({length: 7}, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return d;
        });

        const dayNames = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
        const gridHours = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

        // Função auxiliar para calcular o TOP e HEIGHT (simulado) com base na string de horário (ex: "09:00")
        // No grid CSS real que vamos fazer, cada hora pode ter 60px de altura pra facilitar (começando do "06:00").
        // Ex: 08:00 -> offset de 2 horas desde as 06:00 -> top: 2 * 60 = 120px.
        const getEventStyle = (startTimeStr, durationHours = 1) => {
            if(!startTimeStr) return {top: '0px', height: '60px'};
            const [h, m] = startTimeStr.split(':').map(Number);
            const hourOffset = h - 6; // base 06:00
            const minuteOffset = m / 60;
            const topPx = (hourOffset + minuteOffset) * 60; // 60px per hour
            const heightPx = durationHours * 60;
            return {
                top: `${topPx}px`,
                height: `${heightPx}px`,
            };
        };

        // Cores fixas tiradas da imagem de inspiração
        const classColors = ['bg-orange', 'bg-blue', 'bg-purple', 'bg-green'];

        return (
            <div className="google-week-calendar">
                {/* Header dos dias */}
                <div className="google-week-header">
                    <div className="time-gutter-header">GMT</div>
                    <div className="days-header-row">
                        {weekDays.map((day, i) => (
                            <div key={i} className="day-header-cell">
                                <div className="day-name">{dayNames[i]}</div>
                                <div className={`day-number ${formatDate(day) === formatDate(new Date()) ? 'today-highlight' : ''}`}>
                                    {String(day.getDate())}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Corpo do Calendário: Grid + Colunas */}
                <div className="google-week-body">
                    <div className="time-gutter">
                        {gridHours.map(hour => (
                            <div key={hour} className="time-label-cell">{hour}</div>
                        ))}
                    </div>

                    <div className="grid-columns-container">
                        {/* Linhas horizontais do background */}
                        <div className="grid-bg">
                            {gridHours.map(hour => (
                                <div key={hour} className="grid-bg-row"></div>
                            ))}
                        </div>

                        {/* Colunas verticais com eventos */}
                        <div className="day-columns">
                            {weekDays.map((day, i) => {
                                const dateStr = formatDate(day);
                                const eventsToday = meusAgendamentos.filter(ag => ag.data === dateStr);

                                return (
                                    <div key={i} className="day-column">

                                        {/* Mockup de "Almoço" apenas em alguns dias (ex: Domingo, Sexta, Sabado) simulando 12h as 13h */}
                                        {(i === 0 || i === 5 || i === 6) && (
                                            <div className="google-event-card mock-gray" style={getEventStyle("12:00", 1)}>
                                                <div className="ev-title">Almoço</div>
                                                <div className="ev-time">12p - 1p</div>
                                            </div>
                                        )}

                                        {/* Agendamentos reais ou bloqueios flutuando na coluna de tempo */}
                                        {eventsToday.map((event, idx) => {
                                            const isBlock = event.isBloqueio;
                                            const bgColorClass = isBlock ? 'mock-gray' : classColors[idx % classColors.length];
                                            return (
                                                <div 
                                                    key={`ev-${idx}`} 
                                                    className={`google-event-card ${bgColorClass}`} 
                                                    style={getEventStyle(event.horario, 1.5)} // todos simulando 1h30m de duração
                                                    onClick={() => handleAgendamentoClick(event)}
                                                >
                                                    <div className="ev-title">
                                                        {isBlock ? event.servico : `${event.cliente.split(' ')[0]} : ${event.servico.substring(0, 8)}`}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
                <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <h1>Olá, Profissional!</h1>
                        <p>Aqui está a sua agenda de trabalho.</p>
                    </div>
                    <button className="btn-primary" style={{width: 'auto', marginTop: 0, padding: '12px 24px'}} onClick={() => {
                        setIsBloqueio(false);
                        setIsAddModalOpen(true);
                    }}>
                        + Novo Agendamento
                    </button>
                </header>

                <section className="dashboard-schedule">
                    {/* CALENDAR CONTROLS NOVO DESIGN */}
                    <div className="calendar-controls new-calendar-controls">
                        <div className="control-group-left">
                            <button className="btn-today" onClick={goToToday}>Hoje</button>
                            <button className="btn-icon" onClick={() => changeDate(-1)}>&#8592;</button>
                            <button className="btn-icon" onClick={() => changeDate(1)}>&#8594;</button>
                            <div className="date-display">
                                {getHeaderLabel()} <span className="arrow-down">&#8964;</span>
                            </div>
                        </div>
                        <div className="control-group-right">
                            <div className="select-wrapper">
                                <select className="select-view" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                                    <option value="day">Dia</option>
                                    <option value="week">Semana</option>
                                    <option value="month">Mês</option>
                                </select>
                            </div>
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

                {/* ADD EVENT MODAL */}
                {isAddModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 style={{fontSize: '1.4rem', marginBottom: '5px'}}>
                                {isBloqueio ? 'Bloquear Horário' : 'Novo Agendamento'}
                            </h2>
                            <p style={{color: '#666', marginBottom: '15px'}}>
                                {isBloqueio ? 'Marque um compromisso ou bloqueie a agenda.' : 'Adicione um novo horário de cliente.'}
                            </p>

                            <div style={{marginBottom: '20px'}}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isBloqueio} 
                                        onChange={(e) => setIsBloqueio(e.target.checked)} 
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <strong>Este é apenas um compromisso/bloqueio (Sem cliente)</strong>
                                </label>
                            </div>

                            <form className="form-agendamento" onSubmit={handleAddSubmit}>
                                {!isBloqueio ? (
                                    <>
                                        <div className="input-group">
                                            <label>Nome do Cliente</label>
                                            <input type="text" value={novoCliente} onChange={(e) => setNovoCliente(e.target.value)} required placeholder="Ex: Maria" />
                                        </div>
                                        <div className="input-group">
                                            <label>Serviço</label>
                                            <input type="text" value={novoServico} onChange={(e) => setNovoServico(e.target.value)} required placeholder="Ex: Design de Sobrancelha" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="input-group">
                                        <label>Título do Compromisso (Opcional)</label>
                                        <input type="text" value={novoTituloBloqueio} onChange={(e) => setNovoTituloBloqueio(e.target.value)} placeholder="Ex: Reunião, Almoço, Médico..." />
                                    </div>
                                )}
                                
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
                                    <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
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

export default PainelFuncionaria;
