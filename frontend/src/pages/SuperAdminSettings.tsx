// /frontend/src/pages/SuperAdminSettings.tsx

import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  // Grid, // <-- We are no longer using Grid
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { FaSave, FaLock, FaUserEdit } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';

// --- Import the new service functions ---
import { updateMyProfile, changeMyPassword } from '../services/authService';

const SuperAdminSettings: React.FC = () => {
  // --- FIX: Destructure setUser to avoid type errors ---
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

  // --- Load user data into profile form on mount ---
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // --- Profile Submit Handler ---
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      // --- FIX: Using real API call ---
      const data = await updateMyProfile(profileForm);
      
      // Update the auth context and local storage
      if (setUser) {
        setUser(data.user); // Update context
      }
      localStorage.setItem('user', JSON.stringify(data.user)); // Update local storage
      
      setProfileSuccess(data.message || 'Profile updated successfully!');

    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Password Submit Handler ---
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    // 1. Client-side Validation
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
      // --- FIX: Using real API call ---
      const data = await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordSuccess(data.message || 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" className="font-bold text-gray-900 mb-6">
        Super Admin Settings
      </Typography>

      {/* --- FIX: Replaced <Grid container> with a <Box> using Tailwind grid classes --- */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- Column 1: Profile Settings --- */}
        {/* No 'item' or 'xs' prop needed. Just a simple Box. */}
        <Box>
          <Paper className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 h-full">
            <Typography variant="h6" className="font-semibold text-gray-900 mb-6 flex items-center">
              <FaUserEdit className="mr-3 text-blue-600" /> Profile Information
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
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={user.username || 'N/A'}
                disabled
                InputProps={{ readOnly: true }}
                helperText="Username cannot be changed."
              />
              
              {profileError && <Alert severity="error" className="mt-4">{profileError}</Alert>}
              
              <Box className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  color="inherit"
                  disabled={profileLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium"
                  sx={{ border: 'none' }}
                  startIcon={profileLoading ? <CircularProgress size={20} color="inherit" /> : <FaSave />}
                >
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* --- Column 2: Security Settings --- */}
        {/* No 'item' or 'xs' prop needed. */}
        <Box>
          <Paper className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 h-full">
            <Typography variant="h6" className="font-semibold text-gray-900 mb-6 flex items-center">
              <FaLock className="mr-3 text-blue-600" /> Change Password
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
              <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                disabled={passwordLoading}
                required
                helperText="Must be at least 8 characters long."
              />
              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                margin="normal"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                disabled={passwordLoading}
                required
              />
              
              {passwordError && <Alert severity="error" className="mt-4">{passwordError}</Alert>}

              <Box className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  color="inherit"
                  disabled={passwordLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium"
                  sx={{ border: 'none' }}
                  startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <FaLock />}
                >
                  {passwordLoading ? 'Saving...' : 'Change Password'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Snackbar for success messages */}
      <Snackbar
        open={!!profileSuccess || !!passwordSuccess}
        autoHideDuration={4000}
        onClose={() => { setProfileSuccess(''); setPasswordSuccess(''); }}
        message={profileSuccess || passwordSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default SuperAdminSettings;