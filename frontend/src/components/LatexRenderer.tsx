import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
    text: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ text }) => {
    if (!text) return null;

    // Regex to find LaTeX patterns: $$...$$ or \(...\)
    // We'll split the text by these patterns
    const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.match(regex)) {
                    // It's LaTeX
                    try {
                        // Remove delimiters
                        let latex = part;
                        let displayMode = false;

                        if (part.startsWith('$$') && part.endsWith('$$')) {
                            latex = part.slice(2, -2);
                            displayMode = true; // Block math
                        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
                            latex = part.slice(2, -2);
                            displayMode = true;
                        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
                            latex = part.slice(2, -2);
                            displayMode = false; // Inline math
                        }

                        const html = katex.renderToString(latex, {
                            throwOnError: false,
                            displayMode: displayMode,
                            macros: {
                                "\\exponentialE": "\\text{e}",
                                "\\d": "\\text{d}",
                                "\\differentialD": "\\text{d}",
                                "\\imaginaryI": "\\text{i}",
                            }
                        });

                        return (
                            <span
                                key={index}
                                dangerouslySetInnerHTML={{ __html: html }}
                                style={{ margin: '0 2px' }}
                            />
                        );
                    } catch (error) {
                        console.error("KaTeX rendering error:", error);
                        return <span key={index} style={{ color: 'red' }}>{part}</span>;
                    }
                } else {
                    // It's normal text
                    return <span key={index}>{part}</span>;
                }
            })}
        </span>
    );
};

export default LatexRenderer;
