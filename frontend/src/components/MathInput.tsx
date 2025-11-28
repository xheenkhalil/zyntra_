import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import 'mathlive';

// Local declaration removed in favor of src/types.d.ts

interface MathInputProps {
    value: string;
    onChange: (latex: string) => void;
}

const MathInput: React.FC<MathInputProps> = ({ value, onChange }) => {
    const mfRef = useRef<HTMLElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait for custom element to be defined
        if (customElements.get('math-field')) {
            setIsReady(true);
        } else {
            customElements.whenDefined('math-field').then(() => setIsReady(true));
        }
    }, []);

    // Effect for initialization and cleanup (runs once)
    useEffect(() => {
        const mf = mfRef.current;
        if (!mf) return;

        // Listen for changes
        const handleInput = (evt: Event) => {
            onChange((evt.target as any).value);
        };

        mf.addEventListener('input', handleInput);

        // Force z-index on the virtual keyboard instance if possible
        if ((window as any).mathVirtualKeyboard) {
            (window as any).mathVirtualKeyboard.container.style.zIndex = '10000';
        }

        // Inject global style to force z-index
        const style = document.createElement('style');
        style.innerHTML = `
            .ML__keyboard {
                z-index: 10001 !important;
            }
            body .ML__keyboard {
                z-index: 10001 !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            mf.removeEventListener('input', handleInput);
            document.head.removeChild(style);
            // Hide keyboard on unmount
            if ((window as any).mathVirtualKeyboard) {
                (window as any).mathVirtualKeyboard.hide();
            }
        };
    }, [isReady]); // Removed value and onChange from dependencies to prevent re-running

    // Effect for value synchronization
    useEffect(() => {
        const mf = mfRef.current;
        if (!mf) return;

        // Sync value from prop to math-field
        // Only update if different to avoid cursor jumping
        if ((mf as any).value !== value) {
            (mf as any).value = value;
        }
    }, [value, isReady]);

    return (
        <Box sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            background: '#f8fafc'
        }}>
            <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
                Equation Editor (MathLive)
            </Typography>
            <Box sx={{
                fontSize: '24px',
                background: 'white',
                padding: '8px',
                borderRadius: '4px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
                {/* @ts-ignore */}
                <math-field
                    ref={mfRef}
                    style={{
                        width: '100%',
                        display: 'block',
                        // @ts-ignore
                        '--keyboard-zindex': '10000',
                        zIndex: 10000
                    }}
                >
                    {value}
                </math-field>
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#94a3b8' }}>
                Type LaTeX or use the virtual keyboard.
            </Typography>
        </Box>
    );
};

export default MathInput;
