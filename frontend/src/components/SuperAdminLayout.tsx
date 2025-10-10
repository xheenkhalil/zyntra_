import React, { useState } from 'react';
import {
    Box,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from './superAdminSidebar';
import { useAuth } from '../context/useAuth';

const SuperAdminLayout: React.FC = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const handleToggleSidebar = () => setCollapsed((prev) => !prev);
    const sidebarWidth = collapsed ? 70 : 240;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* Sidebar */}
            <SuperAdminSidebar collapsed={collapsed} onToggle={handleToggleSidebar} />

            {/* Top Navbar */}
            <AppBar
                position="fixed"
                sx={{
                    width: `calc(100% - ${sidebarWidth}px)`,
                    ml: `${sidebarWidth}px`,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: '#0D47A1',
                    transition: 'width 0.3s ease, margin-left 0.3s ease',
                    boxShadow: '0px 3px 10px rgba(0,0,0,0.3)',
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography
                        variant="h5"
                        noWrap
                        sx={{
                            color: '#FFFFFF',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Zyntra Super Admin Dashboard
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user && (
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#E3F2FD',
                                    mr: 2,
                                    fontWeight: 500,
                                }}
                            >
                                Welcome, {user.role} ({user.id.substring(0, 8)})
                            </Typography>
                        )}
                        
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    p: 3,
                    transition: 'margin 0.3s ease, width 0.3s ease',
                    ml: `${sidebarWidth}px`,
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default SuperAdminLayout;
