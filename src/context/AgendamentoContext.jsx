import React, { createContext, useState, useEffect } from 'react';

export const AgendamentoContext = createContext();

export const AgendamentoProvider = ({ children }) => {
  // Estado inicial simulando um banco de dados
  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      cliente: 'Você', // Representa a usuária logada
      servico: 'Cílios Volume Brasileiro',
      data: '2026-03-25',
      horario: '14:00',
      profissional: 'Maria',
      status: 'pendente'
    },
    {
      id: 2,
      cliente: 'Você',
      servico: 'Unhas (Mão e Pé)',
      data: '2026-03-10',
      horario: '10:00',
      profissional: 'Ana',
      status: 'concluido'
    },
    {
      id: 3,
      cliente: 'Amanda Oliveira',
      servico: 'Design de Sobrancelha',
      data: new Date().toISOString().split('T')[0], // Pega a data de hoje (YYYY-MM-DD)
      horario: '09:00',
      profissional: 'Você (Profissional)', // Representa a profissional logada
      status: 'pendente'
    },
    {
        id: 4,
        cliente: 'Beatriz Souza',
        servico: 'Alongamento de Cílios',
        data: new Date().toISOString().split('T')[0],
        horario: '10:30',
        profissional: 'Você (Profissional)',
        status: 'pendente'
    }
  ]);

  // Função para adicionar um novo agendamento (Cliente agendando)
  const adicionarAgendamento = (novoAgendamento) => {
    setAgendamentos([...agendamentos, { ...novoAgendamento, id: Date.now(), status: 'pendente' }]);
  };

  // Função para cancelar (remover) um agendamento
  const cancelarAgendamento = (id) => {
    setAgendamentos(agendamentos.filter(ag => ag.id !== id));
  };

  // Função para concluir um atendimento (Profissional marcando como feito)
  const concluirAgendamento = (id) => {
    setAgendamentos(
      agendamentos.map(ag => 
        ag.id === id ? { ...ag, status: 'concluido' } : ag
      )
    );
  };

  return (
    <AgendamentoContext.Provider value={{ 
        agendamentos, 
        adicionarAgendamento, 
        cancelarAgendamento, 
        concluirAgendamento 
    }}>
      {children}
    </AgendamentoContext.Provider>
  );
};
