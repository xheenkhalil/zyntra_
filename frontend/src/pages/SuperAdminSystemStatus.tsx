// /frontend/src/pages/SuperAdminSystemStatus.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Button,
} from '@mui/material';
// We'll use the API function from our service file
import { getSystemStatus } from '../services/superAdminService';
import {
  FaSyncAlt,
  FaServer,
  FaDatabase,
  FaPlug,
  FaEye,
  FaShieldAlt,
  FaFileAlt,
  FaCreditCard,
  FaEnvelope,
  FaCloud,
} from 'react-icons/fa';

// --- Type Definitions for our API data ---
interface StatusOverview {
  status: string;
  uptime?: string;
  responseTime?: string;
  load?: string;
  connections?: string;
  queryTime?: string;
  storage?: string;
  endpoints?: string;
  rateLimit?: string;
  activeSessions?: number;
}

interface ServiceDetail {
  name: string;
  status: string;
  details?: string;
  uptime?: string;
}

interface SystemStatusReport {
  overview: {
    webServer: StatusOverview;
    database: StatusOverview;
    api: StatusOverview;
    aiProctoring: StatusOverview;
  };
  services: {
    authentication: ServiceDetail;
    examEngine: ServiceDetail;
    paymentGateway: ServiceDetail;
    emailService: ServiceDetail;
    fileStorage: ServiceDetail;
  };
  lastUpdated: string;
}

// --- Helper function to get styling from status ---
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

// ============================
// MAIN PAGE COMPONENT
// ============================
const SuperAdminSystemStatus: React.FC = () => {
  const [statusReport, setStatusReport] = useState<SystemStatusReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('...');

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSystemStatus();
      setStatusReport(data);
      setLastUpdated(new Date(data.lastUpdated).toLocaleString());
    } catch (err: unknown) {
      // Narrow the unknown error and extract response data if present
      let message = 'Failed to fetch system status.';
      let responseData: SystemStatusReport | null = null;

      type ErrorWithResponse = { response?: { data?: unknown } };

      if (typeof err === 'object' && err !== null && 'response' in err) {
        const maybeErr = err as ErrorWithResponse;
        const data = maybeErr.response?.data;
        if (data && typeof data === 'object') {
          // safely extract message if present and a string
          const maybeMessage = (data as { message?: unknown }).message;
          if (typeof maybeMessage === 'string') {
            message = maybeMessage;
          }
          // attempt to assign responseData if the shape matches
          responseData = data as SystemStatusReport;
        }
      }

      setError(message);
      setStatusReport(responseData); // Still try to set data if server sent a 503
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (loading && !statusReport) {
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !statusReport) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchStatus} variant="contained" className="mt-4">
          Retry
        </Button>
      </Box>
    );
  }

  if (!statusReport) {
    return <Alert severity="info">No system status data available.</Alert>;
  }

  return (
    <Box>
      {/* --- Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-bold text-gray-900">
          System Health Status
        </Typography>
      </Box>

      {/* --- 1. System Status Overview --- */}
      <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <Box className="flex items-center justify-between mb-6">
          <Typography variant="h6" className="font-semibold text-gray-900">
            System Status Overview
          </Typography>
          <Box className="flex items-center space-x-2">
            <IconButton
              className="text-gray-600 hover:text-blue-600 p-2"
              onClick={fetchStatus}
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
          <OverviewCard
            icon={<FaServer />}
            name="Web Server"
            status={statusReport.overview.webServer.status}
            metrics={statusReport.overview.webServer}
          />
          <OverviewCard
            icon={<FaDatabase />}
            name="Database"
            status={statusReport.overview.database.status}
            metrics={statusReport.overview.database}
          />
          <OverviewCard
            icon={<FaPlug />}
            name="API Services"
            status={statusReport.overview.api.status}
            metrics={statusReport.overview.api}
          />
          <OverviewCard
            icon={<FaEye />}
            name="AI Proctoring"
            status={statusReport.overview.aiProctoring.status}
            metrics={statusReport.overview.aiProctoring}
          />
        </Box>
      </Paper>

      {/* --- 2. Detailed Service Status --- */}
      <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <Typography variant="h6" className="font-semibold text-gray-900 mb-6">
          Service Details
        </Typography>
        <Box className="space-y-4">
          <ServiceDetailItem
            icon={<FaShieldAlt />}
            service={statusReport.services.authentication}
          />
          <ServiceDetailItem
            icon={<FaFileAlt />}
            service={statusReport.services.examEngine}
          />
          <ServiceDetailItem
            icon={<FaCreditCard />}
            service={statusReport.services.paymentGateway}
          />
          <ServiceDetailItem
            icon={<FaEnvelope />}
            service={statusReport.services.emailService}
          />
          <ServiceDetailItem
            icon={<FaCloud />}
            service={statusReport.services.fileStorage}
          />
        </Box>
      </Paper>
    </Box>
  );
};

// ============================
// INTERNAL HELPER COMPONENTS
// ============================

// --- 1. Component for the 4 Overview Cards ---
interface OverviewCardProps {
  icon: React.ReactElement;
  name: string;
  status: string;
  metrics: StatusOverview;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ icon, name, status, metrics }) => {
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
      <Box className="space-y-2 text-sm">
        {Object.entries(metrics)
          .filter(([key, value]) => key !== 'status' && value !== undefined && value !== null && value !== '')
          .map(([key, value]) => (
            <Box key={key} className="flex justify-between">
              <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-medium text-gray-900">{String(value)}</span>
            </Box>
          ))}
      </Box>
      </Box>
    </Box>
  );
};

// --- 2. Component for the Detailed Service List ---
interface ServiceDetailItemProps {
  icon: React.ReactElement;
  service: ServiceDetail;
}

const ServiceDetailItem: React.FC<ServiceDetailItemProps> = ({ icon, service }) => {
  const styles = getStatusStyles(service.status);

  return (
    <Box className={`flex items-center justify-between p-4 ${styles.bg} rounded-lg border ${styles.border}`}>
      <Box className="flex items-center space-x-4">
        <Box className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {React.cloneElement(icon, { className: styles.icon })}
        </Box>
        <Box>
          <Typography className="font-semibold text-gray-900">{service.name}</Typography>
          <Typography className="text-sm text-gray-600">
            {service.details || `Uptime: ${service.uptime || 'N/A'}`}
          </Typography>
        </Box>
      </Box>
      <Box className="flex items-center space-x-3">
        <span className={`px-3 py-1 ${styles.iconBg} ${styles.text} text-sm font-medium rounded-full`}>
          {service.status}
        </span>
      </Box>
    </Box>
  );
};

export default SuperAdminSystemStatus;