import { useState, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert,
    Tabs, Tab, TextField, CircularProgress, Link
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { bulkUploadCourseAdmins } from '../services/centralAdminService';

interface BulkTeacherUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkTeacherUploadDialog({ open, onClose, onSuccess }: BulkTeacherUploadDialogProps) {
    const [tabIndex, setTabIndex] = useState(0);
    const [rawData, setRawData] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ registered: number; skipped: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
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
        if (tabIndex === 0 && !rawData.trim()) {
            setError("Please paste names and emails.");
            return;
        }
        if (tabIndex === 1 && !file) {
            setError("Please select a CSV file.");
            return;
        }

        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const response = await bulkUploadCourseAdmins(tabIndex === 1 ? file : null, tabIndex === 0 ? rawData : "");
            setResult({
                registered: response.registeredCount,
                skipped: response.skippedCount,
            });
            if (response.registeredCount > 0) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to upload teachers. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setRawData("");
        setError(null);
        setResult(null);
        onClose();
    };

    const downloadTemplate = () => {
        const csvContent = "Full Name,Email\nJohn Doe,john@example.com\nJane Smith,jane@example.com";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "teacher_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onClose={uploading ? undefined : handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Bulk Add Teachers</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {result && (
                    <Alert severity={result.registered > 0 ? "success" : "warning"} sx={{ mb: 2 }}>
                        Successfully added {result.registered} teachers. {result.skipped > 0 && `${result.skipped} skipped (e.g. duplicates).`}
                    </Alert>
                )}

                <Tabs value={tabIndex} onChange={(_, nv) => setTabIndex(nv)} sx={{ mb: 3 }}>
                    <Tab label="Paste Text" />
                    <Tab label="CSV Upload" />
                </Tabs>

                {tabIndex === 0 && (
                    <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Paste full names and email addresses separated by commas or tabs. One teacher per line.
                        </Typography>
                        <TextField
                            multiline
                            rows={8}
                            fullWidth
                            variant="outlined"
                            placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com"
                            value={rawData}
                            onChange={(e) => setRawData(e.target.value)}
                        />
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Upload a CSV file containing <b>Full Name</b> and <b>Email</b> columns.
                            {' '}
                            <Link component="button" variant="body2" onClick={downloadTemplate}>
                                Download Template
                            </Link>
                        </Typography>
                        
                        <Box
                            sx={{
                                border: '2px dashed',
                                borderColor: file ? 'primary.main' : 'grey.300',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                bgcolor: file ? 'primary.50' : 'grey.50',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'grey.100' }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept=".csv"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <CloudUploadIcon sx={{ fontSize: 48, color: file ? 'primary.main' : 'text.secondary', mb: 1 }} />
                            <Typography variant="subtitle1" fontWeight="medium">
                                {file ? file.name : 'Click to select CSV file'}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Button onClick={handleClose} disabled={uploading}>Close</Button>
                <Button 
                    onClick={handleUpload} 
                    variant="contained" 
                    color="primary" 
                    disabled={uploading || (tabIndex === 0 && !rawData.trim()) || (tabIndex === 1 && !file)}
                >
                    {uploading ? <CircularProgress size={24} /> : 'Add Teachers'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
