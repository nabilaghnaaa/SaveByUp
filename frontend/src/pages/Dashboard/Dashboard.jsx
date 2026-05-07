import { useEffect, useState } from 'react';
import API from '../../services/api';

import DashboardHeader from './DashboardHeader';
import InfoBanner from './InfoBanner';
import SummaryGrid from './SummaryGrid';
import PrioritySection from './PrioritySection';
import FeatureSection from './FeatureSection';
import './dashboard.css';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  const [summary, setSummary] = useState({
    total_foods: 0,
    total_aman: 0,
    total_mendekati: 0,
    total_kedaluwarsa: 0,
    total_prioritas_tinggi: 0,
    total_prioritas_sedang: 0,
    total_prioritas_rendah: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response = await API.get('/foods/summary');
      const data = response.data.data || {};

      setSummary({
        total_foods: data.total_foods || 0,
        total_aman: data.total_aman || 0,
        total_mendekati: data.total_mendekati || 0,
        total_kedaluwarsa: data.total_kedaluwarsa || 0,
        total_prioritas_tinggi: data.total_prioritas_tinggi || 0,
        total_prioritas_sedang: data.total_prioritas_sedang || 0,
        total_prioritas_rendah: data.total_prioritas_rendah || 0,
      });
    } catch (error) {
      console.error('Gagal mengambil data dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-background-orb orb-one"></div>
      <div className="dashboard-background-orb orb-two"></div>
      <div className="dashboard-background-orb orb-three"></div>

      <div className="dashboard-shell">
        <DashboardHeader user={user} />

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
            <PrioritySection summary={summary} />
            <FeatureSection />
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;