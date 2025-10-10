import React, { useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CssBaseline,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;
const collapsedDrawerWidth = 70;

const CourseAdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const handleToggleDrawer = () => {
        setOpen(!open);
    };

    const navItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/courseadmin' },
        { text: 'Students', icon: <PeopleIcon />, path: '/courseadmin/students' },
        { text: 'Exams', icon: <LibraryBooksIcon />, path: '/courseadmin/exams' },
        { text: 'Results', icon: <BarChartIcon />, path: '/courseadmin/results' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* NAVBAR */}
            <AppBar
                position="fixed"
                sx={{
                    width: `calc(100% - ${collapsedDrawerWidth}px)`,
                    ml: `${collapsedDrawerWidth}px`,
                    backgroundColor: '#0D47A1',
                    color: '#FFFFFF',
                    boxShadow: '0px 3px 10px rgba(0,0,0,0.3)',
                    transition: 'width 0.3s ease, margin-left 0.3s ease',
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h5"
                        noWrap
                        sx={{ fontWeight: 600, letterSpacing: '0.5px' }}
                    >
                        Course Admin Portal
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* SIDEBAR */}
            <Drawer
                variant="permanent"
                sx={{
                    width: open ? drawerWidth : collapsedDrawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : collapsedDrawerWidth,
                        boxSizing: 'border-box',
                        borderRight: 'none',
                        backgroundColor: '#0D47A1',
                        color: '#FFFFFF',
                        transition: 'width 0.3s ease',
                        boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
                    },
                }}
            >
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: open ? 'flex-end' : 'center',
                        px: [1],
                    }}
                >
                    <IconButton onClick={handleToggleDrawer} sx={{ color: '#FFFFFF' }}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

                <List sx={{ flexGrow: 1 }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? 'initial' : 'center',
                                        px: 2.5,
                                        color: '#FFFFFF',
                                        backgroundColor: isActive ? '#1565C0' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: '#1976D2',
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                    onClick={() => navigate(item.path)}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: '#FFFFFF',
                                            minWidth: 0,
                                            mr: open ? 3 : 'auto',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            opacity: open ? 1 : 0,
                                            transition: 'opacity 0.3s ease',
                                            '& .MuiListItemText-primary': {
                                                fontWeight: isActive ? 600 : 400,
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

                {/* Logout */}
                <List>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                color: '#FFFFFF',
                                '&:hover': {
                                    backgroundColor: '#1976D2',
                                },
                            }}
                            onClick={logout}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: '#FFFFFF',
                                }}
                            >
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Logout"
                                sx={{
                                    opacity: open ? 1 : 0,
                                    transition: 'opacity 0.3s ease',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>

            {/* MAIN CONTENT */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    transition: 'margin 0.3s ease',
                    ml: open ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
                    bgcolor: 'background.default',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default CourseAdminLayout;
