import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

import Dashboard from '@/pages/Dashboard'
import CadastrarJogo from '@/pages/CadastrarJogo'
import Jogos from '@/pages/Jogos'
import Jogadores from '@/pages/Jogadores'
import Goleiros from '@/pages/Goleiros'
import Estatisticas from '@/pages/Estatisticas'
import Ranking from '@/pages/Ranking'
import HallDaFama from '@/pages/HallDaFama'
import Temporadas from '@/pages/Temporadas'
import Configuracoes from '@/pages/Configuracoes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Signup />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="cadastrar-jogo" element={<CadastrarJogo />} />
              <Route path="jogos" element={<Jogos />} />
              <Route path="jogadores" element={<Jogadores />} />
              <Route path="goleiros" element={<Goleiros />} />
              <Route path="estatisticas" element={<Estatisticas />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="hall-da-fama" element={<HallDaFama />} />
              <Route path="temporadas" element={<Temporadas />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
