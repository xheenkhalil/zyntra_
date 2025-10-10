// /frontend/src/pages/SubmissionCompletePage.tsx

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

const SubmissionCompletePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h4" gutterBottom>Exam Submitted Successfully!</Typography>
                <Typography color="text.secondary">
                    Your results will be made available by your course administrator.
                </Typography>
                <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate('/student')}>
                    Back to Dashboard
                </Button>
            </Paper>
        </Box>
    );
};

export default SubmissionCompletePage;