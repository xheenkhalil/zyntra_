// frontend/src/components/ProctoringEnrollment.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Typography, Button, Alert, CircularProgress, Paper, LinearProgress
} from '@mui/material';
import { FaCamera } from 'react-icons/fa';
import { enrollIdentity } from '../services/proctoringService';

interface ProctoringEnrollmentProps {
    onComplete: () => void;
}

// ── Liveness Step Definitions ───────────────────────────────────────────────
const CENTER_TOL  = 0.18;   // How close to center the face must be (fraction of frame)
const TURN_SHIFT  = 0.10;   // How far the face must shift for a "turn" (fraction)
const FACE_MIN    = 0.12;   // Minimum face-width ratio (too far)
const FACE_MAX    = 0.70;   // Maximum face-width ratio (too close)
const HOLD_MS     = 1200;   // ms the condition must hold to auto-capture

interface LivenessStep {
    id: string;
    instruction: string;
    emoji: string;
    check: (cx: number, cy: number, sizeRatio: number) => boolean;
}

const STEPS: LivenessStep[] = [
    {
        id: 'center',
        instruction: 'Position your face in the frame',
        emoji: '👤',
        check: (cx, cy, r) =>
            Math.abs(cx - 0.5) < CENTER_TOL &&
            Math.abs(cy - 0.5) < CENTER_TOL + 0.05 &&
            r > FACE_MIN && r < FACE_MAX,
    },
    {
        id: 'left',
        instruction: 'Slowly turn your head left',
        emoji: '👈',
        // User turns left → in raw (non-mirrored) feed the face shifts right
        check: (cx) => cx > 0.5 + TURN_SHIFT,
    },
    {
        id: 'right',
        instruction: 'Now turn your head right',
        emoji: '👉',
        check: (cx) => cx < 0.5 - TURN_SHIFT,
    },
    {
        id: 'confirm',
        instruction: 'Look back at the camera and hold still',
        emoji: '✅',
        check: (cx, cy, r) =>
            Math.abs(cx - 0.5) < CENTER_TOL &&
            Math.abs(cy - 0.5) < CENTER_TOL + 0.05 &&
            r > FACE_MIN && r < FACE_MAX,
    },
];

// ── Component ───────────────────────────────────────────────────────────────
const ProctoringEnrollment: React.FC<ProctoringEnrollmentProps> = ({ onComplete }) => {
    const videoRef          = useRef<HTMLVideoElement>(null);
    const canvasRef         = useRef<HTMLCanvasElement>(null);
    const detectionCanvas   = useRef<HTMLCanvasElement>(null);
    const faceDetectorRef   = useRef<any>(null);

    // Refs that must stay current inside the async detection loop
    const currentStepRef    = useRef(0);
    const capturedRef       = useRef<string[]>([]);
    const holdTimeRef       = useRef(0);

    const [useFaceDetection, setUseFaceDetection] = useState(false);
    const [cameraReady, setCameraReady]           = useState(false);
    const [currentStep, setCurrentStep]           = useState(0);
    const [holdProgress, setHoldProgress]         = useState(0);
    const [faceDetected, setFaceDetected]         = useState(false);
    const [capturedImages, setCapturedImages]      = useState<string[]>([]);

    const [status, setStatus]       = useState('Initializing Camera…');
    const [loading, setLoading]     = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState(false);

    // ── 1. Try to initialise FaceDetector (Chrome / Edge) ───────────────────
    useEffect(() => {
        if ('FaceDetector' in window) {
            try {
                faceDetectorRef.current = new (window as any).FaceDetector({
                    fastMode: true,
                    maxDetectedFaces: 1,
                });
                setUseFaceDetection(true);
            } catch {
                setUseFaceDetection(false);
            }
        }
    }, []);

    // ── 2. Start webcam ─────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                });
                if (cancelled || !videoRef.current) return;
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraReady(true);
            } catch (err) {
                console.error('Camera error:', err);
                setError('Failed to access webcam. Please grant camera permission.');
                setStatus('Camera Error');
            }
        })();
        return () => {
            cancelled = true;
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Set initial status once camera + detection mode is known
    useEffect(() => {
        if (cameraReady) {
            setStatus(useFaceDetection ? STEPS[0].instruction : 'Webcam Active. Please look at the camera.');
        }
    }, [cameraReady, useFaceDetection]);

    // ── 3. Real-time face-detection loop (only when API available) ──────────
    useEffect(() => {
        if (!cameraReady || !useFaceDetection || success || enrolling) return;

        const video  = videoRef.current;
        const canvas = detectionCanvas.current;
        if (!video || !canvas) return;

        let active    = true;
        let detecting = false;

        const intervalId = setInterval(async () => {
            if (detecting || !active || video.readyState < 2) return;
            // Stop detecting once we've captured all steps
            if (capturedRef.current.length >= STEPS.length) return;
            detecting = true;

            try {
                canvas.width  = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(video, 0, 0);

                const faces: any[] = await faceDetectorRef.current.detect(canvas);
                if (!active) return;

                if (faces.length > 0) {
                    setFaceDetected(true);
                    const box   = faces[0].boundingBox;
                    const cx    = (box.x + box.width / 2)  / canvas.width;
                    const cy    = (box.y + box.height / 2) / canvas.height;
                    const ratio = box.width / canvas.width;

                    const stepIdx = currentStepRef.current;
                    const step    = STEPS[stepIdx];

                    if (step && step.check(cx, cy, ratio)) {
                        holdTimeRef.current += 100;
                        const pct = Math.min((holdTimeRef.current / HOLD_MS) * 100, 100);
                        setHoldProgress(pct);

                        if (holdTimeRef.current >= HOLD_MS) {
                            // ── auto-capture ──
                            const capCanvas = canvasRef.current;
                            if (capCanvas) {
                                capCanvas.width  = video.videoWidth;
                                capCanvas.height = video.videoHeight;
                                capCanvas.getContext('2d')?.drawImage(video, 0, 0);
                                const img = capCanvas.toDataURL('image/jpeg', 0.9);
                                capturedRef.current = [...capturedRef.current, img];
                                setCapturedImages([...capturedRef.current]);
                            }

                            holdTimeRef.current = 0;
                            setHoldProgress(0);

                            if (stepIdx < STEPS.length - 1) {
                                currentStepRef.current = stepIdx + 1;
                                setCurrentStep(currentStepRef.current);
                                setStatus(STEPS[currentStepRef.current].instruction);
                            }
                            // Last step → the effect below triggers enrollment
                        }
                    } else {
                        // Condition not met – decay the timer gradually
                        holdTimeRef.current = Math.max(0, holdTimeRef.current - 50);
                        setHoldProgress(Math.max(0, (holdTimeRef.current / HOLD_MS) * 100));
                    }
                } else {
                    setFaceDetected(false);
                    holdTimeRef.current = Math.max(0, holdTimeRef.current - 50);
                    setHoldProgress(Math.max(0, (holdTimeRef.current / HOLD_MS) * 100));
                }
            } catch {
                /* detection errors are non-fatal */
            } finally {
                detecting = false;
            }
        }, 100); // ~10 fps detection

        return () => { active = false; clearInterval(intervalId); };
    }, [cameraReady, useFaceDetection, success, enrolling]);

    // ── 4. Auto-enroll once all steps are captured ──────────────────────────
    useEffect(() => {
        if (capturedImages.length >= STEPS.length && !enrolling && !success) {
            doEnrollment(capturedImages);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capturedImages]);

    // ── Shared enrollment call ──────────────────────────────────────────────
    const doEnrollment = async (images: string[]) => {
        setError('');
        setEnrolling(true);
        setStatus('Verifying identity…');

        try {
            await enrollIdentity(images);
            setSuccess(true);
            setStatus('Identity Verified!');
            setTimeout(() => onComplete(), 1500);
        } catch (err: any) {
            console.error('Enrollment error:', err);
            setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
            setStatus('Verification failed – try again');
            setEnrolling(false);
            // Reset for retry
            capturedRef.current   = [];
            currentStepRef.current = 0;
            holdTimeRef.current    = 0;
            setCapturedImages([]);
            setCurrentStep(0);
            setHoldProgress(0);
        }
    };

    // ── Manual-capture fallback (no FaceDetector API) ───────────────────────
    const captureImage = () => {
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return null;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.9);
    };

    const handleManualEnrollment = async () => {
        setError('');
        setLoading(true);
        setStatus('Capturing identity images…');
        const images: string[] = [];
        for (let i = 0; i < 3; i++) {
            const img = captureImage();
            if (img) images.push(img);
            await new Promise(r => setTimeout(r, 800));
        }
        if (images.length < 3) {
            setLoading(false);
            return setError(`Could only capture ${images.length} images. Please try again.`);
        }
        await doEnrollment(images);
        setLoading(false);
    };

    // ── Derived values ──────────────────────────────────────────────────────
    const activeStep       = STEPS[currentStep];
    const overallProgress  = (currentStep / STEPS.length) * 100;
    const borderColor      = success ? '#10b981' : faceDetected ? '#111A50' : '#ef4444';

    // =====================================================================
    //  RENDER — Smart KYC Mode (FaceDetector available)
    // =====================================================================
    if (useFaceDetection) {
        return (
            <Paper elevation={0} sx={{
                maxWidth: 560, mx: 'auto', mt: 4, borderRadius: 4, overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(17, 26, 80, 0.15)',
            }}>
                {/* ── Header ── */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #111A50 0%, #1a2980 100%)',
                    color: 'white', p: 3, textAlign: 'center',
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
                        Identity Verification
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Follow the on-screen prompts — it only takes a few seconds
                    </Typography>
                </Box>

                {/* ── Step Indicators ── */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, pt: 3, px: 3 }}>
                    {STEPS.map((s, i) => (
                        <Box key={s.id} sx={{
                            width: 40, height: 40, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.95rem', fontWeight: 700,
                            transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                            bgcolor: i < currentStep ? '#10b981'
                                : i === currentStep ? '#111A50' : '#e2e8f0',
                            color: i <= currentStep ? 'white' : '#94a3b8',
                            transform: i === currentStep ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: i === currentStep
                                ? '0 4px 14px rgba(17,26,80,0.35)' : 'none',
                        }}>
                            {i < currentStep ? '✓' : i + 1}
                        </Box>
                    ))}
                </Box>

                {/* ── Instruction ── */}
                <Box sx={{ textAlign: 'center', px: 3, pt: 2, pb: 1, minHeight: 90 }}>
                    {!success && !enrolling && (
                        <Box key={currentStep} sx={{
                            animation: 'kycFade 0.35s ease',
                            '@keyframes kycFade': {
                                from: { opacity: 0, transform: 'translateY(6px)' },
                                to:   { opacity: 1, transform: 'translateY(0)' },
                            },
                        }}>
                            <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>
                                {activeStep?.emoji}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111A50', mt: 0.5 }}>
                                {activeStep?.instruction}
                            </Typography>
                            <Typography variant="caption" sx={{
                                color: faceDetected ? '#10b981' : '#ef4444',
                                fontWeight: 600,
                            }}>
                                {faceDetected ? '● Face Detected' : '○ Looking for face…'}
                            </Typography>
                        </Box>
                    )}
                    {enrolling && !success && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 2 }}>
                            <CircularProgress size={22} sx={{ color: '#111A50' }} />
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111A50' }}>
                                Verifying identity…
                            </Typography>
                        </Box>
                    )}
                    {success && (
                        <Box sx={{
                            py: 1,
                            animation: 'kycPop 0.4s cubic-bezier(.4,0,.2,1)',
                            '@keyframes kycPop': {
                                '0%':   { transform: 'scale(0.8)', opacity: 0 },
                                '100%': { transform: 'scale(1)',   opacity: 1 },
                            },
                        }}>
                            <Typography sx={{ fontSize: '2.5rem' }}>✅</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                                Identity Verified!
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* ── Video Feed ── */}
                <Box sx={{
                    position: 'relative', mx: 3, mb: 2, borderRadius: 3,
                    overflow: 'hidden', aspectRatio: '4/3', bgcolor: '#000',
                    border: `3px solid ${borderColor}`,
                    transition: 'border-color 0.3s ease',
                }}>
                    <video
                        ref={videoRef}
                        autoPlay playsInline muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                    />

                    {/* Face-guide oval */}
                    {!success && (
                        <Box sx={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'none',
                        }}>
                            <Box sx={{
                                width: '50%', aspectRatio: '3/4', borderRadius: '50%',
                                border: `3px dashed ${faceDetected ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.35)'}`,
                                transition: 'all 0.3s ease',
                                boxShadow: faceDetected ? '0 0 30px rgba(16,185,129,0.15)' : 'none',
                                animation: !faceDetected ? 'kycPulse 2s ease-in-out infinite' : 'none',
                                '@keyframes kycPulse': {
                                    '0%,100%': { opacity: 0.5 },
                                    '50%':     { opacity: 1 },
                                },
                            }} />
                        </Box>
                    )}

                    {/* Hold-progress bar at bottom of video */}
                    {holdProgress > 0 && !success && (
                        <Box sx={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: 5, bgcolor: 'rgba(0,0,0,0.4)',
                        }}>
                            <Box sx={{
                                height: '100%', width: `${holdProgress}%`,
                                bgcolor: '#10b981', transition: 'width 0.1s linear',
                            }} />
                        </Box>
                    )}

                    {/* Enrolling overlay */}
                    {enrolling && !success && (
                        <Box sx={{
                            position: 'absolute', inset: 0,
                            bgcolor: 'rgba(0,0,0,0.55)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CircularProgress sx={{ color: 'white' }} />
                        </Box>
                    )}
                </Box>

                {/* ── Error ── */}
                {error && <Alert severity="error" sx={{ mx: 3, mb: 2, borderRadius: 2 }}>{error}</Alert>}

                {/* ── Overall Progress ── */}
                <Box sx={{ px: 3, pb: 3 }}>
                    <LinearProgress
                        variant="determinate"
                        value={success ? 100 : overallProgress}
                        sx={{
                            height: 6, borderRadius: 3, bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: success ? '#10b981' : '#111A50', borderRadius: 3,
                            },
                        }}
                    />
                    <Typography variant="caption" sx={{
                        color: 'text.secondary', mt: 0.5, display: 'block', textAlign: 'center',
                    }}>
                        Step {Math.min(currentStep + 1, STEPS.length)} of {STEPS.length}
                    </Typography>
                </Box>

                {/* Hidden canvases */}
                <canvas ref={canvasRef}       style={{ display: 'none' }} />
                <canvas ref={detectionCanvas} style={{ display: 'none' }} />
            </Paper>
        );
    }

    // =====================================================================
    //  RENDER — Manual Fallback (FaceDetector not available)
    // =====================================================================
    return (
        <Paper elevation={0} sx={{
            p: 4, maxWidth: 560, mx: 'auto', mt: 4, textAlign: 'center',
            borderRadius: 4, boxShadow: '0 20px 60px rgba(17, 26, 80, 0.15)',
        }}>
            <Box sx={{
                bgcolor: '#111A50', color: 'white', borderRadius: 2,
                p: 2, mb: 3, mx: -1,
            }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Identity Enrollment
                </Typography>
            </Box>

            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Before starting the exam, we need to verify your identity.
                Ensure you are in a well-lit room and your face is clearly visible.
            </Typography>

            {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Identity verified! Redirecting to exam…</Alert>}

            <Box sx={{
                position: 'relative', width: '100%', aspectRatio: '4/3',
                mx: 'auto', bgcolor: 'black', borderRadius: 3,
                overflow: 'hidden', mb: 3,
                border: '3px solid #111A50',
            }}>
                <video
                    ref={videoRef}
                    autoPlay playsInline muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
                {loading && (
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.5)',
                    }}>
                        <CircularProgress sx={{ color: 'white' }} />
                    </Box>
                )}
            </Box>

            <Typography variant="subtitle1" sx={{
                mb: 3, fontWeight: 600,
                color: status.includes('Error') || status.includes('failed') ? 'error.main' : '#111A50',
            }}>
                {status}
            </Typography>

            <Button
                variant="contained"
                size="large"
                onClick={handleManualEnrollment}
                disabled={loading || enrolling || success || status.includes('Camera Error')}
                startIcon={<FaCamera />}
                sx={{
                    px: 5, py: 1.5, fontSize: '1.05rem', fontWeight: 700,
                    bgcolor: '#111A50', borderRadius: 2,
                    '&:hover': { bgcolor: '#080D2B' },
                }}
            >
                {loading || enrolling ? 'Processing…' : 'Capture & Verify'}
            </Button>

            {/* Hidden canvases */}
            <canvas ref={canvasRef}       style={{ display: 'none' }} />
            <canvas ref={detectionCanvas} style={{ display: 'none' }} />
        </Paper>
    );
};

export default ProctoringEnrollment;
