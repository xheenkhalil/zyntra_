// /frontend/src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Box, TextField, Button, Typography, Alert, Tabs, Tab } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const LoginPage: React.FC = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [loginType, setLoginType] = useState('admin'); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const getRedirectPath = (role: string) => {
        switch (role) {
            case 'superadmin':
                return '/superadmin';
            case 'centraladmin':
                return '/centraladmin';
            case 'courseadmin':
                return '/courseadmin';
            case 'student':
                return '/student'; // UPDATED from '/student-dashboard' to '/student'
            default:
                return '/dashboard'; // A generic fallback
        }
    };
    
    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            navigate(getRedirectPath(user.role));
        }
    }, [user, navigate]);


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            let loginData;
            if (loginType === 'admin') {
                loginData = await login({ email, password });
            } else {
                loginData = await login({ studentId });
            }
            
            // This will now correctly redirect the student
            navigate(getRedirectPath(loginData.user.role));

        } catch (err: any) {
            console.error('Login Failed:', err.message);
            setError(err.message || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setLoginType(newValue);
        setError('');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <LockOutlinedIcon sx={{ m: 1, fontSize: 'large', color: 'primary.main' }} />
                <Typography component="h1" variant="h5">
                    Zyntra Login
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', mt: 2 }}>
                    <Tabs value={loginType} onChange={handleTabChange} centered>
                        <Tab label="Admin Login" value="admin" />
                        <Tab label="Student Login" value="student" />
                    </Tabs>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    {loginType === 'admin' ? (
                        <>
                            <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </>
                    ) : (
                        <TextField margin="normal" required fullWidth id="studentId" label="Student ID" name="studentId" autoFocus value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                    )}
                    
                    {error && (<Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>)}
                    
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;