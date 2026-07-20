import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, TextField, Paper, Stepper, Step, StepLabel, 
    CircularProgress, Alert, InputAdornment, IconButton, Grid, Card, CardContent 
} from '@mui/material';
import { Visibility, VisibilityOff, CorporateFare, School } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';
import { API_BASE_URL } from '../config';

const LOCAL_STORAGE_KEY = 'zyntra_reg_cache';

const STEPS = ['Account Type', 'Details', 'Verify Email'];

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth(); // If AuthProvider has a method to update state directly, otherwise redirect will trigger refresh.

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        role: '', // 'centraladmin' or 'courseadmin'
        email: '',
        password: '',
        
        // Org specific
        organizationName: '',
        website: '',
        size: '',
        industry: '',
        
        // Teacher specific
        fullName: '',
        schoolName: '',
        location: '',
        subject: '',
        phone: '',

        otp: ''
    });

    useEffect(() => {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
            try {
                setFormData(JSON.parse(cached));
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    const handleChange = (field: string, value: string) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    };

    const handleRoleSelect = (role: 'centraladmin' | 'courseadmin') => {
        handleChange('role', role);
        setActiveStep(1);
    };

    const handleSendOTP = async () => {
        setError(null);
        setLoading(true);
        try {
            await axios.post(\`\${API_BASE_URL}/auth/register/send-otp\`, {
                email: formData.email,
                role: formData.role
            });
            setActiveStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await axios.post(\`\${API_BASE_URL}/auth/register/verify-otp-and-create\`, formData, {
                withCredentials: true
            });
            
            // Clear cache
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            
            // Redirect based on role
            if (res.data.user.role === 'centraladmin') {
                navigate('/centraladmin');
            } else {
                navigate('/courseadmin');
            }
            // Optional: force reload to hydrate auth context if needed
            window.location.reload(); 
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to verify OTP or complete registration.');
        } finally {
            setLoading(false);
        }
    };

    const validateStep1 = () => {
        if (!formData.email || !formData.password) return false;
        if (formData.role === 'centraladmin') {
            if (!formData.organizationName || !formData.website) return false;
        } else {
            if (!formData.fullName || !formData.schoolName) return false;
        }
        return true;
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2 }}>
                <Paper elevation={4} sx={{ p: 4, maxWidth: 600, width: '100%', borderRadius: 2 }}>
                    
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight={800} color="primary" letterSpacing={1} gutterBottom>
                            ZYNTRA
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Create your account
                        </Typography>
                    </Box>

                    <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    )}

                    {/* STEP 0: Role Selection */}
                    {activeStep === 0 && (
                        <Box>
                            <Typography variant="h6" gutterBottom textAlign="center" mb={3}>
                                How will you be using Zyntra?
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Card 
                                        sx={{ 
                                            cursor: 'pointer', 
                                            transition: '0.3s', 
                                            border: formData.role === 'centraladmin' ? '2px solid' : '2px solid transparent',
                                            borderColor: 'primary.main',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
                                        }}
                                        onClick={() => handleRoleSelect('centraladmin')}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                            <CorporateFare color="primary" sx={{ fontSize: 48, mb: 2 }} />
                                            <Typography variant="h6" fontWeight="bold">Organization</Typography>
                                            <Typography variant="body2" color="text.secondary" mt={1}>
                                                For universities, schools, and companies registering as an institution.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Card 
                                        sx={{ 
                                            cursor: 'pointer', 
                                            transition: '0.3s', 
                                            border: formData.role === 'courseadmin' ? '2px solid' : '2px solid transparent',
                                            borderColor: 'primary.main',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
                                        }}
                                        onClick={() => handleRoleSelect('courseadmin')}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                            <School color="primary" sx={{ fontSize: 48, mb: 2 }} />
                                            <Typography variant="h6" fontWeight="bold">Individual Teacher</Typography>
                                            <Typography variant="body2" color="text.secondary" mt={1}>
                                                For individual educators, tutors, and instructors.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* STEP 1: Details */}
                    {activeStep === 1 && (
                        <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}>
                            <Grid container spacing={2}>
                                {/* COMMON FIELDS */}
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        helperText={formData.role === 'centraladmin' ? 'Must be a custom organization domain (e.g. name@yourschool.edu)' : ''}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        helperText="Minimum 8 characters, 1 uppercase, 1 number."
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
                                </Grid>

                                {/* ORGANIZATION SPECIFIC */}
                                {formData.role === 'centraladmin' && (
                                    <>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="Organization Name"
                                                value={formData.organizationName}
                                                onChange={(e) => handleChange('organizationName', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="Website"
                                                value={formData.website}
                                                onChange={(e) => handleChange('website', e.target.value)}
                                                placeholder="https://"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Organization Size"
                                                value={formData.size}
                                                onChange={(e) => handleChange('size', e.target.value)}
                                                placeholder="e.g. 50-200"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Industry / Type"
                                                value={formData.industry}
                                                onChange={(e) => handleChange('industry', e.target.value)}
                                                placeholder="e.g. Higher Education, Corporate Training"
                                            />
                                        </Grid>
                                    </>
                                )}

                                {/* TEACHER SPECIFIC */}
                                {formData.role === 'courseadmin' && (
                                    <>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="Full Name"
                                                value={formData.fullName}
                                                onChange={(e) => handleChange('fullName', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="School / Institution Name"
                                                value={formData.schoolName}
                                                onChange={(e) => handleChange('schoolName', e.target.value)}
                                                helperText="If independent, enter 'Independent Educator'"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Subject Taught"
                                                value={formData.subject}
                                                onChange={(e) => handleChange('subject', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Location"
                                                value={formData.location}
                                                onChange={(e) => handleChange('location', e.target.value)}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                <Button onClick={() => setActiveStep(0)}>Back</Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    disabled={loading || !validateStep1()}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Continue'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* STEP 2: Verify Email */}
                    {activeStep === 2 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                Check your email
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={4}>
                                We've sent a 6-digit verification code to <strong>{formData.email}</strong>.
                            </Typography>
                            
                            <TextField
                                required
                                label="Verification Code"
                                value={formData.otp}
                                onChange={(e) => handleChange('otp', e.target.value)}
                                sx={{ mb: 4, width: '200px' }}
                                inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' } }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button onClick={() => setActiveStep(1)} disabled={loading}>Back</Button>
                                <Button 
                                    variant="contained" 
                                    onClick={handleVerifyAndRegister}
                                    disabled={loading || formData.otp.length < 6}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Verify & Register'}
                                </Button>
                            </Box>
                            
                            <Button 
                                variant="text" 
                                size="small" 
                                sx={{ mt: 3 }}
                                onClick={handleSendOTP}
                                disabled={loading}
                            >
                                Resend Code
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account? <Link to="/login" style={{ color: '#F5B841', textDecoration: 'none', fontWeight: 'bold' }}>Log in</Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
