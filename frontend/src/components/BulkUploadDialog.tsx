import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { bulkUploadStudents } from '../services/courseAdminService';

interface BulkUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({ open, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ registered: number; skipped: number } | null>(null);
    const [sendEmails, setSendEmails] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please select a valid CSV file.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const response = await bulkUploadStudents(file, sendEmails);
            setResult({
                registered: response.registeredCount,
                skipped: response.skippedCount,
            });
            // Don't close immediately so user can see the result
            if (response.registeredCount > 0) {
                onSuccess(); // Refresh the list in the background
            }
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Failed to upload students. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setResult(null);
        setSendEmails(false);
        onClose();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
                setError('Please select a valid CSV file.');
                return;
            }
            setFile(droppedFile);
            setError(null);
            setResult(null);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Bulk Upload Students</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Upload a CSV file with the following columns: <strong>full_name</strong>, <strong>email</strong>.
                    </Typography>
                </Box>

                {!result ? (
                    <>
                        <Box
                            sx={{
                                border: '2px dashed #ccc',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                bgcolor: 'background.default',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                accept=".csv"
                                onChange={handleFileChange}
                            />
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="h6" color="textSecondary">
                                {file ? file.name : 'Click or Drag CSV file here'}
                            </Typography>
                            {file && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    {(file.size / 1024).toFixed(2)} KB
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={sendEmails}
                                        onChange={(e) => setSendEmails(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Send welcome emails to new students"
                            />
                        </Box>
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Upload Complete!
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                                <ListItemText primary={`${result.registered} students registered successfully`} />
                            </ListItem>
                            {result.skipped > 0 && (
                                <ListItem>
                                    <ListItemIcon><ErrorIcon color="warning" fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={`${result.skipped} students skipped (duplicates or errors)`} />
                                </ListItem>
                            )}
                        </List>
                    </Box>
                )}

                {uploading && <LinearProgress sx={{ mt: 2 }} />}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    {result ? 'Close' : 'Cancel'}
                </Button>
                {!result && (
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={!file || uploading}
                        startIcon={<CloudUploadIcon />}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default BulkUploadDialog;
