export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand-inner">
          <p className="auth-brand-mark">Smart Appointment Assistant</p>
          <h1 className="auth-brand-title">
            Book faster with an
            <em> AI assistant</em>
          </h1>
          <p className="auth-brand-copy">
            Describe what you need in plain language. Smart Appointment Assistant extracts the
            service, date, and time — then you confirm before anything is booked.
          </p>
          <div className="auth-chat-preview" aria-hidden="true">
            <div className="preview-bubble assistant">
              I can help you book. What would you like to schedule?
            </div>
            <div className="preview-bubble user">Haircut tomorrow at 3 PM</div>
            <div className="preview-bubble assistant">
              Got it — Haircut on tomorrow at 15:00. Confirm when ready.
            </div>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-form-shell">
          <div className="auth-mobile-brand">Smart Appointment Assistant</div>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
