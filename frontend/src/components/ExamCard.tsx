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
        total_questions?: number;
        question_types?: string[];
        duration_minutes?: number;
        time_limit?: number;
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
                return '#10b981';
            case 'draft':
                return '#f59e0b';
            case 'archived':
                return '#6b7280';
            case 'completed':
                return '#3b82f6';
            default:
                return '#6b7280';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'live':
                return 'rgba(16, 185, 129, 0.1)';
            case 'draft':
                return 'rgba(245, 158, 11, 0.1)';
            case 'archived':
                return 'rgba(107, 114, 128, 0.1)';
            case 'completed':
                return 'rgba(59, 130, 246, 0.1)';
            default:
                return 'rgba(107, 114, 128, 0.1)';
        }
    };

    const questionTypes = exam.question_types || ['MCQ'];
    const timeLimit = exam.duration_minutes || exam.time_limit || 60;
    const totalQuestions = exam.total_questions || 0;

    return (
        <Box
            sx={{
                position: 'relative',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                padding: '24px',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(17, 26, 80, 0.12), 0 4px 8px rgba(0,0,0,0.06)',
                    borderColor: '#111A50',
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
                        background: getStatusBg(exam.status),
                        color: getStatusColor(exam.status),
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.5px',
                        border: `1px solid ${getStatusColor(exam.status)}`,
                        boxShadow: 'none',
                    }}
                />
            </Box>

            {/* Exam Title */}
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    color: '#111A50',
                    mb: 2,
                    pr: 10,
                    lineHeight: 1.3,
                }}
            >
                {exam.title}
            </Typography>

            {/* Exam Details */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                {/* Questions Count */}
                {totalQuestions > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <QuizIcon sx={{ fontSize: 18, color: '#111A50' }} />
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
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
                                height: '22px',
                                background: 'rgba(17, 26, 80, 0.08)',
                                color: '#111A50',
                                fontWeight: 700,
                                border: '1px solid rgba(17, 26, 80, 0.15)',
                            }}
                        />
                    ))}
                </Box>

                {/* Time Limit */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
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
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            mb: 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                                background: '#eef2ff',
                                borderColor: '#c7d2fe',
                            },
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111A50' }}>
                            View Statistics
                        </Typography>
                        <ExpandMoreIcon
                            sx={{
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                                color: '#111A50',
                            }}
                        />
                    </Box>

                    <Collapse in={expanded}>
                        <Box
                            sx={{
                                padding: '16px',
                                background: '#f8fafc',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                mb: 2,
                            }}
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                {/* Registered */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PeopleIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                        <strong>{exam.stats.registered || 0}</strong> Registered
                                    </Typography>
                                </Box>

                                {/* Completed */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                        <strong>{exam.stats.completed || 0}</strong> Completed
                                    </Typography>
                                </Box>

                                {/* Pending */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PendingIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                        <strong>{exam.stats.pending || 0}</strong> Pending
                                    </Typography>
                                </Box>

                                {/* Auto-submitted */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SendIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
                                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
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
                                                background: 'rgba(239, 68, 68, 0.06)',
                                                border: '1px solid rgba(239, 68, 68, 0.15)',
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
                        background: '#111A50',
                        color: 'white',
                        padding: '10px 22px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(17, 26, 80, 0.25)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': {
                            background: '#080D2B',
                            transform: 'scale(1.03)',
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: '0.3px' }}>
                        Explore ›
                    </Typography>
                </Box>

                {/* Date */}
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
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
                        border: '1px solid #e2e8f0',
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
                    <EditIcon sx={{ mr: 1.5, fontSize: 20, color: '#111A50' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>Edit / View</Typography>
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
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>Restore</Typography>
                    </MenuItem>
                ) : (
                    <MenuItem
                        onClick={() => {
                            onArchive(exam.id);
                            handleMenuClose();
                        }}
                    >
                        <ArchiveIcon sx={{ mr: 1.5, fontSize: 20, color: '#f59e0b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>Archive</Typography>
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
                            background: 'rgba(239, 68, 68, 0.08)',
                        },
                    }}
                >
                    <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Delete</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ExamCard;
