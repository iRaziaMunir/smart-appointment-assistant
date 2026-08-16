import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatPanel from '../components/ChatPanel';
import AppointmentsList from '../components/AppointmentsList';
import AppointmentForm from '../components/AppointmentForm';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('list');

  function handleAppointmentBooked() {
    setRefreshKey((previousKey) => previousKey + 1);
    setActiveTab('list');
  }

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-logo">Smart Appointment Assistant</span>
          <span className="dashboard-tag">AI Booking</span>
        </div>
        <div className="header-actions">
          <div className="user-chip">
            <span className="user-avatar">{initials}</span>
            <span className="user-name">{user?.fullName}</span>
          </div>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <ChatPanel onAppointmentBooked={handleAppointmentBooked} />

        <aside className="side-panel">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              My Appointments
            </button>
            <button
              className={`tab ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              Book Manually
            </button>
          </div>
          <div className="side-panel-body">
            {activeTab === 'list' ? (
              <AppointmentsList refreshKey={refreshKey} />
            ) : (
              <AppointmentForm isStandaloneForm onBookingSuccess={handleAppointmentBooked} />
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
