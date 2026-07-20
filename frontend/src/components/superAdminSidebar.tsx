// frontend/src/components/superAdminSidebar.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  FaChartLine,
  FaPlusCircle,
  FaUsers,
  FaChartBar,
  FaBuilding,
  FaServer,
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
  FaCertificate
} from 'react-icons/fa';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

// Reusable NavLink component to handle styles
// --- FIX: The type for 'icon' is simplified and the component logic is safer ---
const NavItem: React.FC<{ 
  to: string; 
  icon: React.ReactElement; // Simplified type
  text: string; 
  isCollapsed: boolean; 
  onClick: () => void 
}> = ({ to, icon, text, isCollapsed, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      end // Ensures parent routes don't stay active if sub-routes are active
      className={({ isActive }) =>
        `nav-item flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${
          isActive ? 'active' : ''
        }`
      }
      style={{ textDecoration: 'none' }} // Ensure no underline
    >
      {/* --- THIS IS THE FIX ---
        We wrap the icon in a styled 'span' instead of cloning it.
        This is type-safe and guarantees our styles apply without error.
      */}
      <Box 
        component="span" 
        className="text-lg flex-shrink-0 w-6 text-center" // w-6 gives a consistent icon width
      >
         {icon}
      </Box>
      {/* --------------------- */}

      <span
        className={`nav-text transition-opacity duration-200 ${
          isCollapsed ? 'lg:opacity-0 lg:w-0' : 'lg:opacity-100 lg:w-auto'
        } whitespace-nowrap overflow-hidden`}
      >
        {text}
      </span>
    </NavLink>
);

const SuperAdminSidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobileOpen, onMobileClose }) => {
  const { logout } = useAuth();

  return (
    <Box
      id="sidebar"
      component="aside"
      className={`fixed left-0 top-0 h-full bg-[#111A50] text-white shadow-2xl transition-all duration-300 z-40 ${
        isCollapsed ? 'sidebar-collapsed lg:w-[80px]' : 'sidebar-expanded lg:w-[280px]'
      } ${
        isMobileOpen ? 'mobile-open translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Logo Section */}
      <Box className="p-6 border-b border-blue-700">
        <Box className="flex items-center space-x-3">
          <Box className="w-10 h-10 bg-[#111A50] rounded-lg flex items-center justify-center flex-shrink-0">
            <FaGraduationCap className="text-white text-xl" />
          </Box>
          <Box
            id="logo-text"
            className={`transition-opacity duration-300 ${
              isCollapsed ? 'lg:opacity-0' : 'lg:opacity-100'
            }`}
          >
            <Typography variant="h1" className="text-xl font-bold text-white">
              ZYNTRA
            </Typography>
            <Typography className="text-blue-200 text-xs">
              Admin Dashboard
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box component="nav" className="mt-6 px-4 flex flex-col justify-between h-[calc(100%-160px)]">
        <Box className="space-y-2">
          <NavItem
            to="/superadmin" // Dashboard
            icon={<FaChartLine />}
            text="Dashboard"
            isCollapsed={isCollapsed}
            onClick={onMobileClose}
          />
          <NavItem
            to="/superadmin/guest-quizzes"
            icon={<FaPlusCircle />}
            text="Guest Quizzes"
            isCollapsed={isCollapsed}
            onClick={onMobileClose}
          />
          <NavItem
            to="/superadmin/certifications"
            icon={<FaCertificate />}
            text="Certifications"
            isCollapsed={isCollapsed}
            onClick={onMobileClose}
          />
          <NavItem
            to="/superadmin/users"
            icon={<FaUsers />}
            text="Users"
            isCollapsed={isCollapsed}
            onClick={onMobileClose}
          />
          <NavItem
            to="/superadmin/analytics"
            icon={<FaChartBar />}
            text="Analytics"
            isCollapsed={isCollapsed}
            onClick={onMobileClose}
          />
          <NavItem
            to="/superadmin/organizations"
            icon={<FaBuilding />}
            text="Organizations"
            isCollapsed={isCollapsed}
            onClick={onMobileClose}
          />
          <NavItem
            to="/superadmin/system-status"
            icon={<FaServer />}
            text="System Status"
            isCollapsed={isCollapsed}
            onClick={onMobileClose}
          />
        </Box>

        {/* Settings Section (at the bottom) */}
        <Box>
          <Box className="border-t border-blue-700 pt-4">
            <NavItem
              to="/superadmin/settings"
              icon={<FaCog />}
              text="Settings"
              isCollapsed={isCollapsed}
              onClick={onMobileClose}
            />
            {/* Logout is a button, not a NavLink */}
            <div 
              onClick={logout}
              className="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer text-sm font-medium"
            >
              <Box 
                component="span" 
                className="text-lg flex-shrink-0 w-6 text-center"
              >
                <FaSignOutAlt />
              </Box>
              <span
                className={`nav-text transition-opacity duration-200 ${
                  isCollapsed ? 'lg:opacity-0 lg:w-0' : 'lg:opacity-100 lg:w-auto'
                } whitespace-nowrap overflow-hidden`}
              >
                Logout
              </span>
            </div>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SuperAdminSidebar;