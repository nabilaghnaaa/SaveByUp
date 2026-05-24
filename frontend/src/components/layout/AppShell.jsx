import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import "./styles/appShell.css";

export default function AppShell({ children }) {
  return (
    <div className="app-shell sb-page">
      <Sidebar />

      <main className="app-main">
        <Topbar />
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}