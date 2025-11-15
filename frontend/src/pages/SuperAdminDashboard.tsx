// /frontend/src/pages/SuperAdminDashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaFileAlt,
  FaBuilding,
  FaDollarSign,
  FaArrowUp,
  FaSyncAlt,
  FaServer,
  FaDatabase,
  FaPlug,
  FaEye,
  FaShieldAlt,
  FaCreditCard,
  FaEnvelope,
  FaCloud,
  FaUserPlus,
  FaPlusCircle,
  FaChartBar,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle,
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
  getSystemStatus,
  getActivityFeed,
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
interface SystemStatus {
  overview: any;
  services: any;
  lastUpdated: string;
}
interface Activity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}
type ChartJSData = ChartData<'line', number[], string>;

// ============================
// MAIN DASHBOARD COMPONENT
// ============================
const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // --- State Definitions ---
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [userChartData, setUserChartData] = useState<ChartJSData | null>(null);
  const [perfChartData, setPerfChartData] = useState<ChartJSData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('...');

  // --- Data Fetching (UPGRADED with Promise.allSettled) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    
    try {
      // Use Promise.allSettled to ensure all requests finish
      const results = await Promise.allSettled([
        getDashboardStats(),
        getSystemStatus(),
        getActivityFeed(),
        getUserGrowthChart('30d'),
        getSystemPerformanceChart()
      ]);

      let fetchError = false;

      // 1. Stats
      if (results[0].status === 'fulfilled') {
        setStats(results[0].value);
      } else {
        console.error("Failed to load Dashboard Stats:", results[0].reason);
        fetchError = true;
      }

      // 2. System Status
      if (results[1].status === 'fulfilled') {
        setStatus(results[1].value);
        setLastUpdated(new Date(results[1].value.lastUpdated).toLocaleTimeString());
      } else {
        console.error("Failed to load System Status:", results[1].reason);
        fetchError = true;
      }

      // 3. Activity Feed
      if (results[2].status === 'fulfilled') {
        setActivity(results[2].value);
      } else {
        console.error("Failed to load Activity Feed:", results[2].reason);
        fetchError = true;
      }

      // 4. User Growth Chart
      if (results[3].status === 'fulfilled') {
        const userChart = results[3].value;
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
      } else {
        console.error("Failed to load User Growth Chart:", results[3].reason);
        fetchError = true;
      }

      // 5. Performance Chart
      if (results[4].status === 'fulfilled') {
        const perfChart = results[4].value;
        setPerfChartData({
          labels: perfChart.labels,
          datasets: perfChart.datasets.map((ds: any) => ({
            ...ds,
            fill: false,
            borderWidth: 2,
            tension: 0.4,
          }))
        });
      } else {
        console.error("Failed to load Performance Chart:", results[4].reason);
        fetchError = true;
      }

      if (fetchError) {
        setError('One or more dashboard components failed to load. Check console for details.');
      }

    } catch (err) {
      console.error("Catastrophic failure in fetchData:", err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array, runs once on mount

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Render Functions ---
  const renderStatusIcon = (serviceStatus: string) => {
    if (serviceStatus === 'Operational') return <FaCheckCircle className="text-green-500" />;
    if (serviceStatus === 'Maintenance') return <FaExclamationTriangle className="text-yellow-500" />;
    return <FaExclamationTriangle className="text-red-500" />;
  };

  const renderActivityIcon = (action: string) => {
    if (action.includes('org_')) return <FaBuilding className="text-blue-600" />;
    if (action.includes('admin_')) return <FaUserPlus className="text-green-600" />;
    if (action.includes('exam_')) return <FaFileAlt className="text-purple-600" />;
    return <FaCog className="text-gray-600" />;
  };

  // --- Loading State ---
  if (loading && !stats) {
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
        <CircularProgress />
      </Box>
    );
  }

  // --- Main Render ---
  return (
    <Box>
      {error && (
        <Alert severity="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* System Status Overview */}
      {status ? (
        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <Box className="flex items-center justify-between mb-6">
            <Typography variant="h6" className="font-semibold text-gray-900">System Status Overview</Typography>
            <Box className="flex items-center space-x-2">
              <IconButton
                className="text-gray-600 hover:text-blue-600 p-2"
                onClick={fetchData}
                disabled={loading}
              >
                <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              </IconButton>
              <span className="text-sm text-gray-500">
                Last updated: <span id="last-updated">{lastUpdated}</span>
              </span>
            </Box>
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatusCard 
              icon={<FaServer />}
              name="Web Server" 
              status={status.overview.webServer.status} 
              data={status.overview.webServer} 
            />
            <StatusCard 
              icon={<FaDatabase />}
              name="Database" 
              status={status.overview.database.status} 
              data={status.overview.database} 
            />
            <StatusCard 
              icon={<FaPlug />}
              name="API Services" 
              status={status.overview.api.status} 
              data={status.overview.api} 
            />
            <StatusCard 
              icon={<FaEye />}
              name="AI Proctoring" 
              status={status.overview.aiProctoring.status} 
              data={status.overview.aiProctoring} 
            />
          </Box>
        </Paper>
      ) : (
        <Alert severity="warning" className="mb-8">System Status module is loading or failed to load.</Alert>
      )}

      {/* Analytics Cards */}
      {stats ? (
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
        <Alert severity="warning" className="mb-8">Key Metrics module is loading or failed to load.</Alert>
      )}

      {/* Charts Section */}
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-6">User Growth (30 Days)</Typography>
          <Box className="chart-container h-80">
            {userChartData ? (
              <Line data={userChartData} options={chartOptions('New Users', false)} />
            ) : (
              <Box className="flex justify-center items-center h-full"><CircularProgress /></Box>
            )}
          </Box>
        </Paper>
        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-6">System Performance</Typography>
          <Box className="chart-container h-80">
            {perfChartData ? (
              <Line data={perfChartData} options={chartOptions('System Performance', true)} />
            ) : (
              <Box className="flex justify-center items-center h-full"><CircularProgress /></Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Recent Activity & Quick Actions */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Paper className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <Box className="flex items-center justify-between mb-6">
            <Typography variant="h6" className="font-semibold text-gray-900">Recent Activity</Typography>
            <Button size="small" onClick={() => navigate('/superadmin/activity-log')}>
              View All
            </Button>
          </Box>
          <Box className="space-y-4">
            {activity.length > 0 ? activity.map(item => (
              <Box key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Box className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {renderActivityIcon(item.action)}
                </Box>
                <Box className="flex-1">
                  <Typography className="font-medium text-gray-900">{item.action.replace(/_/g, ' ').toUpperCase()}</Typography>
                  <Typography className="text-sm text-gray-600">{item.details}</Typography>
                  <Typography className="text-xs text-gray-500 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )) : (
              <Typography className="text-gray-500">
                {loading ? 'Loading activity...' : 'No recent activity.'}
              </Typography>
            )}
          </Box>
        </Paper>

        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-6">Quick Actions</Typography>
          <Box className="space-y-3">
            <ActionButton 
              icon={<FaPlusCircle />} 
              text="Create New Quiz"
              color="blue"
              onClick={() => navigate('/superadmin/guest-quizzes/new')}
            />
            <ActionButton 
              icon={<FaUserPlus />} 
              text="Add Organization"
              color="green"
              onClick={() => navigate('/superadmin/organizations')}
            />
            <ActionButton 
              icon={<FaChartBar />} 
              text="View Reports"
              color="purple"
              onClick={() => navigate('/superadmin/analytics')}
            />
            <ActionButton 
              icon={<FaServer />} 
              text="System Health"
              color="orange"
              onClick={() => navigate('/superadmin/system-status')}
            />
            <ActionButton 
              icon={<FaCog />} 
              text="System Settings"
              color="gray"
              onClick={() => navigate('/superadmin/settings')}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

// ============================
// INTERNAL HELPER COMPONENTS
// ============================

const StatusCard: React.FC<{ icon: React.ReactElement; name: string; status: string; data: any }> = 
  ({ icon, name, status, data }) => {
    const styles = getStatusStyles(status);

    return (
      <Box className="bg-gray-50 rounded-lg p-4">
        <Box className="flex items-center justify-between mb-3">
          <Box className="flex items-center space-x-2">
            {React.cloneElement(icon, { className: 'text-gray-600' })}
            <span className="font-medium text-gray-900">{name}</span>
          </Box>
          <Box className="flex items-center space-x-2">
            <Box className={`w-3 h-3 ${styles.dot} rounded-full status-indicator`}></Box>
            <span className={`text-sm font-medium ${styles.text}`}>{status}</span>
          </Box>
        </Box>
        <Box className="space-y-2 text-sm">
          {Object.entries(data).filter(([key, value]) => key !== 'status' && value).map(([key, value]) => (
            <Box key={key} className="flex justify-between">
              <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-medium text-gray-900">{String(value)}</span>
            </Box>
          ))}
        </Box>
      </Box>
    );
};

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

const ActionButton: React.FC<{ icon: React.ReactElement; text: string; color: string; onClick: () => void; }> =
  ({ icon, text, color, onClick }) => (
  <Button
    onClick={onClick}
    fullWidth
    variant="contained"
    className={`flex items-center justify-start space-x-3 p-4 transition-colors rounded-lg`}
    sx={{ 
      backgroundColor: (theme) => {
        const lightColor = (theme.palette as any)[color]?.light || '#f3f4f6'; // Fallback to gray
        return `${lightColor}20`; // e.g., blue-50 (hex with alpha)
      },
      color: (theme) => (theme.palette as any)[color]?.dark || '#374151',
      '&:hover': {
        backgroundColor: (theme) => {
          const mainColor = (theme.palette as any)[color]?.main || '#e5e7eb';
          return `${mainColor}40`; // e.g., blue-100 (hex with alpha)
        },
        boxShadow: 'none',
      },
      boxShadow: 'none',
      textTransform: 'none',
      justifyContent: 'flex-start',
      fontWeight: 500,
    }}
  >
    {React.cloneElement(icon, { className: `text-${color}-600` })}
    <span className={`font-medium text-${color}-600`}>{text}</span>
  </Button>
);

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
          if (showLegend) return value + '%';
          return value;
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

// Helper function to define status colors
const getStatusStyles = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === 'operational' || normalizedStatus === 'active') {
    return {
      dot: 'bg-green-500',
      text: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
    };
  }
  if (normalizedStatus === 'maintenance') {
    return {
      dot: 'bg-yellow-500',
      text: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    };
  }
  return { // Default to 'Error' or 'Offline'
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    iconBg: 'bg-red-100',
  };
};

export default SuperAdminDashboard;