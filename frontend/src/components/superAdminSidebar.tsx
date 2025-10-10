import React from 'react';
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    Tooltip,
    Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const SuperAdminSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/superadmin' },
        { text: 'Users', icon: <PeopleIcon />, path: '/superadmin/users' },
        { text: 'Organizations', icon: <SchoolIcon />, path: '/superadmin/organizations' },
        { text: 'Guest Quizzes', icon: <QuizIcon />, path: '/superadmin/guest-quizzes' },
    ];

    return (
        <Box
            sx={{
                width: collapsed ? '70px' : '240px',
                backgroundColor: '#0D47A1',
                color: '#FFFFFF',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                overflowX: 'hidden',
                position: 'fixed',
                left: 0,
                top: 0,
                boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
                zIndex: (theme) => theme.zIndex.drawer + 2,
            }}
        >
            {/* Toggle Button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: collapsed ? 'center' : 'flex-end',
                    alignItems: 'center',
                    p: 1,
                    mt: 1,
                }}
            >
                <IconButton onClick={onToggle} sx={{ color: '#FFFFFF' }}>
                    {collapsed ? <MenuOpenIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>

            {/* Menu Items */}
            <List>
                {menuItems.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path === '/superadmin' && location.pathname === '/superadmin');

                    return (
                        <Tooltip
                            key={item.text}
                            title={collapsed ? item.text : ''}
                            placement="right"
                            arrow
                        >
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={isActive}
                                sx={{
                                    color: '#FFFFFF',
                                    py: 1.5,
                                    '&.Mui-selected': {
                                        backgroundColor: '#1565C0',
                                        '&:hover': {
                                            backgroundColor: '#1976D2',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: '#1976D2',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: '#FFFFFF',
                                        minWidth: collapsed ? '40px' : '56px',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {!collapsed && (
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '0.95rem',
                                            fontWeight: 500,
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </Tooltip>
                    );
                })}
                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mt: 1 }} />
            </List>
        </Box>
    );
};

export default SuperAdminSidebar;
