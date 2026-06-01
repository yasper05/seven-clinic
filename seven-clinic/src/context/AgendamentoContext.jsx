import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AgendamentoContext = createContext();

export const AgendamentoProvider = ({ children }) => {
  const [agendamentos, setAgendamentos] = useState([]);

  const estaLogado = () => {
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
  };

  const buscarAgendamentos = async () => {
    // Só busca se o usuário estiver logado (tiver token)
    if (!estaLogado()) return;

    try {
      const response = await api.get('/api/agendamentos');
      setAgendamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos do banco:', error);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  const adicionarAgendamento = async (novoAgendamento) => {
    try {
      const response = await api.post('/api/agendamentos', novoAgendamento);
      await buscarAgendamentos();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
      return { error: msg };
    }
  };


  const cancelarAgendamento = async (id) => {
    try {
      await api.put(`/api/agendamentos/${id}/status`, { status: 'cancelado' });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  const concluirAgendamento = async (id) => {
    try {
      await api.put(`/api/agendamentos/${id}/status`, { status: 'concluido' });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao concluir agendamento:', error);
    }
  };

  return (
    <AgendamentoContext.Provider value={{ 
        agendamentos,
        buscarAgendamentos,
        adicionarAgendamento, 
        cancelarAgendamento, 
        concluirAgendamento 
    }}>
      {children}
    </AgendamentoContext.Provider>
  );
};
