import React from 'react';
import { Box, Typography, Chip, Button, Avatar, Container, Paper, IconButton, Tooltip } from '@mui/material';
import { AccessTime as AccessTimeIcon, School as SchoolIcon, Logout as LogoutIcon } from '@mui/icons-material';

interface StudentHeaderProps {
    student?: {
        name: string;
        studentId?: string;
        email?: string;
    };
    title?: string;
    showTimer?: boolean;
    timeLeft?: number | null; // in seconds
    showSubmit?: boolean;
    onSubmit?: () => void;
    onLogout?: () => void;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({
    student,
    title = "Zyntra Student Portal",
    showTimer = false,
    timeLeft = null,
    showSubmit = false,
    onSubmit,
    onLogout
}) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeLeft !== null && timeLeft < 900; // Less than 15 minutes

    return (
        <Paper elevation={0} className="border-b border-gray-200 sticky top-0 z-50 bg-white">
            <Container maxWidth="xl">
                <Box className="h-20 flex items-center justify-between">
                    {/* Logo & Title */}
                    <Box className="flex items-center gap-4">
                        <Box className="bg-blue-700 text-white p-2 rounded-lg shadow-sm">
                            <SchoolIcon fontSize="medium" />
                        </Box>
                        <Box>
                            <Typography variant="h6" className="font-bold text-blue-900 leading-tight tracking-tight">
                                ZYNTRA
                            </Typography>
                            <Typography variant="body2" className="text-gray-500 font-medium">
                                {title}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right Side: Timer & Profile & Submit Button */}
                    <Box className="flex items-center gap-6">
                        {showTimer && timeLeft !== null && (
                            <Chip
                                icon={<AccessTimeIcon className={isLowTime ? "text-red-600" : "text-green-600"} />}
                                label={formatTime(timeLeft)}
                                className={`font-mono text-lg font-bold border px-2 py-4 rounded-full ${isLowTime
                                        ? "bg-red-50 text-red-700 border-red-100 animate-pulse"
                                        : "bg-green-50 text-green-700 border-green-100"
                                    }`}
                            />
                        )}

                        <Box className="flex items-center gap-3 border-l border-gray-200 pl-6">
                            <Box className="text-right hidden sm:block">
                                <Typography variant="subtitle2" className="font-bold text-gray-900">
                                    {student?.name || 'Student'}
                                </Typography>
                                <Typography variant="caption" className="text-blue-600 font-medium block">
                                    {student?.studentId || student?.email || ''}
                                </Typography>
                            </Box>
                            <Avatar className="bg-blue-100 text-blue-700 font-bold border-2 border-white shadow-sm">
                                {student?.name ? getInitials(student.name) : 'ST'}
                            </Avatar>

                            {onLogout && (
                                <Tooltip title="Logout">
                                    <IconButton onClick={onLogout} size="small" className="ml-2 text-gray-400 hover:text-red-500">
                                        <LogoutIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>

                        {showSubmit && onSubmit && (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={onSubmit}
                                className="bg-red-500 hover:bg-red-600 shadow-none text-white font-bold px-6 py-2 rounded-lg normal-case ml-4"
                            >
                                Submit Exam
                            </Button>
                        )}
                    </Box>
                </Box>
            </Container>
        </Paper>
    );
};

export default StudentHeader;
