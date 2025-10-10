// /frontend/src/layouts/StudentLayout.tsx

import React from 'react';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';

const StudentLayout: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 800 }}>
                        Zyntra
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 600 }}>{user?.fullName}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
                        </Box>
                        <Button variant="outlined" size="small" startIcon={<LogoutIcon />} onClick={logout}>
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default StudentLayout;