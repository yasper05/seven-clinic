import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Tenta pegar o user persistido (Me manter conectado) ou o temporário
    const user = localStorage.getItem('userLogado') || sessionStorage.getItem('userLogado');

    if (!user) {
        // Se não houver usuário logado, redireciona para o login
        return <Navigate to="/login" replace />;
    }

    // Se estiver logado, renderiza o componente filho (ex: PainelCliente, PainelFuncionaria)
    return children;
};

export default ProtectedRoute;
