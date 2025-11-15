// /frontend/src/pages/SuperAdminAnalytics.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  FaUsers,
  FaFileAlt,
  FaBuilding,
  FaDollarSign,
  FaArrowUp,
} from 'react-icons/fa';

// --- 1. Import Chart.js components ---
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartData } from 'chart.js';

// --- 2. Register Chart.js components ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- 3. Import API Services ---
import {
  getDashboardStats,
  getUserGrowthChart,
  getSystemPerformanceChart
} from '../services/superAdminService';

// --- Type Definitions ---
interface StatCard {
  value: number;
  change: string;
}
interface DashboardStats {
  totalUsers: StatCard;
  activeExams: StatCard;
  organizations: StatCard;
  monthlyRevenue: StatCard;
}
type ChartJSData = ChartData<'line', number[], string>;
type TimeRange = '7d' | '30d' | '90d';

// ============================
// MAIN ANALYTICS PAGE COMPONENT
// ============================
const SuperAdminAnalytics: React.FC = () => {
  // --- State Definitions ---
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userChartData, setUserChartData] = useState<ChartJSData | null>(null);
  const [perfChartData, setPerfChartData] = useState<ChartJSData | null>(null);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [error, setError] = useState('');

  // --- Data Fetching ---

  // 1. Fetch the 4 main stat cards (runs once on page load)
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const statsData = await getDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError('Failed to load key metrics.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch chart data (runs when 'timeRange' changes)
  const fetchChartData = useCallback(async (range: TimeRange) => {
    setLoadingCharts(true);
    try {
      // Fetch both charts in parallel
      const [userChart, perfChart] = await Promise.all([
        getUserGrowthChart(range),
        getSystemPerformanceChart() // This one is not time-based
      ]);

      // Set User Growth chart data
      setUserChartData({
        labels: userChart.labels,
        datasets: [{
            label: 'New Users',
            data: userChart.data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
      });

      // Set System Performance chart data (from mock)
      setPerfChartData({
        labels: perfChart.labels,
        datasets: perfChart.datasets.map((ds: any) => ({
          ...ds,
          fill: false,
          borderWidth: 2,
          tension: 0.4,
        }))
      });
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError('Failed to load charts.');
    } finally {
      setLoadingCharts(false);
    }
  }, []);

  // --- Initial Data Load ---
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchChartData(timeRange);
  }, [fetchChartData, timeRange]);

  // --- Handlers ---
    const handleTimeRangeChange = (
      _event: React.MouseEvent<HTMLElement>,
      newRange: TimeRange | null
    ) => {
      if (newRange) {
        setTimeRange(newRange);
      }
    };

  // --- Main Render ---
  return (
    <Box>
      {/* --- Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-bold text-gray-900">
          Analytics & Reports
        </Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          color="primary"
          size="small"
        >
          <ToggleButton value="7d">7 Days</ToggleButton>
          <ToggleButton value="30d">30 Days</ToggleButton>
          <ToggleButton value="90d">90 Days</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* --- Metric Cards --- */}
      {loadingStats ? (
        <Box className="flex justify-center p-8"><CircularProgress /></Box>
      ) : stats ? (
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={stats.totalUsers.value.toLocaleString()}
            change={stats.totalUsers.change}
            icon={<FaUsers />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Active Exams"
            value={stats.activeExams.value.toLocaleString()}
            change={stats.activeExams.change}
            icon={<FaFileAlt />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <MetricCard
            title="Organizations"
            value={stats.organizations.value.toLocaleString()}
            change={stats.organizations.change}
            icon={<FaBuilding />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.value.toLocaleString()}`}
            change={stats.monthlyRevenue.change}
            icon={<FaDollarSign />}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />
        </Box>
      ) : (
        <Alert severity="error">Could not load key metrics.</Alert>
      )}

      {/* --- Charts Section --- */}
      {error && <Alert severity="error" className="mb-6">{error}</Alert>}
      
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-6">
            User Growth ({timeRange})
          </Typography>
          <Box className="chart-container h-80">
            {loadingCharts || !userChartData ? (
              <Box className="flex justify-center items-center h-full"><CircularProgress /></Box>
            ) : (
              <Line data={userChartData} options={chartOptions('New Users', false)} />
            )}
          </Box>
        </Paper>
        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-6">
            System Performance (24h)
          </Typography>
          <Box className="chart-container h-80">
            {loadingCharts || !perfChartData ? (
              <Box className="flex justify-center items-center h-full"><CircularProgress /></Box>
            ) : (
              <Line data={perfChartData} options={chartOptions('System Performance', true)} />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Add more charts here as needed, e.g., Revenue, Exam Completions */}
      
    </Box>
  );
};

// ============================
// INTERNAL HELPER COMPONENTS
// ============================

// --- Metric Card (from Dashboard) ---
const MetricCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactElement; iconBg: string; iconColor: string; }> = 
  ({ title, value, change, icon, iconBg, iconColor }) => (
  <Paper className="metric-card bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <Box className="flex items-center justify-between">
      <Box>
        <Typography className="text-gray-600 text-sm font-medium">{title}</Typography>
        <Typography className="text-3xl font-bold text-gray-900 mt-2">{value}</Typography>
        <Typography className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          <FaArrowUp className="inline-block mr-1" /> {change}
        </Typography>
      </Box>
      <Box className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
        {React.cloneElement(icon, { className: `${iconColor} text-xl` })}
      </Box>
    </Box>
  </Paper>
);

// --- Chart.js Options (from Dashboard) ---
const chartOptions = (title: string, showLegend: boolean) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: showLegend,
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
      },
    },
    title: {
      display: false,
      text: title,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        callback: (value: number | string) => {
          if (showLegend) return value + '%'; // For performance chart
          return value; // For user chart
        },
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
});

export default SuperAdminAnalytics;