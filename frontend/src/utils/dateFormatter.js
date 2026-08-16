export function formatAppointmentDate(dateString) {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatAppointmentTime(timeString) {
  if (!timeString) return '';
  return timeString.slice(0, 5);
}
