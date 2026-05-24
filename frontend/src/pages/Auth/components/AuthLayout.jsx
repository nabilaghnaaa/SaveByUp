import "../styles/authLayout.css";

export default function AuthLayout({ variant = "login", visual, children }) {
  return (
    <main className={`auth-page auth-${variant}`}>
      <section className="auth-shell">
        <div className="auth-visual-panel">{visual}</div>

        <div className="auth-form-panel">
          <div className="auth-form-card">{children}</div>
        </div>
      </section>
    </main>
  );
}