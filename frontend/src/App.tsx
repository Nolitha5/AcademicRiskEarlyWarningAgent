import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import StudentDashboard  from './pages/StudentDashboard'
import AdminDashboard    from './pages/AdminDashboard'
import StudentRiskReport from './pages/StudentRiskReport'
import StudentProfile    from './pages/StudentProfile'
import InterventionHistory from './pages/InterventionHistory'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"                  element={<StudentDashboard />} />
            <Route path="/admin"                      element={<AdminDashboard />} />
            <Route path="/students/:id/risk"          element={<StudentRiskReport />} />
            <Route path="/students/:id/profile"       element={<StudentProfile />} />
            <Route path="/students/:id/interventions" element={<InterventionHistory />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
