import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export default function AppointmentForm({
  sessionId,
  initialBookingData = {},
  isReadyToConfirm,
  onBookingSuccess,
  isStandaloneForm,
}) {
  const [serviceTitle, setServiceTitle] = useState(initialBookingData.title || '');
  const [appointmentDate, setAppointmentDate] = useState(initialBookingData.appointmentDate || '');
  const [startTime, setStartTime] = useState(initialBookingData.startTime || '');
  const [description, setDescription] = useState(initialBookingData.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialBookingData.title) setServiceTitle(initialBookingData.title);
    if (initialBookingData.appointmentDate) setAppointmentDate(initialBookingData.appointmentDate);
    if (initialBookingData.startTime) setStartTime(initialBookingData.startTime);
    if (initialBookingData.description) setDescription(initialBookingData.description);
  }, [initialBookingData]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const appointmentPayload = {
      title: serviceTitle,
      appointmentDate,
      startTime,
      description: description || undefined,
    };

    try {
      if (sessionId && isReadyToConfirm) {
        await apiClient.createAppointmentFromChat(sessionId, appointmentPayload);
      } else {
        await apiClient.createAppointment(appointmentPayload);
      }

      setSuccessMessage('Appointment booked!');
      setServiceTitle('');
      setAppointmentDate('');
      setStartTime('');
      setDescription('');
      onBookingSuccess?.();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formHeading = isStandaloneForm
    ? 'Book an Appointment'
    : isReadyToConfirm
      ? 'Confirm Booking'
      : 'Complete Missing Details';

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h4>{formHeading}</h4>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <input
        type="text"
        placeholder="Reason for visit"
        value={serviceTitle}
        onChange={(event) => setServiceTitle(event.target.value)}
        required
      />
      <div className="form-row">
        <input
          type="date"
          value={appointmentDate}
          onChange={(event) => setAppointmentDate(event.target.value)}
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
        />
      </div>
      <textarea
        placeholder="Additional notes (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="booking-actions">
        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
          {isSubmitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </div>
    </form>
  );
}
