// frontend/src/components/ExamInstructionsDialog.tsx

import React from 'react';
import { Dialog, Box, Typography, Button } from '@mui/material';

interface ExamInstructionsDialogProps {
    open: boolean;
    instructions: string;
    examTitle: string;
    onContinue: () => void;
}

const ExamInstructionsDialog: React.FC<ExamInstructionsDialogProps> = ({
    open,
    instructions,
    examTitle,
    onContinue
}) => {
    // Simple markdown-style parser
    const parseInstructions = (text: string) => {
        if (!text) return null;

        const lines = text.split('\n');
        return lines.map((line, index) => {
            // Heading: # Text
            if (line.startsWith('# ')) {
                return (
                    <Typography
                        key={index}
                        variant="h4"
                        sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2, mt: index > 0 ? 3 : 0 }}
                    >
                        {line.substring(2)}
                    </Typography>
                );
            }

            // Parse inline formatting
            let content: React.ReactNode = line;

            // Bold: **text**
            const boldRegex = /\*\*(.*?)\*\*/g;
            if (boldRegex.test(line)) {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                content = parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <Box key={i} component="span" fontWeight="bold">{part.slice(2, -2)}</Box>;
                    }
                    return part;
                });
            }

            // Italic: *text* (but not **)
            const italicRegex = /(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g;
            if (italicRegex.test(line) && !line.includes('**')) {
                const parts = line.split(/(\*(?!\*).+?\*(?!\*))/g);
                content = parts.map((part, i) => {
                    if (part.startsWith('*') && part.endsWith('*') && !part.includes('**')) {
                        return <Box key={i} component="span" fontStyle="italic">{part.slice(1, -1)}</Box>;
                    }
                    return part;
                });
            }

            // Regular paragraph
            return (
                <Typography key={index} variant="body1" sx={{ mb: 1.5, lineHeight: 1.8 }}>
                    {content || '\u00A0'}
                </Typography>
            );
        });
    };

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: 3,
                    p: 4,
                }
            }}
        >
            <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                    Exam Instructions
                </Typography>
                <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4 }}>
                    {examTitle}
                </Typography>

                <Box sx={{ mb: 4, maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                    {parseInstructions(instructions)}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={onContinue}
                        sx={{
                            px: 6,
                            py: 1.5,
                            fontSize: '1.1rem',
                            background: '#111A50',
                            boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                            '&:hover': {
                                background: '#111A50',
                            }
                        }}
                    >
                        Continue to Exam
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default ExamInstructionsDialog;
