import Sidebar from "./Sidebar";

import "./styles/appShell.css";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}