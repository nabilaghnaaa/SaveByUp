import { useEffect, useState } from 'react';

import InfoBanner from './InfoBanner';
import SummaryGrid from './SummaryGrid';
import DashboardInventory from './DashboardInventory';

import { getFoodSummary } from '../../services/foodService';

import './dashboard.css';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  const [summary, setSummary] = useState({
    total_foods: 0,
    total_aman: 0,
    total_mendekati: 0,
    total_kedaluwarsa: 0,
    total_dibuang: 0,
    total_digunakan: 0,
    total_prioritas_tinggi: 0,
    total_prioritas_sedang: 0,
    total_prioritas_rendah: 0,
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const data = await getFoodSummary();
      setSummary(data);
    } catch (error) {
      console.error('Gagal mengambil data dashboard:', error);
    } finally {
      setLoading(false);
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
    <div className="dashboard-page">
      <div className="dashboard-grid-bg"></div>
      <div className="dashboard-noise"></div>

      <div className="dashboard-background-orb orb-one"></div>
      <div className="dashboard-background-orb orb-two"></div>
      <div className="dashboard-background-orb orb-three"></div>
      <div className="dashboard-background-orb orb-four"></div>

      <div className="dashboard-shell">
        <InfoBanner user={user} />

        {loading ? (
          <div className="dashboard-loading-card">
            <div className="dashboard-spinner"></div>

            <div>
              <h3>Memuat dashboard...</h3>
              <p>Sedang mengambil data inventaris makanan kamu.</p>
            </div>
          </div>
        ) : (
          <>
            <SummaryGrid summary={summary} />

            <DashboardInventory
              refreshKey={refreshKey}
              onInventoryChange={refreshDashboard}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;