import { useEffect, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import { getFoodSummary } from "../../services/foodService";
import DashboardInventory from "./components/DashboardInventory";
import InfoBanner from "./components/InfoBanner";
import SummaryGrid from "./components/SummaryGrid";

import "./styles/dashboard.css";

const defaultSummary = {
  total_foods: 0,
  total_aman: 0,
  total_mendekati: 0,
  total_kedaluwarsa: 0,
  total_dibuang: 0,
  total_digunakan: 0,
  total_prioritas_tinggi: 0,
  total_prioritas_sedang: 0,
  total_prioritas_rendah: 0,
};

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [summary, setSummary] = useState(defaultSummary);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const data = await getFoodSummary();
      setSummary({
        ...defaultSummary,
        ...data,
      });
    } catch (error) {
      console.error("Gagal mengambil ringkasan makanan:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const refreshDashboard = () => {
    fetchSummary();
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <AppShell>
      <div className="dashboard-page">
        <InfoBanner user={user} summary={summary} loading={loadingSummary} />
        <SummaryGrid summary={summary} loading={loadingSummary} />
        <DashboardInventory
          refreshKey={refreshKey}
          onInventoryChange={refreshDashboard}
        />
      </div>
    </AppShell>
  );
}