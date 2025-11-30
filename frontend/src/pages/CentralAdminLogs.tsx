import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    FaSearch,
    FaUserEdit,
    FaTrash,
    FaPlusCircle,
    FaArchive,
    FaUndo,
    FaExclamationCircle
} from 'react-icons/fa';
import { getOrganizationLogs } from '../services/centralAdminService';

// Mock Data Interface
interface LogEntry {
    id: string;
    action: string;
    actor: string;
    target: string;
    details: string;
    timestamp: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

const CentralAdminLogs: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await getOrganizationLogs();
                if (data) {
                    // Map backend log format to frontend interface
                    // Backend: { id, action, details, created_at }
                    // Frontend: { id, action, details, timestamp, actor, target, type }
                    const formattedLogs: LogEntry[] = data.map((log: any) => ({
                        id: log.id,
                        action: log.action,
                        actor: 'System', // Default as backend doesn't send actor name yet
                        target: 'N/A',   // Default
                        details: log.details,
                        timestamp: log.created_at,
                        type: 'info'     // Default
                    }));
                    setLogs(formattedLogs);
                }
            } catch (error) {
                console.error("Failed to fetch logs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const getIcon = (action: string) => {
        if (action.includes('CREATE')) return <FaPlusCircle className="text-green-500" />;
        if (action.includes('DELETE')) return <FaTrash className="text-red-500" />;
        if (action.includes('ARCHIVE')) return <FaArchive className="text-orange-500" />;
        if (action.includes('RESTORE')) return <FaUndo className="text-blue-500" />;
        if (action.includes('UPDATE')) return <FaUserEdit className="text-indigo-500" />;
        return <FaExclamationCircle className="text-gray-500" />;
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937', mb: 3 }}>
                Activity Logs
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch className="text-gray-400" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                {loading ? (
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, index) => (
                                <React.Fragment key={log.id}>
                                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                        <ListItemIcon sx={{ mt: 1, fontSize: '1.2rem' }}>
                                            {getIcon(log.action)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
                                                        Target: <strong>{log.target}</strong>
                                                    </Typography>
                                                    <Typography component="span" variant="body2" color="text.secondary">
                                                        {log.details}
                                                    </Typography>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    {index < filteredLogs.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="No logs found." sx={{ textAlign: 'center', color: 'text.secondary' }} />
                            </ListItem>
                        )}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default CentralAdminLogs;
