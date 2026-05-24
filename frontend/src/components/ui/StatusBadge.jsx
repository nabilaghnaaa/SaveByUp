import "./styles/ui.css";

export default function StatusBadge({ children, tone = "green" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}