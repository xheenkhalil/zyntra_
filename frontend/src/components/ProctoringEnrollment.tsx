import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Paper } from '@mui/material';
import { FaCamera } from 'react-icons/fa';
import { enrollIdentity } from '../services/proctoringService';

interface ProctoringEnrollmentProps {
    onComplete: () => void;
}

const ProctoringEnrollment: React.FC<ProctoringEnrollmentProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [status, setStatus] = useState('Initializing Camera...');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const captureCount = 3;

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStatus('Webcam Active. Please look at the camera.');
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Failed to access webcam. Please ensure permission is granted.');
            setStatus('Camera Error');
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (!context) return null;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.9);
        }
        return null;
    };

    const handleEnrollment = async () => {
        setError('');
        const base64Images: string[] = [];
        setLoading(true);
        setStatus('Capturing identity images...');

        for (let i = 0; i < captureCount; i++) {
            const image = captureImage();
            if (image) base64Images.push(image);
            await new Promise(r => setTimeout(r, 800));
        }

        if (base64Images.length < captureCount) {
            setLoading(false);
            return setError(`Could only capture ${base64Images.length} images. Please try again.`);
        }

        setStatus('Verifying and enrolling identity...');

        try {
            await enrollIdentity(base64Images);
            setSuccess(true);
            setStatus('Enrollment Complete!');
            setTimeout(() => {
                onComplete();
            }, 1500);
        } catch (err: any) {
            console.error('Enrollment error:', err);
            const msg = err.response?.data?.message || 'Enrollment failed. Please try again.';
            setError(msg);
            setStatus('Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Identity Enrollment
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Before starting the exam, we need to verify your identity. Please ensure you are in a well-lit room and your face is clearly visible.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>Identity verified successfully! Redirecting to exam...</Alert>}

            <Box sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 640,
                aspectRatio: '16/9',
                mx: 'auto',
                bgcolor: 'black',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3
            }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
                {loading && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.5)' }}>
                        <CircularProgress color="secondary" />
                    </Box>
                )}
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 'medium', color: status.includes('Error') ? 'error.main' : 'primary.main' }}>
                {status}
            </Typography>

            <Button
                variant="contained"
                size="large"
                onClick={handleEnrollment}
                disabled={loading || success || status.includes('Error')}
                startIcon={<FaCamera />}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
                {loading ? 'Processing...' : 'Capture & Enroll'}
            </Button>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Paper>
    );
};

export default ProctoringEnrollment;
