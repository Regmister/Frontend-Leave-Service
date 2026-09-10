import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';

import { LoginForm } from './components/auth/LoginForm.jsx';
import { DashboardPage } from './components/pages/DashboardPage.jsx';
import { MyLeavePage } from './components/pages/MyLeavePage.jsx';
import { TeamPage } from './components/pages/TeamPage.jsx';
import { AdminLeavesPage } from './components/pages/AdminLeavesPage.jsx';
import { AdminUsersPage } from './components/pages/AdminUsersPage.jsx';
import { ChangePasswordPage } from './components/pages/ChangePasswordPage.jsx';

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main id="main-content" className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <a href="#main-content" className="sr-only" style={{ position: 'absolute' }}>
          Skip to main content
        </a>

        <Routes>
          <Route path="/login" element={<LoginForm />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell><DashboardPage /></AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-leave"
            element={
              <ProtectedRoute>
                <AppShell><MyLeavePage /></AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <AppShell><ChangePasswordPage /></AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
                <AppShell><TeamPage /></AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/leaves"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AppShell><AdminLeavesPage /></AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AppShell><AdminUsersPage /></AppShell>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
