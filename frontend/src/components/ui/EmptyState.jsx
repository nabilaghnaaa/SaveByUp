import "./styles/ui.css";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state sb-glass">
      <div className="empty-icon">🍃</div>

      <h3>{title}</h3>

      {description && <p>{description}</p>}

      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}