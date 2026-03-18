import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AgendamentoProvider } from './context/AgendamentoContext';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import PainelCliente from './pages/PainelCliente';
import PainelFuncionaria from './pages/PainelFuncionaria';
import PerfilCliente from './pages/PerfilCliente';
import PerfilFuncionaria from './pages/PerfilFuncionaria';
import MeusClientes from './pages/MeusClientes';
import RedefinirSenha from './pages/RedefinirSenha';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AgendamentoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/painel-cliente" element={<ProtectedRoute><PainelCliente /></ProtectedRoute>} />
          <Route path="/painel-funcionaria" element={<ProtectedRoute><PainelFuncionaria /></ProtectedRoute>} />
          <Route path="/perfil-cliente" element={<ProtectedRoute><PerfilCliente /></ProtectedRoute>} />
          <Route path="/perfil-funcionaria" element={<ProtectedRoute><PerfilFuncionaria /></ProtectedRoute>} />
          <Route path="/meus-clientes" element={<ProtectedRoute><MeusClientes /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AgendamentoProvider>
  );
}

export default App;