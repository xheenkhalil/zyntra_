import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import { setupAccount } from '../services/authService';
import { PasswordInput } from '../components/PasswordInput';

const SetupAccountPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Password validation rules (mirrored from component for consistency)
    const passwordRules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password),
    };
    const allRulesMet = Object.values(passwordRules).every(Boolean);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('No setup token found. This link may be invalid or expired.');
        }
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        if (!allRulesMet) {
            setError('Please ensure all password requirements are met.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!token) {
            setError('Invalid setup token.');
            return;
        }
        setLoading(true);
        try {
            const data = await setupAccount(token, password);
            setSuccess(data.message + ' Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'Failed to set up account.');
            } else {
                setError('Failed to set up account.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <KeyIcon sx={{ m: 1, fontSize: 'large', color: 'primary.main' }} />
                <Typography component="h1" variant="h5">
                    Set Up Your Account
                </Typography>
                {token ? (
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                        <PasswordInput
                            label="New Password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            confirmValue={confirmPassword}
                            onConfirmChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || !!success || !allRulesMet}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Set Password & Activate'}
                        </Button>
                    </Box>
                ) : (
                    <Alert severity="error" sx={{ mt: 4, width: '100%' }}>
                        {error || 'Invalid or missing setup token in the URL.'}
                    </Alert>
                )}
            </Box>
        </Container>
    );
};

export default SetupAccountPage;