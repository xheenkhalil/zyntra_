// frontend/src/pages/EnrollmentTestPage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Paper } from '@mui/material';
import { FaSave } from 'react-icons/fa';
import { enrollIdentity } from '../services/proctoringService';

const EnrollmentTestPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState('Initializing Camera...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const captureCount = 3; // We need 3 images for a reliable reference set

  // --- Step 1: Start Webcam Stream ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus('Webcam Active. Ready to Capture.');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access webcam. Please ensure permission is granted and you are on HTTPS or Localhost.');
      setStatus('Camera Error');
    }
  };

  useEffect(() => {
    startCamera();
    // Cleanup stream on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- Step 2: Capture Image ---
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return null;

      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get Base64 data from canvas
      const base64Image = canvas.toDataURL('image/jpeg', 0.9); // Use jpeg for smaller size

      return base64Image;
    }
    return null;
  };

  // --- Step 3: Send to Backend ---
  const handleEnrollment = async () => {
    setError('');
    const base64Images: string[] = [];

    setLoading(true);
    setStatus('Capturing images...');

    // Capture 3 unique images with slight delays
    for (let i = 0; i < captureCount; i++) {
      const image = captureImage();
      if (image) {
        base64Images.push(image);
      }
      // Wait 800ms between captures to get slight variations
      await new Promise(r => setTimeout(r, 800));
    }

    if (base64Images.length < captureCount) {
      setLoading(false);
      return setError(`Could only capture ${base64Images.length} images. Please ensure your camera is working.`);
    }

    setStatus('Uploading and Indexing Identity...');

    try {
      // Call the proctoring service
      const data = await enrollIdentity(base64Images);

      setStatus('Enrollment Complete!');
      setImageUrls(data.referenceUrls);

    } catch (err: any) {
      console.error('Enrollment error:', err);
      const msg = err.response?.data?.message || 'Enrollment failed. Check backend console.';
      setError(msg);
      setStatus('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6 max-w-4xl mx-auto mt-10">
      <Typography variant="h4" className="font-bold text-gray-900 mb-6">
        Proctoring Identity Enrollment (Test)
      </Typography>

      <Paper className="p-6 shadow-lg bg-white rounded-xl">
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6" className={status.includes('Error') ? 'text-red-600' : 'text-blue-600'}>
            Status: {status}
          </Typography>
        </Box>

        {error && <Alert severity="error" className="mb-4">{error}</Alert>}

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Feed */}
          <Box className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            ></video>
          </Box>

          {/* Controls */}
          <Box className="flex flex-col justify-center space-y-4">
            <Typography variant="body1" className="text-gray-700">
              This process captures <strong>{captureCount} reference images</strong> to verify your identity throughout the exam.
            </Typography>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
              <li>Ensure your face is clearly visible.</li>
              <li>Remove sunglasses or hats.</li>
              <li>Look directly at the camera.</li>
            </ul>

            <Button
              variant="contained"
              size="large"
              disabled={loading || status.includes('Error') || status.includes('Initializing')}
              onClick={handleEnrollment}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaSave />}
            >
              {loading ? 'Processing...' : `Capture & Enroll Identity`}
            </Button>

            {/* Success State */}
            {imageUrls.length > 0 && (
              <Alert severity="success" className="mt-4">
                <Typography variant="subtitle2" className="font-bold">Success!</Typography>
                <Typography variant="body2">Your biometric profile has been created in AWS Rekognition.</Typography>
                <Box className="mt-2 flex gap-2 overflow-x-auto">
                  {imageUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="Ref" className="w-16 h-16 object-cover rounded border border-green-300" />
                    </a>
                  ))}
                </Box>
              </Alert>
            )}

            {/* Hidden Canvas for processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EnrollmentTestPage;