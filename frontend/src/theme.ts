// /frontend/src/theme.ts

import { createTheme } from '@mui/material/styles';

// Using the original Zyntra Brand Colors
const zyntraPalette = {
    primaryBlue: '#3C4DCE',
    primaryDarkBlue: '#2C31B9',
    accentCyan: '#00E0FF',
    accentPurple: '#7230A6',
    backgroundLight: '#F8F9FC',
    surfaceWhite: '#FFFFFF',
    textDark: '#1E1E49',
    textMedium: '#5B5BA9',
    borderLight: '#D3D3E9',
};

// Create a custom MUI theme using Zyntra colors
export const zyntraTheme = createTheme({
    palette: {
        primary: {
            main: zyntraPalette.primaryBlue,
            dark: zyntraPalette.primaryDarkBlue,
        },
        secondary: {
            main: zyntraPalette.accentCyan,
            contrastText: zyntraPalette.textDark,
        },
        background: {
            default: zyntraPalette.backgroundLight,
            paper: zyntraPalette.surfaceWhite,
        },
        text: {
            primary: zyntraPalette.textDark,
            secondary: zyntraPalette.textMedium,
        },
        divider: zyntraPalette.borderLight,
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        h4: {
            fontWeight: 800,
            color: zyntraPalette.textDark,
        },
        h6: {
            fontWeight: 700,
            color: zyntraPalette.textDark,
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                },
                containedPrimary: {
                    color: 'white',
                    '&:hover': {
                        boxShadow: 'none',
                    }
                },
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    border: `1px solid ${zyntraPalette.borderLight}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: zyntraPalette.backgroundLight, // #F8F9FC
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    color: zyntraPalette.textDark,
                    borderBottom: `2px solid ${zyntraPalette.borderLight}`,
                },
                body: {
                    borderBottom: `1px solid ${zyntraPalette.borderLight}`,
                    padding: '16px',
                }
            }
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    backgroundColor: zyntraPalette.surfaceWhite, // #FFFFFF
                    '&:hover': {
                        backgroundColor: '#F0F2F9 !important', // Subtle hover
                    },
                    '&:nth-of-type(even)': {
                        backgroundColor: '#FCFDFE', // Very subtle zebra striping
                    }
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    overflowX: 'auto',
                    maxWidth: '100%',
                }
            }
        }
    }
});