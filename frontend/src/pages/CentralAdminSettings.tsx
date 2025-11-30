import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    Divider,
    InputAdornment,
    IconButton
} from '@mui/material';
import { FaSave, FaLock, FaUser } from 'react-icons/fa';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/useAuth';

const CentralAdminSettings: React.FC = () => {
    const { user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [profileForm, setProfileForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        // Simulate API call
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <Box maxWidth="md">
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937', mb: 4 }}>
                Account Settings
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            {/* Profile Settings */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FaUser className="text-indigo-600 mr-3 text-xl" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Profile Information</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                        <div className="col-span-1 sm:col-span-2">
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<FaSave />}
                                sx={{ bgcolor: 'indigo.600', '&:hover': { bgcolor: 'indigo.700' } }}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </form>
            </Paper>

            {/* Password Settings */}
            <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FaLock className="text-indigo-600 mr-3 text-xl" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Change Password</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handlePasswordUpdate}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-1 sm:col-span-2">
                            <TextField
                                fullWidth
                                label="Current Password"
                                type={showPassword ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                        <div className="col-span-1 sm:col-span-2">
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<FaSave />}
                                sx={{ bgcolor: 'indigo.600', '&:hover': { bgcolor: 'indigo.700' } }}
                            >
                                Update Password
                            </Button>
                        </div>
                    </div>
                </form>
            </Paper>
        </Box>
    );
};

export default CentralAdminSettings;
