// /frontend/src/pages/CourseAdminSettings.tsx

import React, { useState, useEffect, type FormEvent } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import { FaSave, FaLock, FaUserEdit } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import { updateMyProfile, changeMyPassword } from '../services/authService';
import { PasswordInput } from '../components/PasswordInput';

const CourseAdminSettings: React.FC = () => {
    const { user, setUser } = useAuth();

    // --- Profile Form State ---
    const [profileForm, setProfileForm] = useState({ fullName: '', email: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    // --- Password Form State ---
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Load user data on mount
    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.fullName || '',
                email: user.email || '',
            });
        }
    }, [user]);

    // --- Handlers ---
    const handleProfileSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

        try {
            const data = await updateMyProfile(profileForm);
            if (setUser) setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            setProfileSuccess('Profile updated successfully!');
        } catch (err: any) {
            setProfileError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match.');
            setPasswordLoading(false);
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            setPasswordLoading(false);
            return;
        }

        try {
            const data = await changeMyPassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordSuccess(data.message || 'Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" className="font-bold text-gray-900 mb-6">
                Account Settings
            </Typography>

            {/* Responsive Grid Layout using Tailwind */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* --- 1. Profile Information --- */}
                <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full">
                    <Typography variant="h6" className="font-semibold text-gray-900 mb-6 flex items-center">
                        <FaUserEdit className="mr-3 text-[#111A50]" /> Profile Information
                    </Typography>

                    <Box component="form" onSubmit={handleProfileSubmit}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            margin="normal"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            disabled={profileLoading}
                            required
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            disabled={profileLoading}
                            required
                        />
                        {/* Read-only Organization Field */}
                        <TextField
                            label="Organization ID"
                            fullWidth
                            margin="normal"
                            value={user?.organization_id || 'N/A'}
                            disabled
                            InputProps={{ readOnly: true }}
                            helperText="You cannot change your organization."
                        />

                        {profileError && <Alert severity="error" className="mt-4">{profileError}</Alert>}

                        <Box className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={profileLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                                startIcon={profileLoading ? <CircularProgress size={20} color="inherit" /> : <FaSave />}
                            >
                                {profileLoading ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* --- 2. Security Settings --- */}
                <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full">
                    <Typography variant="h6" className="font-semibold text-gray-900 mb-6 flex items-center">
                        <FaLock className="mr-3 text-[#111A50]" /> Security
                    </Typography>

                    <Box component="form" onSubmit={handlePasswordSubmit}>
                        <TextField
                            label="Current Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            disabled={passwordLoading}
                            required
                        />

                        <PasswordInput
                            label="New Password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            confirmValue={passwordForm.confirmPassword}
                            onConfirmChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />

                        {passwordError && <Alert severity="error" className="mt-4">{passwordError}</Alert>}

                        <Box className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={passwordLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                                startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <FaLock />}
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </div>

            <Snackbar
                open={!!profileSuccess || !!passwordSuccess}
                autoHideDuration={4000}
                onClose={() => { setProfileSuccess(''); setPasswordSuccess(''); }}
                message={profileSuccess || passwordSuccess}
            />
        </Box>
    );
};

export default CourseAdminSettings;