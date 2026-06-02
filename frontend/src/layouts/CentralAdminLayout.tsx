import React, { useState } from "react";
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import {
    FaTachometerAlt,
    FaUserTie,
    FaUsers,
    FaBook,
    FaHistory,
    FaCog,
    FaSignOutAlt,
    FaGraduationCap,
    FaBars
} from 'react-icons/fa';

const SIDEBAR_WIDTH_EXPANDED = '16rem'; // 256px
const SIDEBAR_WIDTH_COLLAPSED = '5rem'; // 80px

// --- Helper Component for Nav Items ---
const NavItem: React.FC<{ to: string; icon: React.ReactElement; text: string; isCollapsed: boolean; onClick: () => void }> =
    ({ to, icon, text, isCollapsed, onClick }) => (
        <NavLink
            to={to}
            onClick={onClick}
            end
            className={({ isActive }) =>
                `nav-item flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium ${isActive ? 'active' : ''
                }`
            }
            style={{ textDecoration: 'none' }}
        >
            <Box component="span" className="text-lg flex-shrink-0 w-6 text-center">
                {icon}
            </Box>
            <span
                className={`nav-text transition-opacity duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'lg:opacity-100 lg:w-auto'
                    } whitespace-nowrap overflow-hidden`}
            >
                {text}
            </span>
        </NavLink>
    );


const CentralAdminLayout: React.FC = () => {
    const { logout, user } = useAuth();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const currentWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

    const handleToggleCollapse = () => setIsCollapsed((prev) => !prev);
    const handleToggleMobile = () => setIsMobileOpen((prev) => !prev);
    const handleMobileClose = () => setIsMobileOpen(false);

    return (
        <Box className="flex bg-gray-50 min-h-screen">

            {/* === 1. SIDEBAR === */}
            <Box
                id="sidebar"
                component="aside"
                className={`fixed left-0 top-0 h-full bg-[#1A1F91] text-white shadow-2xl transition-all duration-300 z-40 ${isCollapsed ? 'sidebar-collapsed lg:w-20' : 'sidebar-expanded lg:w-64'
                    } ${isMobileOpen ? 'mobile-open translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                {/* Logo/Header Section */}
                <Box className="flex items-center justify-between p-4 border-b border-blue-700">
                    <Box className="flex items-center space-x-3">
                        <Box className="w-8 h-8 bg-[#1A1F91] rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaGraduationCap className="text-white text-lg" />
                        </Box>
                        <span id="logo-text" className={`text-xl font-bold transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            ZYNTRA
                        </span>
                    </Box>
                    {/* Toggle Button inside Sidebar (Visible on Desktop) */}
                    <IconButton
                        onClick={handleToggleCollapse}
                        className="hidden lg:flex text-white hover:bg-blue-700"
                        size="small"
                    >
                        <FaBars />
                    </IconButton>
                    {/* Mobile Close Button */}
                    <IconButton
                        onClick={handleToggleMobile}
                        className="lg:hidden text-white hover:bg-blue-700"
                        size="small"
                    >
                        <FaBars />
                    </IconButton>
                </Box>

                {/* Navigation Menu */}
                <Box component="nav" className="mt-6 px-3 flex flex-col justify-between h-[calc(100%-80px)]">
                    <div className="space-y-2">
                        <NavItem to="/centraladmin" icon={<FaTachometerAlt />} text="Dashboard" isCollapsed={isCollapsed} onClick={handleMobileClose} />
                        <NavItem to="/centraladmin/admins" icon={<FaUserTie />} text="Course Admins" isCollapsed={isCollapsed} onClick={handleMobileClose} />
                        <NavItem to="/centraladmin/users" icon={<FaUsers />} text="Users" isCollapsed={isCollapsed} onClick={handleMobileClose} />
                        <NavItem to="/centraladmin/exams" icon={<FaBook />} text="Exams" isCollapsed={isCollapsed} onClick={handleMobileClose} />
                        <NavItem to="/centraladmin/logs" icon={<FaHistory />} text="Activity Logs" isCollapsed={isCollapsed} onClick={handleMobileClose} />
                    </div>

                    {/* Settings and Logout */}
                    <div className="border-t border-blue-700 pt-4 pb-4">
                        <NavItem to="/centraladmin/settings" icon={<FaCog />} text="Settings" isCollapsed={isCollapsed} onClick={handleMobileClose} />

                        <div
                            onClick={logout}
                            className="nav-item flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer text-sm font-medium hover:bg-blue-700 text-blue-100 hover:text-white transition-all duration-200"
                        >
                            <Box component="span" className="text-lg flex-shrink-0 w-6 text-center">
                                <FaSignOutAlt />
                            </Box>
                            <span className={`nav-text transition-opacity duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'lg:opacity-100'} whitespace-nowrap overflow-hidden`}>
                                Logout
                            </span>
                        </div>
                    </div>
                </Box>
            </Box>

            {/* Mobile Overlay */}
            <Box
                onClick={handleMobileClose}
                className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
            />

            {/* === 2. MAIN CONTENT === */}
            <Box
                component="div"
                className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
            >
                {/* Top Header */}
                <AppBar
                    position="static"
                    className="bg-white shadow-sm border-b border-gray-200"
                    sx={{ ml: { sm: currentWidth }, backgroundColor: 'white', color: 'black' }}
                >
                    <Toolbar className="h-16 flex justify-between items-center px-4">
                        {/* Mobile Toggle Button (Header) */}
                        <IconButton onClick={handleToggleMobile} className="lg:hidden text-gray-600">
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" className="text-lg sm:text-xl font-bold text-gray-900 flex-grow ml-2 lg:ml-0">
                            Client Admin Portal
                        </Typography>

                        <Box className="flex items-center space-x-3">
                            <Typography className="text-gray-600 text-sm hidden sm:block">
                                {user?.fullName || 'Admin'}
                            </Typography>
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.fullName || 'C A'}&background=3b82f6&color=fff`}
                                alt="Profile"
                                className="w-8 h-8 rounded-full"
                            />
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page Content Outlet */}
                <Box component="main" className="p-4 sm:p-6">
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default CentralAdminLayout;
