// Global type definitions
import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                [key: string]: any;
            };
        }
    }
}

// Augment React.JSX as well for newer TS/React versions
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                [key: string]: any;
            };
        }
    }
}
