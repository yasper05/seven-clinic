import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AgendamentoProvider } from './context/AgendamentoContext';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import PainelCliente from './pages/PainelCliente';
import PainelFuncionaria from './pages/PainelFuncionaria';
import PerfilCliente from './pages/PerfilCliente';
import PerfilFuncionaria from './pages/PerfilFuncionaria';
import MeusClientes from './pages/MeusClientes';
import './App.css';

function App() {
  return (
    <AgendamentoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/painel-cliente" element={<PainelCliente />} />
          <Route path="/painel-funcionaria" element={<PainelFuncionaria />} />
          <Route path="/perfil-cliente" element={<PerfilCliente />} />
          <Route path="/perfil-funcionaria" element={<PerfilFuncionaria />} />
          <Route path="/meus-clientes" element={<MeusClientes />} />
        </Routes>
      </BrowserRouter>
    </AgendamentoProvider>
  );
}

export default App;