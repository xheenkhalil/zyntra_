import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Menu,
    MenuItem,
    Collapse,
    Divider,
    Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuizIcon from '@mui/icons-material/Quiz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WarningIcon from '@mui/icons-material/Warning';
import SendIcon from '@mui/icons-material/Send';

interface ExamCardProps {
    exam: {
        id: string;
        title: string;
        status: 'draft' | 'live' | 'completed' | 'archived';
        created_at: string;
        // Extended properties for stats (to be fetched)
        total_questions?: number;
        question_types?: string[];
        time_limit?: number; // in minutes
        stats?: {
            registered?: number;
            completed?: number;
            pending?: number;
            proctoring_defaulters?: number;
            auto_submitted?: number;
        };
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onArchive: (id: string) => void;
    onRestore: (id: string) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onEdit, onDelete, onArchive, onRestore }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [expanded, setExpanded] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live':
                return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            case 'draft':
                return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            case 'archived':
                return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
            case 'completed':
                return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            default:
                return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        }
    };

    const questionTypes = exam.question_types || ['MCQ'];
    const timeLimit = exam.time_limit || 60;
    const totalQuestions = exam.total_questions || 0;

    return (
        <Box
            sx={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                padding: '24px',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: getStatusColor(exam.status),
                },
            }}
        >
            {/* Status Badge - Top Right */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                }}
            >
                <Chip
                    label={exam.status.toUpperCase()}
                    size="small"
                    sx={{
                        background: getStatusColor(exam.status),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        letterSpacing: '0.5px',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                />
            </Box>

            {/* Exam Title */}
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 2,
                    pr: 10, // Space for status badge
                    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {exam.title}
            </Typography>

            {/* Exam Details */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {/* Questions Count */}
                {totalQuestions > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <QuizIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
                        </Typography>
                    </Box>
                )}

                {/* Question Types */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    {questionTypes.map((type, index) => (
                        <Chip
                            key={index}
                            label={type}
                            size="small"
                            sx={{
                                fontSize: '0.7rem',
                                height: '20px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#6366f1',
                                fontWeight: 600,
                            }}
                        />
                    ))}
                </Box>

                {/* Time Limit */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {timeLimit} min
                    </Typography>
                </Box>
            </Box>

            {/* Stats Panel - Expandable */}
            {exam.stats && (
                <>
                    <Box
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.05)',
                            mb: 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                                background: 'rgba(99, 102, 241, 0.1)',
                            },
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366f1' }}>
                            View Statistics
                        </Typography>
                        <ExpandMoreIcon
                            sx={{
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                                color: '#6366f1',
                            }}
                        />
                    </Box>

                    <Collapse in={expanded}>
                        <Box
                            sx={{
                                padding: '16px',
                                background: 'rgba(248, 250, 252, 0.8)',
                                borderRadius: '12px',
                                mb: 2,
                            }}
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                {/* Registered */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PeopleIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                                    <Typography variant="body2" sx={{ color: '#475569' }}>
                                        <strong>{exam.stats.registered || 0}</strong> Registered
                                    </Typography>
                                </Box>

                                {/* Completed */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                                    <Typography variant="body2" sx={{ color: '#475569' }}>
                                        <strong>{exam.stats.completed || 0}</strong> Completed
                                    </Typography>
                                </Box>

                                {/* Pending */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PendingIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                                    <Typography variant="body2" sx={{ color: '#475569' }}>
                                        <strong>{exam.stats.pending || 0}</strong> Pending
                                    </Typography>
                                </Box>

                                {/* Auto-submitted */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SendIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
                                    <Typography variant="body2" sx={{ color: '#475569' }}>
                                        <strong>{exam.stats.auto_submitted || 0}</strong> Auto-submitted
                                    </Typography>
                                </Box>

                                {/* Proctoring Defaulters */}
                                {exam.stats.proctoring_defaulters && exam.stats.proctoring_defaulters > 0 && (
                                    <Tooltip title="Click to reveal proctoring violations">
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                gridColumn: '1 / -1',
                                                cursor: 'pointer',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: 'rgba(239, 68, 68, 0.05)',
                                                '&:hover': {
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                },
                                            }}
                                        >
                                            <WarningIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                                            <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>
                                                <strong>{exam.stats.proctoring_defaulters}</strong> Proctoring Violations
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    </Collapse>
                </>
            )}

            {/* Bottom Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                {/* Explore Button */}
                <Box
                    onClick={handleMenuOpen}
                    sx={{
                        background: '#1e3a8a',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': {
                            background: '#1e40af',
                            transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Explore ›
                    </Typography>
                </Box>

                {/* Date */}
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Created {new Date(exam.created_at).toLocaleDateString()}
                </Typography>
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        minWidth: 200,
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        onEdit(exam.id);
                        handleMenuClose();
                    }}
                >
                    <EditIcon sx={{ mr: 1.5, fontSize: 20, color: '#6366f1' }} />
                    <Typography variant="body2">Edit / View</Typography>
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                {exam.status === 'archived' ? (
                    <MenuItem
                        onClick={() => {
                            onRestore(exam.id);
                            handleMenuClose();
                        }}
                    >
                        <UnarchiveIcon sx={{ mr: 1.5, fontSize: 20, color: '#10b981' }} />
                        <Typography variant="body2">Restore</Typography>
                    </MenuItem>
                ) : (
                    <MenuItem
                        onClick={() => {
                            onArchive(exam.id);
                            handleMenuClose();
                        }}
                    >
                        <ArchiveIcon sx={{ mr: 1.5, fontSize: 20, color: '#f59e0b' }} />
                        <Typography variant="body2">Archive</Typography>
                    </MenuItem>
                )}

                <Divider sx={{ my: 0.5 }} />

                <MenuItem
                    onClick={() => {
                        onDelete(exam.id);
                        handleMenuClose();
                    }}
                    sx={{
                        color: '#ef4444',
                        '&:hover': {
                            background: 'rgba(239, 68, 68, 0.1)',
                        },
                    }}
                >
                    <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="body2">Delete</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ExamCard;
