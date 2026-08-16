import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { formatAppointmentDate, formatAppointmentTime } from '../utils/dateFormatter';

export default function AppointmentsList({ refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadAppointments() {
      setIsLoading(true);
      try {
        const response = await apiClient.getAppointments();
        setAppointments(response.appointments);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAppointments();
  }, [refreshKey]);

  if (isLoading) return <div className="empty-state">Loading appointments...</div>;
  if (errorMessage) return <div className="error-message">{errorMessage}</div>;
  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        No appointments yet.
        <br />
        Chat with Smart Appointment Assistant to book your first one.
      </div>
    );
  }

  return (
    <ul className="appointment-list">
      {appointments.map((appointment) => (
        <li key={appointment.id} className="appointment-item">
          <h4>{appointment.title}</h4>
          <div className="meta">
            {formatAppointmentDate(appointment.appointmentDate)} at{' '}
            {formatAppointmentTime(appointment.startTime)}
          </div>
          {appointment.description && <div className="meta">{appointment.description}</div>}
          <span className="status-badge">{appointment.status}</span>
        </li>
      ))}
    </ul>
  );
}
