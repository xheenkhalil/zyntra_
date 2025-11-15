// frontend/src/components/SuperAdminHeader.tsx

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useAuth } from '../context/useAuth';
import { FaBars, FaBell } from 'react-icons/fa';

// This is a placeholder component for the System Status.
// We will make this fetch from our /api/system/status endpoint later.
const SystemStatusBadge: React.FC = () => {
  const status = 'Operational'; // 'Operational', 'Degraded', 'Error'
  const text = 'All Systems Operational';

  const getStatusClass = () => {
    if (status === 'Operational') return 'bg-green-500';
    if (status === 'Degraded') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Box className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
      <Box className={`w-3 h-3 ${getStatusClass()} rounded-full status-indicator`}></Box>
      <Typography component="span" className="text-green-700 text-sm font-medium">
        {text}
      </Typography>
    </Box>
  );
};

interface HeaderProps {
  onToggleCollapse: () => void;
  onToggleMobile: () => void;
}

const SuperAdminHeader: React.FC<HeaderProps> = ({ onToggleCollapse, onToggleMobile }) => {
  const { user } = useAuth(); // Get user info

  return (
    <Box
      component="header"
      className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
    >
      <Box className="flex items-center justify-between">
        {/* Left Side: Toggles & Title */}
        <Box className="flex items-center space-x-4">
          {/* Mobile Toggle (lg:hidden) */}
          <IconButton
            id="sidebar-toggle"
            onClick={onToggleMobile}
            className="lg:hidden text-gray-600 hover:text-blue-600 p-2"
          >
            <FaBars className="text-xl" />
          </IconButton>
          
          {/* Desktop Toggle (hidden lg:block) */}
          <IconButton
            id="sidebar-collapse"
            onClick={onToggleCollapse}
            className="hidden lg:block text-gray-600 hover:text-blue-600 p-2"
          >
            <FaBars className="text-xl" />
          </IconButton>

          {/* Page Title (This will be dynamic later) */}
          <Box>
            <Typography
              variant="h2"
              className="text-2xl font-bold text-gray-900"
            >
              Dashboard Overview
            </Typography>
            <Typography className="text-gray-600">
              Welcome back, {user?.fullName || 'Admin'}
            </Typography>
          </Box>
        </Box>

        {/* Right Side: Status, Notifications, User Menu */}
        <Box className="flex items-center space-x-4">
          {/* System Status Indicator (Dynamic) */}
          <Box className="hidden md:block">
            <SystemStatusBadge />
          </Box>

          {/* Notification Bell (Static) */}
          <IconButton className="relative p-2 text-gray-600 hover:text-blue-600">
            <FaBell className="text-xl" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </IconButton>

          {/* User Menu */}
          <Box className="flex items-center space-x-3">
            <img
              src={
                // In a real app, you'd have a user.profilePictureUrl
                `https://ui-avatars.com/api/?name=${user?.fullName || 'Admin'}&background=3b82f6&color=fff`
              }
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
            <Box className="hidden md:block">
              <Typography className="font-semibold text-gray-900">
                {user?.fullName || 'John Admin'}
              </Typography>
              <Typography className="text-sm text-gray-600 capitalize">
                {user?.role ? user.role.replace('superadmin', 'Super Administrator') : 'Super Administrator'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SuperAdminHeader;