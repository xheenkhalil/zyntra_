// /frontend/src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

// Define the props to accept an array of allowed roles
interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        // If not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // If user is logged in but their role is not in the allowed list, redirect them
    // For now, we'll send them to a generic dashboard, but this could be a '403 Forbidden' page.
    if (!allowedRoles.includes(user.role)) {
        return (
            <Box sx={{p: 4}}>
                <Typography variant="h4">Access Denied</Typography>
                <Typography>You do not have permission to view this page.</Typography>
            </Box>
        );
    }
    
    // If user is logged in and has the correct role, render the child component
    return <Outlet />;
};

export default ProtectedRoute;