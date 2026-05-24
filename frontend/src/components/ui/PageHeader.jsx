import "./styles/ui.css";

export default function PageHeader({ label, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {label && <span>{label}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}