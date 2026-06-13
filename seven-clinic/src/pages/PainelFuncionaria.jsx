import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';
import api from '../api';
import { SERVICOS_POR_PROFISSIONAL } from '../data/servicos';

const getMinDate = () => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    if (currentMins >= 1110) {
        now.setDate(now.getDate() + 1);
    }
    
    if (now.getDay() === 0) {
        now.setDate(now.getDate() + 1);
    }
    
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const PainelFuncionaria = () => {
    const navigate = useNavigate();
    const { agendamentos, concluirAgendamento, adicionarAgendamento, buscarAgendamentos, cancelarAgendamento, naoCompareceuAgendamento, confirmarAgendamento, sugerirAgendamento, recusarAgendamento } = useContext(AgendamentoContext);

    useEffect(() => {
        buscarAgendamentos();
        api.get('/api/clientes')
           .then(res => setClientes(res.data.sort((a, b) => a.nome.localeCompare(b.nome))))
           .catch(err => console.error("Erro ao carregar clientes", err));
    }, []);

    // View states
    const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal state for viewing appointment details
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal state for adding new appointment/block
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConcluirModalOpen, setIsConcluirModalOpen] = useState(false);
    const [isConfirmarModalOpen, setIsConfirmarModalOpen] = useState(false);
    const [dadosConfirmacao, setDadosConfirmacao] = useState({ data: '', horario: '' });
    const [observacoes, setObservacoes] = useState('');
    const [notaCliente, setNotaCliente] = useState(5);
    const [filtroDia, setFiltroDia] = useState('');
    const [filtroMes, setFiltroMes] = useState('');
    const [menuAberto, setMenuAberto] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [isBloqueio, setIsBloqueio] = useState(false);
    const [novoCliente, setNovoCliente] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [novoServico, setNovoServico] = useState('');
    const [isManutencao, setIsManutencao] = useState(false);
    const [novoTituloBloqueio, setNovoTituloBloqueio] = useState('');
    const [novaData, setNovaData] = useState(getMinDate());
    const [novoHorario, setNovoHorario] = useState('09:00');
    const [novoHorarioRetorno, setNovoHorarioRetorno] = useState('10:00');

    const userLogado = JSON.parse(localStorage.getItem('userLogado') || sessionStorage.getItem('userLogado') || '{}');
    const nomeProfissional = userLogado.nome || 'Você (Profissional)';

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

    const canConcluir = () => {
        if (!selectedAgendamento) return false;
        const agendamentoDate = new Date(`${selectedAgendamento.data}T${selectedAgendamento.horario}:00`);
        return new Date() >= agendamentoDate;
    };

    const handleConcluir = (id) => {
        setIsConcluirModalOpen(true);
    };

    const submitConcluir = (e) => {
        e.preventDefault();
        concluirAgendamento(selectedAgendamento.id, { observacoes, nota_cliente: notaCliente });
        setIsConcluirModalOpen(false);
        setIsModalOpen(false);
        setObservacoes('');
        setNotaCliente(5);
    };

    const handleCancelarProf = (id) => {
        if(window.confirm('Tem certeza que deseja CANCELAR este agendamento? Uma mensagem de WhatsApp será enviada à cliente.')) {
            cancelarAgendamento(id, 'Clínica');
            setIsModalOpen(false);
        }
    };

    const handleNaoCompareceu = (id) => {
        if(window.confirm('Registrar que a cliente não compareceu? Uma taxa de cancelamento de R$ 50 será adicionada à conta dela.')) {
            naoCompareceuAgendamento(id);
            setIsModalOpen(false);
        }
    };

    const handleConfirmarClick = () => {
        setDadosConfirmacao({ data: selectedAgendamento.data, horario: selectedAgendamento.horario });
        setIsConfirmarModalOpen(true);
    };

    const submitConfirmar = async (e) => {
        e.preventDefault();
        
        const mudouHorario = dadosConfirmacao.data !== selectedAgendamento.data || dadosConfirmacao.horario !== selectedAgendamento.horario;

        let res;
        if (mudouHorario) {
            res = await sugerirAgendamento(selectedAgendamento.id, { 
                nova_data: dadosConfirmacao.data, 
                novo_horario: dadosConfirmacao.horario 
            });
            if (!res?.error) {
                alert('O novo horário foi enviado como sugestão para a cliente. O agendamento aguardará o aceite dela.');
            }
        } else {
            res = await confirmarAgendamento(selectedAgendamento.id, { 
                nova_data: dadosConfirmacao.data, 
                novo_horario: dadosConfirmacao.horario 
            });
        }

        if (res && res.error) {
            alert(res.error);
        } else {
            setIsConfirmarModalOpen(false);
            setIsModalOpen(false);
        }
    };

    const handleRecusar = (id) => {
        if(window.confirm('Tem certeza que deseja RECUSAR esta solicitação de agendamento? Uma mensagem de WhatsApp será enviada à cliente.')) {
            recusarAgendamento(id);
            setIsModalOpen(false);
        }
    };

    const profissionalData = SERVICOS_POR_PROFISSIONAL[nomeProfissional];
    const categorias = profissionalData ? profissionalData.categorias : {};
    
    const servicosDisponiveis = [];
    Object.keys(categorias).forEach(cat => {
        categorias[cat].forEach(serv => {
            servicosDisponiveis.push({ ...serv, categoria: cat });
        });
    });

    const servicoObj = servicosDisponiveis.find(s => s.nome === novoServico);

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
        
        let duracaoMinutos = 30; // default for appointments or simple blocks
        let valorFinal = 0;
        let finalServicoTexto = novoServico;
        
        if (isBloqueio && novoHorario && novoHorarioRetorno) {
            const [h1, m1] = novoHorario.split(':').map(Number);
            const [h2, m2] = novoHorarioRetorno.split(':').map(Number);
            const start = h1 * 60 + m1;
            const end = h2 * 60 + m2;
            
            if (end > start) {
                duracaoMinutos = end - start;
            } else {
                alert("O horário de retorno deve ser maior que o horário de saída!");
                return;
            }
        } else if (!isBloqueio) {
            if (servicoObj) {
                duracaoMinutos = servicoObj.duracao;
                valorFinal = servicoObj.preco || 0;
                if (isManutencao && servicoObj.permiteManutencao) {
                    valorFinal = Math.max(0, valorFinal - 90);
                    finalServicoTexto += ' (Manutenção)';
                }
            } else if (!servicosDisponiveis.length) {
                // Caso não haja lista (profissional não mapeado), aceita o que foi digitado
            }
        }
        
        const novoAgendamentoObj = {
            cliente: isBloqueio ? 'Compromisso Pessoal' : novoCliente,
            servico: isBloqueio ? (novoTituloBloqueio || 'Bloqueio de Agenda') : finalServicoTexto,
            data: novaData,
            horario: novoHorario,
            duracao: duracaoMinutos,
            valor: valorFinal,
            isManutencao: isManutencao ? 1 : 0,
            profissional: nomeProfissional,
            isBloqueio: isBloqueio // Flag indicando que é um bloqueio
        };
        
        adicionarAgendamento(novoAgendamentoObj);
        setIsAddModalOpen(false);
        
        // Form reset
        setIsBloqueio(false);
        setNovoCliente('');
        setNovoServico('');
        setIsManutencao(false);
        setNovoTituloBloqueio('');
        setNovaData(getMinDate());
        setNovoHorario('09:00');
        setNovoHorarioRetorno('10:00');
    };

    // Filter appointments for the professional
    const meusAgendamentos = agendamentos.filter(ag => (ag.status === 'pendente' || ag.status === 'confirmado') && ag.profissional === nomeProfissional);

    const filteredClientes = novoCliente ? clientes.filter(c => c.nome.toLowerCase().includes(novoCliente.toLowerCase())) : clientes;

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
                            const durMin = evento.duracao || 60;
                            const [hh, mm] = evento.horario.split(':').map(Number);
                            const endMin = hh * 60 + mm + durMin;
                            const endStr = `${String(Math.floor(endMin / 60)).padStart(2,'0')}:${String(endMin % 60).padStart(2,'0')}`;
                            return (
                                <div key={idx} className={`daily-event-card-standalone ${isBlock ? 'mock-gray' : ''}`} onClick={() => handleAgendamentoClick(evento)}>
                                    <div className="card-time">{evento.horario}<br/><span style={{fontSize:'0.7rem',opacity:0.7}}>{endStr}</span></div>
                                    <div className="card-content-black" style={isBlock ? {backgroundColor: '#f1f3f4', color: '#3c4043', border: '1px solid #dadce0'} : {}}>
                                        <div className="card-title">
                                            {isBlock ? evento.servico : evento.cliente.split(' ')[0]}
                                            {!isBlock && evento.status === 'pendente' && (
                                                <span style={{marginLeft: '6px', fontSize: '0.65rem', background: '#f39c12', color: '#fff', padding: '2px 6px', borderRadius: '4px'}}>AGUARDANDO</span>
                                            )}
                                        </div>
                                        {!isBlock && <div className="card-subtitle">{evento.servico}</div>}
                                        <div style={{fontSize:'0.72rem',marginTop:'4px',opacity:0.7}}>⏱ {durMin} min</div>
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

        // getEventStyle: usa duração real em MINUTOS (campo duracao do banco)
        // Cada hora ocupa 60px no grid. Base: 06:00.
        const getEventStyle = (startTimeStr, duracaoMinutos = 60) => {
            if (!startTimeStr) return { top: '0px', height: '60px' };
            const [h, m] = startTimeStr.split(':').map(Number);
            const hourOffset = h - 6; // base 06:00
            const minuteOffset = m / 60;
            const topPx = (hourOffset + minuteOffset) * 60; // 60px por hora
            const heightPx = Math.max(30, (duracaoMinutos / 60) * 60); // mínimo 30px
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
                                            const durMin = event.duracao || 60;
                                            const [hh, mm] = event.horario.split(':').map(Number);
                                            const endMin = hh * 60 + mm + durMin;
                                            const endStr = `${String(Math.floor(endMin / 60)).padStart(2,'0')}:${String(endMin % 60).padStart(2,'0')}`;
                                            return (
                                                <div 
                                                    key={`ev-${idx}`} 
                                                    className={`google-event-card ${bgColorClass}`} 
                                                    style={getEventStyle(event.horario, durMin)}
                                                    onClick={() => handleAgendamentoClick(event)}
                                                >
                                                    <div className="ev-title">
                                                        {isBlock ? event.servico : `${event.cliente.split(' ')[0]}`}
                                                        {!isBlock && event.status === 'pendente' && (
                                                            <div style={{fontSize: '0.65rem', background: '#f39c12', color: '#fff', padding: '1px 4px', borderRadius: '3px', display: 'inline-block', marginTop: '2px'}}>Aguardando</div>
                                                        )}
                                                    </div>
                                                    <div className="ev-time" style={{fontSize:'0.7rem',opacity:0.8}}>
                                                        {event.horario}–{endStr}
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
                    <button className="menu-hamburger dash-ham" onClick={() => setMenuAberto(!menuAberto)} aria-label="Menu">
                        <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                        <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                        <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                    </button>
                </div>
                <nav className={`sidebar-nav ${menuAberto ? 'menu-open' : ''}`}>
                    <ul>
                        <li className="active"><a href="#" onClick={() => setMenuAberto(false)}>Agenda do Dia</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setMenuAberto(false); navigate('/dashboard-funcionaria'); }}>Painel de Controle</a></li>
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
                <header className="dashboard-header colored-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <h1>Olá, {userLogado.nome ? userLogado.nome.split(' ')[0] : 'Profissional'}!</h1>
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
                                    <span className="status-badge" style={{display: 'inline-block'}}>
                                        {selectedAgendamento.status === 'pendente' ? 'Aguardando Confirmação' : selectedAgendamento.status === 'confirmado' ? 'Confirmado' : selectedAgendamento.status === 'sugerido' ? 'Sugerido (Aguardando Cliente)' : selectedAgendamento.status}
                                        {selectedAgendamento.status === 'cancelado' && selectedAgendamento.cancelado_por && ` (pela ${selectedAgendamento.cancelado_por})`}
                                        {selectedAgendamento.status === 'recusado' && selectedAgendamento.cancelado_por && ` (pela ${selectedAgendamento.cancelado_por})`}
                                    </span>
                                </div>
                                {selectedAgendamento.observacoes && (
                                    <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                                        <span className="detail-label">Observações:</span>
                                        <p style={{ marginTop: '5px', padding: '10px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem', color: '#444' }}>
                                            {selectedAgendamento.observacoes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Fechar</button>
                                {selectedAgendamento.status === 'pendente' && (
                                    <>
                                        <button type="button" className="btn-secondary" style={{ borderColor: '#e74c3c', color: '#e74c3c', opacity: canConcluir() ? 0.5 : 1, cursor: canConcluir() ? 'not-allowed' : 'pointer' }} onClick={() => {
                                            if (canConcluir()) { alert('Não é possível recusar um agendamento cujo horário já passou.'); return; }
                                            handleRecusar(selectedAgendamento.id);
                                        }}>Recusar Solicitação</button>
                                        <button type="button" className="btn-success" style={{ opacity: canConcluir() ? 0.5 : 1, cursor: canConcluir() ? 'not-allowed' : 'pointer' }} onClick={() => {
                                            if (canConcluir()) { alert('Não é possível aceitar um agendamento cujo horário já passou.'); return; }
                                            handleConfirmarClick();
                                        }}>Confirmar Agendamento</button>
                                    </>
                                )}
                                {selectedAgendamento.status === 'sugerido' && (
                                    <>
                                        <button type="button" className="btn-secondary" style={{ borderColor: '#e74c3c', color: '#e74c3c', opacity: canConcluir() ? 0.5 : 1, cursor: canConcluir() ? 'not-allowed' : 'pointer' }} onClick={() => {
                                            if (canConcluir()) { alert('Não é possível cancelar um agendamento cujo horário já passou.'); return; }
                                            handleCancelarProf(selectedAgendamento.id);
                                        }}>Cancelar Sugestão</button>
                                    </>
                                )}
                                {selectedAgendamento.status === 'confirmado' && (
                                    <>
                                        <button type="button" className="btn-secondary" style={{ borderColor: '#e74c3c', color: '#e74c3c', opacity: canConcluir() ? 0.5 : 1, cursor: canConcluir() ? 'not-allowed' : 'pointer' }} onClick={() => {
                                            if (canConcluir()) { alert('Não é possível cancelar um agendamento cujo horário já passou.'); return; }
                                            handleCancelarProf(selectedAgendamento.id);
                                        }}>Cancelar Agendamento</button>
                                        <button type="button" className="btn-secondary" style={{ borderColor: '#f39c12', color: '#f39c12' }} onClick={() => handleNaoCompareceu(selectedAgendamento.id)}>Não Compareceu</button>
                                        <button 
                                            type="button" 
                                            className="btn-success" 
                                            onClick={() => {
                                                if (!canConcluir()) {
                                                    alert('Este agendamento ainda não pode ser concluído. Você deve aguardar até o horário de início (' + selectedAgendamento.horario + ').');
                                                    return;
                                                }
                                                handleConcluir(selectedAgendamento.id);
                                            }}
                                            style={{ 
                                                opacity: canConcluir() ? 1 : 0.5, 
                                                cursor: canConcluir() ? 'pointer' : 'not-allowed' 
                                            }}
                                            title={canConcluir() ? '' : 'O agendamento só pode ser concluído após o horário de início do serviço.'}
                                        >
                                            Concluir Atendimento
                                        </button>
                                    </>
                                )}
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
                                        <div className="input-group" style={{ position: 'relative' }}>
                                            <label>Nome do Cliente</label>
                                            <input 
                                                type="text" 
                                                value={novoCliente} 
                                                onChange={(e) => {
                                                    setNovoCliente(e.target.value);
                                                    setShowSuggestions(true);
                                                }} 
                                                onFocus={() => setShowSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                required 
                                                placeholder="Ex: Maria" 
                                                autoComplete="off"
                                            />
                                            {showSuggestions && filteredClientes.length > 0 && (
                                                <ul style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    maxHeight: '150px',
                                                    overflowY: 'auto',
                                                    zIndex: 1000,
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                    listStyle: 'none',
                                                    padding: 0,
                                                    margin: '4px 0 0 0'
                                                }}>
                                                    {filteredClientes.map(c => (
                                                        <li 
                                                            key={c.id} 
                                                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', color: '#333' }}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setNovoCliente(c.nome);
                                                                setShowSuggestions(false);
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                        >
                                                            {c.nome}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
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
                                    </>
                                ) : (
                                    <div className="input-group">
                                        <label>Título do Compromisso (Opcional)</label>
                                        <input type="text" value={novoTituloBloqueio} onChange={(e) => setNovoTituloBloqueio(e.target.value)} placeholder="Ex: Reunião, Almoço, Médico..." />
                                    </div>
                                )}
                                
                                <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                                    <div className="input-group" style={{flex: 1, minWidth: '120px'}}>
                                        <label>Data</label>
                                        <input 
                                            type="date" 
                                            value={novaData} 
                                            min={getMinDate()}
                                            onChange={(e) => {
                                                const today = getMinDate();
                                                let selected = e.target.value;
                                                if (selected && selected < today) {
                                                    selected = today;
                                                }
                                                if (selected) {
                                                    const dt = new Date(`${selected}T12:00:00`);
                                                    if (dt.getDay() === 0) {
                                                        alert('A clínica não funciona aos domingos. Por favor, escolha outro dia.');
                                                        e.target.value = novaData;
                                                        return;
                                                    }
                                                }
                                                setNovaData(selected);
                                            }} 
                                            required 
                                        />
                                    </div>
                                    <div className="input-group" style={{flex: 1, minWidth: '120px'}}>
                                        <label>{isBloqueio ? 'Horário de Saída' : 'Horário'}</label>
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
                                    {isBloqueio && (
                                        <div className="input-group" style={{flex: 1, minWidth: '120px'}}>
                                            <label>Horário de Retorno</label>
                                            <input type="time" value={novoHorarioRetorno} min="08:00" max="19:00" onChange={(e) => {
                                                const val = e.target.value;
                                                if (val) {
                                                    const [h, m] = val.split(':').map(Number);
                                                    const mins = h * 60 + m;
                                                    if (mins < 480 || mins > 1140) {
                                                        alert('O horário de retorno deve estar dentro do horário de funcionamento (08:00 às 19:00).');
                                                        return;
                                                    }
                                                }
                                                setNovoHorarioRetorno(val);
                                            }} required />
                                        </div>
                                    )}
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn-success">Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DE FINALIZAR ATENDIMENTO */}
                {isConcluirModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{maxWidth: '500px'}}>
                            <h2>Finalizar Atendimento</h2>
                            <p style={{color: '#666', marginBottom: '15px'}}>Preencha as observações e avalie o cliente.</p>
                            
                            <form onSubmit={submitConcluir} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                <div className="input-group">
                                    <label>Observações do Atendimento (Ficha/Anamnese)</label>
                                    <textarea 
                                        value={observacoes} 
                                        onChange={(e) => setObservacoes(e.target.value)} 
                                        rows="4" 
                                        placeholder="Anote detalhes do procedimento, produtos usados, comportamento do cliente..." 
                                        required 
                                        style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical', fontFamily: 'inherit'}}
                                    ></textarea>
                                </div>
                                <div className="input-group">
                                    <label>Avaliação do Cliente</label>
                                    <div style={{display: 'flex', gap: '10px', fontSize: '1.8rem', cursor: 'pointer'}}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span 
                                                key={star} 
                                                onClick={() => setNotaCliente(star)} 
                                                style={{color: star <= notaCliente ? '#f1c40f' : '#ccc'}}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p style={{fontSize: '0.8rem', color: '#666', marginTop: '5px'}}>{notaCliente} Estrelas</p>
                                </div>
                                <div className="modal-actions" style={{marginTop: '10px'}}>
                                    <button type="button" className="btn-secondary" onClick={() => setIsConcluirModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn-success">Salvar e Concluir</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isConfirmarModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '400px' }}>
                            <div className="modal-header">
                                <h2>Confirmar Agendamento</h2>
                                <button className="modal-close" onClick={() => setIsConfirmarModalOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={submitConfirmar} className="modal-form">
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                                    Revise o horário solicitado. Se desejar, você pode sugerir um novo horário para a cliente antes de confirmar.
                                </p>
                                <div className="form-group">
                                    <label>Data:</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={dadosConfirmacao.data}
                                        onChange={(e) => setDadosConfirmacao({...dadosConfirmacao, data: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Horário:</label>
                                    <input 
                                        type="time" 
                                        required 
                                        value={dadosConfirmacao.horario}
                                        onChange={(e) => setDadosConfirmacao({...dadosConfirmacao, horario: e.target.value})}
                                    />
                                </div>
                                <div className="modal-actions" style={{marginTop: '10px'}}>
                                    <button type="button" className="btn-secondary" onClick={() => setIsConfirmarModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn-success">Confirmar</button>
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
