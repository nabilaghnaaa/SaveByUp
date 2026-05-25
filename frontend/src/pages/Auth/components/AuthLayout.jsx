import "../styles/authLayout.css";

export default function AuthLayout({ variant = "login", visual, children }) {
  return (
    <main className={`auth-page auth-${variant}`}>
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <div className="auth-orb auth-orb-three" />

      <section className="auth-shell">
        <div className="auth-visual-panel">{visual}</div>

        <div className="auth-form-panel">
          <div className="auth-form-card">{children}</div>
        </div>
      </section>
    </main>
  );
}