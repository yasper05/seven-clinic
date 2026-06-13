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
    // Atualização automática a cada 10 segundos
    const intervalo = setInterval(() => {
      buscarAgendamentos();
    }, 10000);

    return () => clearInterval(intervalo);
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

  const confirmarAgendamento = async (id, dadosConfirmacao = {}) => {
    try {
      await api.put(`/api/agendamentos/${id}/status`, { status: 'confirmado', ...dadosConfirmacao });
      buscarAgendamentos();
      return { success: true };
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
      return { error: msg };
    }
  };

  const sugerirAgendamento = async (id, dadosSugestao = {}) => {
    try {
      await api.put(`/api/agendamentos/${id}/status`, { status: 'sugerido', ...dadosSugestao });
      buscarAgendamentos();
      return { success: true };
    } catch (error) {
      console.error('Erro ao sugerir agendamento:', error);
      const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
      return { error: msg };
    }
  };

  const recusarAgendamento = async (id) => {
    try {
      await api.put(`/api/agendamentos/${id}/status`, { status: 'recusado', cancelado_por: 'Clínica' });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao recusar agendamento:', error);
    }
  };

  const cancelarAgendamento = async (id, canceladoPor = 'Cliente') => {
    try {
      await api.put(`/api/agendamentos/${id}/status`, { status: 'cancelado', cancelado_por: canceladoPor });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  const concluirAgendamento = async (id, dadosConclusao = {}) => {
    try {
      await api.put(`/api/agendamentos/${id}/status`, { status: 'concluido', ...dadosConclusao });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao concluir agendamento:', error);
    }
  };

  const avaliarAtendimento = async (id, nota_profissional) => {
    try {
      await api.put(`/api/agendamentos/${id}/avaliar`, { nota_profissional });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao avaliar atendimento:', error);
    }
  };

  const naoCompareceuAgendamento = async (id) => {
    try {
      await api.put(`/api/agendamentos/${id}/status`, { status: 'nao_compareceu' });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao registrar não comparecimento:', error);
    }
  };

  return (
    <AgendamentoContext.Provider value={{ 
        agendamentos,
        buscarAgendamentos,
        adicionarAgendamento, 
        cancelarAgendamento, 
        concluirAgendamento,
        naoCompareceuAgendamento,
        confirmarAgendamento,
        sugerirAgendamento,
        recusarAgendamento,
        avaliarAtendimento
    }}>
      {children}
    </AgendamentoContext.Provider>
  );
};
