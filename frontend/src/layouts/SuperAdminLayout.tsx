// frontend/src/components/SuperAdminLayout.tsx

import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
// --- FIX: Corrected import paths to match your file names ---
import SuperAdminSidebar from '../components/superAdminSidebar'; 
import SuperAdminHeader from '../components/SuperAdminHeader';   // This is a new file

const SuperAdminLayout: React.FC = () => {
    // State for desktop sidebar collapse
    const [isCollapsed, setIsCollapsed] = useState(false);
    // State for mobile sidebar open/close
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Toggle for desktop
    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Toggle for mobile
    const handleToggleMobile = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    // Close mobile sidebar (e.g., when overlay is clicked)
    const handleMobileClose = () => {
        setIsMobileOpen(false);
    };

    return (
        <Box className="flex bg-gray-50 min-h-screen">
            <CssBaseline />

            {/* 1. The new Sidebar component */}
            <SuperAdminSidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                onMobileClose={handleMobileClose}
            />

            {/* 2. The main content area */}
            <Box
                component="div"
                id="main-content"
                // This applies the correct margin-left based on sidebar state
                // It uses the classes from your new index.css
                className={`flex-1 transition-all duration-300 ${
                    isCollapsed ? 'main-content-collapsed lg:ml-[80px]' : 'main-content-expanded lg:ml-[280px]'
                }`}
            >
                {/* 3. The new Header component */}
                <SuperAdminHeader
                    onToggleCollapse={handleToggleCollapse}
                    onToggleMobile={handleToggleMobile}
                />
                
                {/* 4. The page content (Dashboard, Users, etc.) */}
                <Box component="main" className="p-6">
                    <Outlet />
                </Box>
            </Box>

            {/* Mobile Overlay */}
            <Box
                id="mobile-overlay"
                onClick={handleMobileClose}
                // These classes are from your new index.css
                className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
                    isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
            />
        </Box>
    );
};

export default SuperAdminLayout;