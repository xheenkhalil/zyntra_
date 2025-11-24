// src/components/PasswordInput.tsx
import React, { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemIcon, ListItemText, LinearProgress, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface PasswordInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** optional confirm field */
    confirmValue?: string;
    onConfirmChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Show validation rules - defaults to true for backward compatibility */
    showValidation?: boolean;
}

const ruleChecks = (pwd: string) => ({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[!@#$%^&*(),.?\":{}|<>[\]\\\/\-+=~`]/.test(pwd),
});

export const PasswordInput: React.FC<PasswordInputProps> = ({
    label,
    name,
    value,
    onChange,
    confirmValue,
    onConfirmChange,
    showValidation = true
}) => {
    const [rules, setRules] = useState(ruleChecks(''));
    const [strength, setStrength] = useState(0);
    const [hasStartedTyping, setHasStartedTyping] = useState(false);
    const [hasStartedTypingConfirm, setHasStartedTypingConfirm] = useState(false);

    useEffect(() => {
        const r = ruleChecks(value);
        setRules(r);
        const passed = Object.values(r).filter(Boolean).length;
        setStrength((passed / 5) * 100);

        // Track if user has started typing
        if (value.length > 0 && !hasStartedTyping) {
            setHasStartedTyping(true);
        }
    }, [value]);

    useEffect(() => {
        // Track if user started typing in confirm field
        if (confirmValue && confirmValue.length > 0 && !hasStartedTypingConfirm) {
            setHasStartedTypingConfirm(true);
        }
    }, [confirmValue]);

    const allMet = Object.values(rules).every(Boolean);
    const match = confirmValue !== undefined && confirmValue !== '' ? value === confirmValue : undefined;

    return (
        <Box sx={{ width: '100%' }}>
            <TextField
                margin="normal"
                required
                fullWidth
                name={name}
                label={label}
                type="password"
                value={value}
                onChange={onChange}
            />
            {confirmValue !== undefined && onConfirmChange && (
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name={`${name}-confirm`}
                    label={`Confirm ${label}`}
                    type="password"
                    value={confirmValue}
                    onChange={onConfirmChange}
                />
            )}

            {/* Only show validation if showValidation is true AND user has started typing */}
            {showValidation && hasStartedTyping && (
                <>
                    {/* Requirements list */}
                    <List dense>
                        <ListItem sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {rules.length ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText primary="At least 8 characters" sx={{ color: rules.length ? 'text.secondary' : 'error.main' }} />
                        </ListItem>
                        <ListItem sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {rules.uppercase ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText primary="At least one uppercase letter" sx={{ color: rules.uppercase ? 'text.secondary' : 'error.main' }} />
                        </ListItem>
                        <ListItem sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {rules.lowercase ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText primary="At least one lowercase letter" sx={{ color: rules.lowercase ? 'text.secondary' : 'error.main' }} />
                        </ListItem>
                        <ListItem sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {rules.number ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText primary="At least one number" sx={{ color: rules.number ? 'text.secondary' : 'error.main' }} />
                        </ListItem>
                        <ListItem sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {rules.special ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText primary="At least one special character" sx={{ color: rules.special ? 'text.secondary' : 'error.main' }} />
                        </ListItem>
                    </List>
                    {/* Strength bar */}
                    <Box sx={{ my: 1 }}>
                        <LinearProgress variant="determinate" value={strength} sx={{ height: 8, borderRadius: 4, backgroundColor: '#e0e0e0' }} />
                        <Typography variant="caption" display="block" textAlign="right" sx={{ mt: 0.5, color: allMet ? 'green' : 'red' }}>
                            {allMet ? 'Strong password' : 'Weak password'}
                        </Typography>
                    </Box>
                </>
            )}

            {/* Only show match indicator if user has started typing in confirm field */}
            {confirmValue !== undefined && hasStartedTypingConfirm && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    {match ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                        <CancelIcon color="error" fontSize="small" />
                    )}
                    <Typography variant="caption" sx={{ ml: 0.5, color: match ? 'green' : 'red' }}>
                        {match ? 'Passwords match' : 'Passwords do not match'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
