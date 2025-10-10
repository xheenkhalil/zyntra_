// /frontend/src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Button } from '@mui/material';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4">
                Welcome to your Dashboard, {user?.fullName}!
            </Typography>
            <Typography>
                Your role is: {user?.role}
            </Typography>
            <Button variant="contained" onClick={logout} sx={{mt: 4}}>
                Log Out
            </Button>
        </Box>
    );
};

export default DashboardPage;