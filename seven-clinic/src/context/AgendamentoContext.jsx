import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AgendamentoContext = createContext();

export const AgendamentoProvider = ({ children }) => {
  const [agendamentos, setAgendamentos] = useState([]);

  // URL base da API - configurada no arquivo .env
  const API_URL = `${import.meta.env.VITE_API_URL}/api`;

  const buscarAgendamentos = async () => {
    try {
      const response = await axios.get(`${API_URL}/agendamentos`);
      setAgendamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos do banco:', error);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  // Função para adicionar um novo agendamento (Cliente/Profissional agendando)
  const adicionarAgendamento = async (novoAgendamento) => {
    try {
      await axios.post(`${API_URL}/agendamentos`, novoAgendamento);
      buscarAgendamentos(); // Atualiza a lista após inserir
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao agendar: ' + (error.response?.data?.error || error.message));
    }
  };

  // Função para cancelar (remover) um agendamento
  const cancelarAgendamento = async (id) => {
    try {
      await axios.put(`${API_URL}/agendamentos/${id}/status`, { status: 'cancelado' });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  // Função para concluir um atendimento (Profissional marcando como feito)
  const concluirAgendamento = async (id) => {
    try {
      await axios.put(`${API_URL}/agendamentos/${id}/status`, { status: 'concluido' });
      buscarAgendamentos();
    } catch (error) {
      console.error('Erro ao concluir agendamento:', error);
    }
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
