import { useEffect, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import { getFoodSummary } from "../../services/foodService";

import InfoBanner from "./components/InfoBanner";
import SummaryGrid from "./components/SummaryGrid";
import DashboardInventory from "./components/DashboardInventory";

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
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);

      const data = await getFoodSummary();

      setSummary({
        ...defaultSummary,
        ...data,
      });
    } catch (error) {
      console.error("Gagal mengambil ringkasan dashboard:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const refreshDashboard = async () => {
    await fetchSummary();
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
  <AppShell>
    <main className="dashboard-page">
      <InfoBanner user={user} />

      <SummaryGrid summary={summary} loading={summaryLoading} />

      <DashboardInventory
        refreshKey={refreshKey}
        onInventoryChange={refreshDashboard}
      />
    </main>
  </AppShell>
);
}