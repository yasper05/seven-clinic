import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendamentoContext } from '../context/AgendamentoContext';

/* ─────────────────────────────────────────────────────────────────
   CATÁLOGO FIXO DE PROFISSIONAIS, SERVIÇOS E DURAÇÕES
   ───────────────────────────────────────────────────────────────── */
const PROFISSIONAIS_SERVICOS = {
    'Laura Alencar': {
        especialidade: 'Cílios',
        categorias: {
            'Cílios': [
                { nome: 'Classico',      preco: 220.0, duracao: 100, permiteManutencao: true  },
                { nome: 'Volume light',  preco: 210.0, duracao: 100, permiteManutencao: true  },
                { nome: 'Soft light',    preco: 175.0, duracao: 100, permiteManutencao: true  },
                { nome: 'wet',           preco: 240.0, duracao: 100, permiteManutencao: true  },
                { nome: 'anime',         preco: 250.0, duracao: 120, permiteManutencao: false },
                { nome: 'soft fox',      preco: 175.0, duracao: 100, permiteManutencao: true  },
                { nome: 'delineado',     preco: 240.0, duracao: 100, permiteManutencao: true  },
                { nome: 'wispy',         preco: 250.0, duracao: 100, permiteManutencao: true  },
                { nome: 'fox eyes',      preco: 230.0, duracao: 100, permiteManutencao: true  },
                { nome: 'cat eyes',      preco: 200.0, duracao: 100, permiteManutencao: true  },
            ]
        }
    },
    'Mayara Vespasiano': {
        especialidade: 'Sobrancelha, Lábios e Depilação',
        categorias: {
            'Sobrancelha': [
                { nome: 'Design personalizado', preco: 45.0,  duracao: 30  },
                { nome: 'Design + coloração',   preco: 79.0,  duracao: 45  },
                { nome: 'Design + henna',       preco: 69.0,  duracao: 45  },
                { nome: 'Light brows',          preco: 120.0, duracao: 60  },
                { nome: 'Brow lamination',      preco: 195.0, duracao: 60  },
                { nome: 'Micropigmentação',     preco: 690.0, duracao: 120 },
            ],
            'Lábios': [
                { nome: 'Lip blush',               preco: 230.0, duracao: 120 },
                { nome: 'Protocolo de hidratação', preco: 120.0, duracao: 45  },
                { nome: 'Microlabial',             preco: 690.0, duracao: 120 },
            ],
            'Adicionais': [
                { nome: 'Buço',            preco: 20.0, duracao: 15 },
                { nome: 'Epilação facial', preco: 70.0, duracao: 45 },
            ]
        }
    },
    'Ana Paula': {
        especialidade: 'Unhas',
        categorias: {
            'Aplicação': [
                { nome: 'Alongamento em Molde F1',   opcoes: { 'Natural': 190.0, 'Decorada': 220.0 }, duracao: 120 },
                { nome: 'Alongamento em Soft Gel',   opcoes: { 'Natural': 130.0, 'Decorada': 160.0 }, duracao: 90  },
                { nome: 'Banho de gel em molde F1',  opcoes: { 'Natural': 90.0,  'Decorada': 120.0 }, duracao: 90  },
                { nome: 'Blindagem estrutural',      opcoes: { 'Natural': 90.0,  'Decorada': 110.0 }, duracao: 60  },
                { nome: 'Banho de gel fiber',        opcoes: { 'Natural': 150.0, 'Decorada': 180.0 }, duracao: 90  },
            ],
            'Manutenção': [
                { nome: 'Manutenção em Molde F1',      opcoes: { 'Natural': 120.0, 'Decorada': 150.0 }, duracao: 90 },
                { nome: 'Manutenção em Soft Gel',      opcoes: { 'Natural': 100.0, 'Decorada': 130.0 }, duracao: 90 },
                { nome: 'Manutenção Blindagem fiber',  opcoes: { 'Natural': 100.0, 'Decorada': 130.0 }, duracao: 90 },
            ],
            'Demais Serviços': [
                { nome: 'Esmaltação em gel (blindagem)',     opcoes: { 'Esmaltada': 80.0, 'Decorada': 100.0 }, duracao: 60 },
                { nome: 'Reconstrução e alinhamento',       preco: 20.0,  duracao: 30 },
                { nome: 'Remoção de alongamento',           preco: 70.0,  duracao: 45 },
                { nome: 'Reposição unha quebrada',          preco: 10.0,  duracao: 20 },
                { nome: 'Remoção de esmaltação',            preco: 40.0,  duracao: 30 },
                { nome: 'Remoção de blindagem',             preco: 60.0,  duracao: 45 },
                { nome: 'Pedicure',                         opcoes: { 'Esmaltada': 80.0, 'Decorada': 100.0 }, duracao: 60 },
                { nome: 'Adicional pedraria',               preco: 10.0,  duracao: 15 },
                { nome: 'Cuticulagem com tesoura',          preco: 20.0,  duracao: 30 },
            ]
        }
    }
};

/* ─────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────── */
const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const minutesToHHMM = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

// Todos os slots possíveis das 08:00 às 19:00 em intervalos de 30 min
const ALL_SLOTS = [];
for (let m = 480; m < 19 * 60; m += 30) ALL_SLOTS.push(minutesToHHMM(m));

const formatDate = (dateStr) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

/* ─────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ───────────────────────────────────────────────────────────────── */
const PainelCliente = () => {
    const navigate = useNavigate();
    const { agendamentos, adicionarAgendamento, cancelarAgendamento } = useContext(AgendamentoContext);

    const userLogado = JSON.parse(
        localStorage.getItem('userLogado') || sessionStorage.getItem('userLogado') || '{}'
    );
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';

    /* ── Modais ── */
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [modalStep, setModalStep]       = useState('form'); // 'form' | 'sacola'

    /* ── Seleção de serviço atual ── */
    const [profissional,       setProfissional]       = useState('Laura Alencar');
    const [categoria,          setCategoria]          = useState('Cílios');
    const [servico,            setServico]            = useState(PROFISSIONAIS_SERVICOS['Laura Alencar'].categorias['Cílios'][0]);
    const [estilo,             setEstilo]             = useState('');
    const [isManutencao,       setIsManutencao]       = useState(false);
    const [data,               setData]               = useState(new Date().toISOString().split('T')[0]);
    const [horario,            setHorario]            = useState('');

    /* ── Sacola de agendamentos ── */
    const [sacola, setSacola] = useState([]);

    /* ── Slots ocupados vindos do backend ── */
    const [slotsOcupados, setSlotsOcupados] = useState([]); // [{horario, duracao}]

    /* ── Mensagens de erro/aviso ── */
    const [erroModal, setErroModal] = useState('');
    const [enviando,  setEnviando]  = useState(false);

    /* ─── Busca slots ocupados no backend ao mudar profissional ou data ─── */
    useEffect(() => {
        if (!profissional || !data) return;
        fetch(
            `/api/agendamentos/disponibilidade?profissional=${encodeURIComponent(profissional)}&data=${data}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(r => r.json())
            .then(slots => {
                if (Array.isArray(slots)) setSlotsOcupados(slots);
            })
            .catch(() => setSlotsOcupados([]));
    }, [profissional, data, token]);

    /* ─── Calcula slots bloqueados: ocupados no banco + itens da sacola da mesma profissional+data ─── */
    const calcularBloqueios = useCallback(() => {
        // Itens na sacola para esse profissional/data
        const sacolaItems = sacola
            .filter(i => i.profissional === profissional && i.data === data)
            .map(i => ({ horario: i.horario, duracao: i.duracao }));
        return [...slotsOcupados, ...sacolaItems];
    }, [slotsOcupados, sacola, profissional, data]);

    const isSlotBloqueado = useCallback((slot) => {
        const bloqueios = calcularBloqueios();
        const slotStart = toMinutes(slot);
        const duracaoAtual = servico?.duracao || 30;
        const slotEnd = slotStart + duracaoAtual;
        return bloqueios.some(b => {
            const bStart = toMinutes(b.horario);
            const bEnd   = bStart + (b.duracao || 30);
            return slotStart < bEnd && slotEnd > bStart;
        });
    }, [calcularBloqueios, servico]);

    /* ─── Calcula o slot sugerido: primeiro disponível após o término do último agendamento na data ─── */
    const calcularSlotSugerido = useCallback(() => {
        // Pega todos os itens (sacola + backend) para QUALQUER profissional na data selecionada
        const todosItensDia = [
            ...slotsOcupados,
            ...sacola
                .filter(i => i.data === data)
                .map(i => ({ horario: i.horario, duracao: i.duracao }))
        ];
        if (todosItensDia.length === 0) return null;

        // Encontra o maior horário de término entre todos os itens do dia
        const maiorFim = todosItensDia.reduce((max, item) => {
            const fim = toMinutes(item.horario) + (item.duracao || 30);
            return fim > max ? fim : max;
        }, 0);

        // Retorna o primeiro slot disponível a partir desse horário de término
        return ALL_SLOTS.find(slot => {
            const slotStart = toMinutes(slot);
            const slotEnd   = slotStart + (servico?.duracao || 30);
            if (slotStart < maiorFim) return false; // ainda dentro do bloco anterior
            // Verifica se esse slot não conflita com nada
            const bloqueios = calcularBloqueios();
            return !bloqueios.some(b => {
                const bStart = toMinutes(b.horario);
                const bEnd   = bStart + (b.duracao || 30);
                return slotStart < bEnd && slotEnd > bStart;
            });
        }) || null;
    }, [slotsOcupados, sacola, data, servico, calcularBloqueios]);

    const slotSugerido = calcularSlotSugerido();

    /* ─── Auto-seleciona o slot sugerido quando mudar profissional/data/serviço e nenhum estiver selecionado ─── */
    useEffect(() => {
        if (!horario && slotSugerido) {
            setHorario(slotSugerido);
        }
    }, [slotSugerido]); // eslint-disable-line react-hooks/exhaustive-deps


    /* ─── Preço do serviço selecionado ─── */
    const obterPreco = () => {
        if (!servico) return 0;
        let p = servico.opcoes ? (servico.opcoes[estilo] || 0) : (servico.preco || 0);
        if (profissional === 'Laura Alencar' && isManutencao) p = p * 0.70;
        return p;
    };

    /* ─── Handler: muda profissional ─── */
    const handleProfChange = (prof) => {
        setProfissional(prof);
        const cats = Object.keys(PROFISSIONAIS_SERVICOS[prof].categorias);
        const cat0 = cats[0];
        setCategoria(cat0);
        const serv0 = PROFISSIONAIS_SERVICOS[prof].categorias[cat0][0];
        setServico(serv0);
        setEstilo(serv0.opcoes ? Object.keys(serv0.opcoes)[0] : '');
        setIsManutencao(false);
        setHorario('');
        setErroModal('');
    };

    const handleCatChange = (cat) => {
        setCategoria(cat);
        const serv0 = PROFISSIONAIS_SERVICOS[profissional].categorias[cat][0];
        setServico(serv0);
        setEstilo(serv0.opcoes ? Object.keys(serv0.opcoes)[0] : '');
        setIsManutencao(false);
        setHorario('');
        setErroModal('');
    };

    const handleServChange = (nome) => {
        const s = PROFISSIONAIS_SERVICOS[profissional].categorias[categoria].find(x => x.nome === nome);
        setServico(s);
        setEstilo(s.opcoes ? Object.keys(s.opcoes)[0] : '');
        setIsManutencao(false);
        setHorario('');
        setErroModal('');
    };

    /* ─── Adicionar item à sacola ─── */
    const adicionarNaSacola = () => {
        if (!horario) { setErroModal('Selecione um horário.'); return; }
        if (!data)    { setErroModal('Selecione uma data.');   return; }

        // Verificar conflito dentro da própria sacola
        const itensMesmoProfData = sacola.filter(i => i.profissional === profissional && i.data === data);
        const startNew = toMinutes(horario);
        const endNew   = startNew + (servico.duracao || 30);
        const conflito = itensMesmoProfData.some(i => {
            const s = toMinutes(i.horario);
            const e = s + (i.duracao || 30);
            return startNew < e && endNew > s;
        });
        if (conflito) {
            setErroModal('Este horário conflita com outro serviço já na sacola para esta profissional.');
            return;
        }

        let servicoFormatado = '';
        if (profissional === 'Laura Alencar') {
            servicoFormatado = `Cílios - ${servico.nome}${isManutencao ? ' (Manutenção)' : ''}`;
        } else if (profissional === 'Mayara Vespasiano') {
            servicoFormatado = `${categoria} - ${servico.nome}`;
        } else {
            servicoFormatado = `Unhas - ${servico.nome}${estilo ? ` (${estilo})` : ''}`;
        }

        setSacola(prev => [
            ...prev,
            {
                id: Date.now(),
                profissional,
                servico:     servicoFormatado,
                servicoObj:  servico,
                estilo,
                categoria,
                data,
                horario,
                duracao:     servico.duracao || 30,
                valor:       obterPreco(),
                isManutencao
            }
        ]);

        // Resetar campos para adicionar outro
        setHorario('');
        setErroModal('');
        setIsManutencao(false);
    };

    const removerDaSacola = (id) => setSacola(prev => prev.filter(i => i.id !== id));

    /* ─── Confirmar todos os agendamentos da sacola ─── */
    const confirmarSacola = async () => {
        if (sacola.length === 0) return;
        setEnviando(true);
        setErroModal('');
        const erros = [];

        for (const item of sacola) {
            try {
                const resp = await adicionarAgendamento({
                    cliente:     userLogado.nome || 'Você',
                    cliente_id:  userLogado.id,
                    servico:     item.servico,
                    data:        item.data,
                    horario:     item.horario,
                    duracao:     item.duracao,
                    profissional: item.profissional,
                    isManutencao: item.isManutencao,
                    valor:       item.valor
                });
                if (resp && resp.error) erros.push(`${item.servico}: ${resp.error}`);
            } catch (e) {
                erros.push(`${item.servico}: Erro inesperado.`);
            }
        }

        setEnviando(false);
        if (erros.length > 0) {
            setErroModal('Alguns agendamentos falharam:\n' + erros.join('\n'));
        } else {
            setSacola([]);
            setIsModalOpen(false);
            setModalStep('form');
        }
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setModalStep('form');
        setErroModal('');
        setHorario('');
        setSacola([]);
    };

    /* ─── Dados do painel ─── */
    const meusAgendamentos = agendamentos.filter(ag =>
        ag.cliente_id === userLogado.id ||
        ag.cliente === userLogado.nome ||
        ag.cliente === 'Você'
    );
    const pendentes = meusAgendamentos.filter(ag => ag.status === 'pendente')
        .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
    const proximo = pendentes[0] || null;

    const handleCancelar = (id) => {
        if (window.confirm('Tem certeza que deseja cancelar este agendamento?'))
            cancelarAgendamento(id);
    };

    const totalSacola = sacola.reduce((s, i) => s + i.valor, 0);
    const slotsDisponiveis = ALL_SLOTS.filter(s => !isSlotBloqueado(s));

    /* ─────────────── RENDER ─────────────── */
    return (
        <div className="dashboard-container">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>SEVEN <span className="logo-sub">CLINIC</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li className="active"><a href="#">Meus Agendamentos</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); setIsModalOpen(true); }}>Novo Agendamento</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); navigate('/perfil-cliente'); }}>Perfil</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); navigate('/login'); }}>Sair</a></li>
                    </ul>
                </nav>
            </aside>

            {/* MAIN */}
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Olá, {userLogado.nome ? userLogado.nome.split(' ')[0] : 'Cliente'}!</h1>
                    <p>Bem-vinda de volta ao seu espaço de beleza e bem-estar.</p>
                </header>

                <section className="dashboard-cards">
                    {proximo ? (
                        <div className="card-agendamento destaquecard">
                            <h3>Próximo Agendamento</h3>
                            <div className="agendamento-details">
                                <p><strong>Serviço:</strong> {proximo.servico}</p>
                                <p><strong>Data:</strong> {formatDate(proximo.data)}</p>
                                <p><strong>Horário:</strong> {proximo.horario}</p>
                                <p><strong>Profissional:</strong> {proximo.profissional}</p>
                                {proximo.valor > 0 && <p><strong>Valor:</strong> R$ {proximo.valor.toFixed(2)}</p>}
                            </div>
                            <button className="btn-secondary" onClick={() => handleCancelar(proximo.id)}>Cancelar Agendamento</button>
                        </div>
                    ) : (
                        <div className="card-agendamento destaquecard">
                            <h3>Nenhum agendamento futuro</h3>
                            <p style={{ color: '#666', marginTop: '10px' }}>Você não possui serviços agendados no momento.</p>
                        </div>
                    )}
                    <div className="card-action">
                        <h3>Quer agendar um novo momento?</h3>
                        <p>Explore nossos serviços e garanta seu horário.</p>
                        <button className="btn-primary" style={{ marginTop: '15px' }} onClick={() => setIsModalOpen(true)}>AGENDAR AGORA</button>
                    </div>
                </section>

                {/* HISTÓRICO */}
                <section className="dashboard-history">
                    <h2>Histórico de Agendamentos</h2>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Serviço</th>
                                <th>Data</th>
                                <th>Profissional</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meusAgendamentos.map(ag => (
                                <tr key={ag.id}>
                                    <td>{ag.servico}</td>
                                    <td>{formatDate(ag.data)} {ag.horario}</td>
                                    <td>{ag.profissional}</td>
                                    <td>{ag.valor ? `R$ ${ag.valor.toFixed(2)}` : 'R$ 0,00'}</td>
                                    <td>
                                        <span className={`status-badge status-${ag.status}`}>
                                            {ag.status === 'concluido' ? 'Concluído' : ag.status === 'cancelado' ? 'Cancelado' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td>
                                        {ag.status === 'pendente' && (
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                                onClick={() => handleCancelar(ag.id)}
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {meusAgendamentos.length === 0 && (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Nenhum histórico encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* ══════════════════════════════════════════════════════
                    MODAL — SACOLA DE AGENDAMENTOS
                    ══════════════════════════════════════════════════════ */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-large" style={{ maxWidth: '960px', width: '95vw' }}>

                            {/* ─── Cabeçalho do modal com abas ─── */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className={modalStep === 'form' ? 'btn-primary' : 'btn-secondary'}
                                        style={{ padding: '8px 16px', fontSize: '0.85rem', marginTop: 0, width: 'auto' }}
                                        onClick={() => setModalStep('form')}
                                    >
                                        ✏️ Adicionar Serviço
                                    </button>
                                    <button
                                        className={modalStep === 'sacola' ? 'btn-primary' : 'btn-secondary'}
                                        style={{ padding: '8px 16px', fontSize: '0.85rem', marginTop: 0, width: 'auto', position: 'relative' }}
                                        onClick={() => setModalStep('sacola')}
                                    >
                                        🛍️ Sacola {sacola.length > 0 && <span style={{ background: '#c0392b', color: '#fff', borderRadius: '50%', padding: '1px 6px', fontSize: '0.7rem', marginLeft: '4px' }}>{sacola.length}</span>}
                                    </button>
                                </div>
                                <button
                                    onClick={fecharModal}
                                    style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999' }}
                                >×</button>
                            </div>

                            {/* ─── Passo: Adicionar Serviço ─── */}
                            {modalStep === 'form' && (
                                <div className="modal-grid">
                                    {/* Lado esquerdo — formulário */}
                                    <div className="modal-form-col">

                                        {/* Profissional */}
                                        <div className="input-group">
                                            <label>Profissional</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {Object.keys(PROFISSIONAIS_SERVICOS).map(p => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => handleProfChange(p)}
                                                        style={{
                                                            flex: '1', minWidth: '130px', padding: '10px 8px',
                                                            border: `2px solid ${profissional === p ? '#654b42' : '#e0e0e0'}`,
                                                            borderRadius: '8px', cursor: 'pointer',
                                                            background: profissional === p ? '#f9f0ed' : '#fff',
                                                            color: profissional === p ? '#654b42' : '#444',
                                                            fontWeight: profissional === p ? '700' : '400',
                                                            fontSize: '0.82rem', textAlign: 'center'
                                                        }}
                                                    >
                                                        {p}<br />
                                                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{PROFISSIONAIS_SERVICOS[p].especialidade}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Categoria (se houver mais de 1) */}
                                        {Object.keys(PROFISSIONAIS_SERVICOS[profissional].categorias).length > 1 && (
                                            <div className="input-group">
                                                <label>Categoria</label>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {Object.keys(PROFISSIONAIS_SERVICOS[profissional].categorias).map(cat => (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => handleCatChange(cat)}
                                                            style={{
                                                                padding: '6px 12px', border: `1px solid ${categoria === cat ? '#654b42' : '#ccc'}`,
                                                                borderRadius: '20px', cursor: 'pointer',
                                                                background: categoria === cat ? '#654b42' : '#fff',
                                                                color: categoria === cat ? '#fff' : '#444',
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Procedimento */}
                                        <div className="input-group">
                                            <label>Procedimento</label>
                                            <select value={servico.nome} onChange={e => handleServChange(e.target.value)}>
                                                {PROFISSIONAIS_SERVICOS[profissional].categorias[categoria].map(s => (
                                                    <option key={s.nome} value={s.nome}>
                                                        {s.nome} {s.preco ? `— R$ ${s.preco.toFixed(2)}` : ''}
                                                        {s.opcoes ? ` — a partir de R$ ${Math.min(...Object.values(s.opcoes)).toFixed(2)}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Estilo (se tiver opções) */}
                                        {servico.opcoes && (
                                            <div className="input-group">
                                                <label>Estilo / Acabamento</label>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {Object.entries(servico.opcoes).map(([opt, val]) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setEstilo(opt)}
                                                            style={{
                                                                padding: '8px 14px', border: `2px solid ${estilo === opt ? '#654b42' : '#e0e0e0'}`,
                                                                borderRadius: '8px', cursor: 'pointer',
                                                                background: estilo === opt ? '#654b42' : '#fff',
                                                                color: estilo === opt ? '#fff' : '#444',
                                                                fontSize: '0.82rem'
                                                            }}
                                                        >
                                                            {opt} — R$ {val.toFixed(2)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Manutenção Cílios */}
                                        {profissional === 'Laura Alencar' && servico.permiteManutencao && (
                                            <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isManutencao}
                                                        onChange={e => setIsManutencao(e.target.checked)}
                                                        style={{ width: '18px', height: '18px' }}
                                                    />
                                                    <div>
                                                        <strong>Manutenção de Cílios</strong>
                                                        <span style={{ display: 'block', fontSize: '0.78rem', color: '#666' }}>
                                                            30% de desconto se em até 15 dias da última sessão. (Máx. 2 seguidas)
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        )}

                                        {/* Resumo do item */}
                                        <div style={{ marginTop: '18px', padding: '14px', border: '1px dashed #654b42', borderRadius: '8px', background: '#faf6f4' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#654b42', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Resumo do Serviço</p>
                                            <p style={{ margin: '8px 0 2px', fontSize: '0.85rem' }}><strong>{profissional}</strong></p>
                                            <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>
                                                {servico.nome}{estilo ? ` (${estilo})` : ''}{isManutencao ? ' — Manutenção' : ''}
                                            </p>
                                            <p style={{ margin: '2px 0', fontSize: '0.78rem', color: '#888' }}>
                                                ⏱ Duração estimada: {servico.duracao || 30} min
                                            </p>
                                            {horario && data && (
                                                <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#555' }}>
                                                    📅 {formatDate(data)} às {horario} → {minutesToHHMM(toMinutes(horario) + (servico.duracao || 30))}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ebdcd5', paddingTop: '8px', marginTop: '10px' }}>
                                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Valor:</span>
                                                <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#654b42' }}>R$ {obterPreco().toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {erroModal && (
                                            <div style={{ marginTop: '10px', padding: '10px', background: '#ffebee', borderRadius: '6px', color: '#c0392b', fontSize: '0.85rem', whiteSpace: 'pre-line' }}>
                                                ⚠️ {erroModal}
                                            </div>
                                        )}

                                        {/* Botão adicionar à sacola */}
                                        <button
                                            type="button"
                                            onClick={adicionarNaSacola}
                                            disabled={!horario}
                                            style={{
                                                marginTop: '16px', width: '100%', padding: '12px',
                                                background: horario ? '#654b42' : '#ccc',
                                                color: '#fff', border: 'none', borderRadius: '8px',
                                                fontSize: '0.95rem', fontWeight: '700', cursor: horario ? 'pointer' : 'not-allowed',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            🛍️ Adicionar à Sacola
                                        </button>
                                    </div>

                                    {/* Lado direito — calendário */}
                                    <div className="modal-calendar-col">
                                        <div className="calendar-header">
                                            <h3>{profissional}</h3>
                                            <p>Selecione a data e horário</p>
                                        </div>

                                        <div className="date-selector-wrapper">
                                            <input
                                                type="date"
                                                value={data}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={e => { setData(e.target.value); setHorario(''); }}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', margin: '8px 0', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ width: '12px', height: '12px', background: '#e8f5e9', border: '1px solid #4caf50', display: 'inline-block', borderRadius: '2px' }}></span> Disponível
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ width: '12px', height: '12px', background: '#fffde7', border: '2px solid #f9a825', display: 'inline-block', borderRadius: '2px' }}></span> Sugerido ✨
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ width: '12px', height: '12px', background: '#654b42', display: 'inline-block', borderRadius: '2px' }}></span> Selecionado
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ width: '12px', height: '12px', background: '#ffebee', border: '1px solid #ef9a9a', display: 'inline-block', borderRadius: '2px' }}></span> Ocupado
                                            </span>
                                        </div>

                                        <div className="time-slots-grid">
                                            {ALL_SLOTS.map(slot => {
                                                const bloqueado  = isSlotBloqueado(slot);
                                                const selecionado = horario === slot;
                                                const sugerido   = !bloqueado && !selecionado && slot === slotSugerido;

                                                let bg     = '#e8f5e9';
                                                let border = '#4caf50';
                                                let color  = '#2e7d32';

                                                if (selecionado) { bg = '#654b42'; border = '#654b42'; color = '#fff'; }
                                                else if (bloqueado) { bg = '#ffebee'; border = '#ef9a9a'; color = '#c0392b'; }
                                                else if (sugerido) { bg = '#fffde7'; border = '#f9a825'; color = '#e65100'; }

                                                return (
                                                    <div
                                                        key={slot}
                                                        onClick={() => !bloqueado && setHorario(slot === horario ? '' : slot)}
                                                        title={sugerido ? '✨ Horário sugerido — logo após seu último agendamento' : ''}
                                                        style={{
                                                            padding: '8px 4px', textAlign: 'center',
                                                            borderRadius: '6px', fontSize: '0.82rem', fontWeight: sugerido ? '800' : '600',
                                                            cursor: bloqueado ? 'not-allowed' : 'pointer',
                                                            border: `2px solid ${border}`,
                                                            background: bg,
                                                            color,
                                                            transition: 'all 0.15s',
                                                            textDecoration: bloqueado ? 'line-through' : 'none',
                                                            opacity: bloqueado ? 0.6 : 1,
                                                            boxShadow: sugerido ? '0 0 0 3px rgba(249,168,37,0.3)' : 'none',
                                                            transform: sugerido ? 'scale(1.05)' : 'none'
                                                        }}
                                                    >
                                                        {slot}
                                                        {sugerido && <div style={{fontSize: '0.6rem', marginTop: '2px', opacity: 0.9}}>✨</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {horario && (
                                            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#2e7d32', fontWeight: '600' }}>
                                                ✓ Horário {horario} → {minutesToHHMM(toMinutes(horario) + (servico.duracao || 30))} selecionado
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ─── Passo: Sacola ─── */}
                            {modalStep === 'sacola' && (
                                <div>
                                    <h2 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: '#333' }}>Sua Sacola de Agendamentos</h2>

                                    {sacola.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                                            <p style={{ fontSize: '2rem' }}>🛍️</p>
                                            <p>Sua sacola está vazia. Adicione serviços na aba "Adicionar Serviço".</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {sacola.map(item => (
                                                    <div key={item.id} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '14px 16px', border: '1px solid #e0e0e0', borderRadius: '10px',
                                                        background: '#fafafa'
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ margin: 0, fontWeight: '700', color: '#333' }}>{item.servico}</p>
                                                            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#666' }}>
                                                                👩‍⚕️ {item.profissional} &nbsp;|&nbsp;
                                                                📅 {formatDate(item.data)} às {item.horario} → {minutesToHHMM(toMinutes(item.horario) + item.duracao)} &nbsp;|&nbsp;
                                                                ⏱ {item.duracao} min
                                                            </p>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <span style={{ fontWeight: '800', color: '#654b42', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                                                R$ {item.valor.toFixed(2)}
                                                            </span>
                                                            <button
                                                                onClick={() => removerDaSacola(item.id)}
                                                                style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
                                                                title="Remover"
                                                            >×</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Rodapé da sacola */}
                                            <div style={{
                                                marginTop: '20px', padding: '16px', border: '2px solid #654b42',
                                                borderRadius: '10px', background: '#faf6f4',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{sacola.length} serviço(s) selecionado(s)</p>
                                                    <p style={{ margin: '4px 0 0', fontWeight: '800', fontSize: '1.3rem', color: '#654b42' }}>Total: R$ {totalSacola.toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={confirmarSacola}
                                                    disabled={enviando}
                                                    style={{
                                                        padding: '12px 24px', background: enviando ? '#ccc' : '#654b42',
                                                        color: '#fff', border: 'none', borderRadius: '8px',
                                                        fontSize: '0.95rem', fontWeight: '700', cursor: enviando ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    {enviando ? 'Confirmando...' : '✅ Confirmar Todos'}
                                                </button>
                                            </div>

                                            {erroModal && (
                                                <div style={{ marginTop: '12px', padding: '12px', background: '#ffebee', borderRadius: '8px', color: '#c0392b', fontSize: '0.85rem', whiteSpace: 'pre-line' }}>
                                                    ⚠️ {erroModal}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PainelCliente;
