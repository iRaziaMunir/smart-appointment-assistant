import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const { user, loading } = useAuth();
  const [showRegisterPage, setShowRegisterPage] = useState(false);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading Smart Appointment Assistant...</p>
      </div>
    );
  }

  if (!user) {
    return showRegisterPage ? (
      <RegisterPage onSwitchToLogin={() => setShowRegisterPage(false)} />
    ) : (
      <LoginPage onSwitchToRegister={() => setShowRegisterPage(true)} />
    );
  }

  return <DashboardPage />;
}
