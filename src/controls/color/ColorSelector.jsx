import React, { useState, useEffect, useRef } from 'react';

const ColorSelector = ({ currentColor, onColorChange }) => {
    const [showPalette, setShowPalette] = useState(false);
    const paletteRef = useRef(null);

    // Google-style color palette
    const colorPalette = [
        // First row - primary colors
        { name: 'Red', value: '#EA4335' },
        { name: 'Green', value: '#34A853' },
        { name: 'Yellow', value: '#FBBC05' },

        // Second row - secondary colors
        { name: 'Orange', value: '#FF9800' },
        { name: 'Blue', value: '#4285F4' },
        { name: 'Teal', value: '#009688' },

        // Third row - grayscale
        { name: 'Dark Gray', value: '#333333' },
        { name: 'Light Gray', value: '#999999' },
        { name: 'White', value: '#FFFFFF' },

        // Fourth row - additional colors
        { name: 'Cyan', value: '#00BCD4' },
        { name: 'Brown', value: '#795548' },
        { name: 'Lime', value: '#CDDC39' },
    ];

    // Close palette when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (paletteRef.current && !paletteRef.current.contains(event.target)) {
                setShowPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="color-selector" style={{ position: 'relative' }}>
            <div className="color-selector-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '8px'
            }}>
                <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>Model Color</label>
            </div>

            {/* Current color display / toggle button */}
            <button
                onClick={() => setShowPalette(!showPalette)}
                style={{
                    backgroundColor: currentColor,
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '3px solid white',
                    cursor: 'pointer',
                    padding: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                title="Change color"
            >
                {showPalette && (
                    <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '18px',
                        color: isColorLight(currentColor) ? '#333' : '#fff'
                    }}>
                        ×
                    </span>
                )}
            </button>

            {/* Color palette dropdown */}
            {showPalette && (
                <div
                    ref={paletteRef}
                    className="color-palette"
                    style={{
                        position: 'relative',
                        top: '45px',
                        right: '0',
                        width: '235px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        padding: '12px',
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >
                    {/* Preset colors grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px'
                    }}>
                        {colorPalette.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => {
                                    onColorChange(color.value);
                                    setShowPalette(false);
                                }}
                                title={color.name}
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    backgroundColor: color.value,
                                    border: currentColor === color.value
                                        ? '2px solid #4285F4'
                                        : '1px solid #DDDDDD',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    padding: 0,
                                    boxShadow: currentColor === color.value
                                        ? '0 0 0 2px rgba(66, 133, 244, 0.2)'
                                        : 'none',
                                    position: 'relative'
                                }}
                            >
                                {currentColor === color.value && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        backgroundColor: isColorLight(color.value) ? '#333' : '#fff',
                                        opacity: 0.8
                                    }} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Custom color picker */}
                    <div style={{
                        borderTop: '1px solid #EEEEEE',
                        paddingTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <label htmlFor="custom-color" style={{
                            fontSize: '14px',
                            color: '#666'
                        }}>Custom:</label>

                        <div style={{
                            position: 'relative',
                            width: '40px',
                            height: '40px',
                            overflow: 'hidden',
                            borderRadius: '4px',
                            border: '1px solid #DDDDDD'
                        }}>
                            <input
                                id="custom-color"
                                type="color"
                                value={currentColor}
                                onChange={(e) => onColorChange(e.target.value)}
                                style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    left: '-5px',
                                    width: '50px',
                                    height: '50px',
                                    border: 'none',
                                    padding: 0,
                                    background: 'none'
                                }}
                                title="Choose custom color"
                            />
                        </div>

                        <input
                            type="text"
                            value={currentColor}
                            onChange={(e) => {
                                // Validate hex color
                                const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
                                if (hexRegex.test(e.target.value)) {
                                    onColorChange(e.target.value);
                                }
                            }}
                            style={{
                                width: '80px',
                                padding: '6px 8px',
                                border: '1px solid #DDDDDD',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to determine if a color is light or dark
function isColorLight(color) {
    // Convert hex to RGB
    let r, g, b;

    if (color.startsWith('#')) {
        color = color.slice(1);

        // Convert 3-digit hex to 6-digit
        if (color.length === 3) {
            color = color.split('').map(char => char + char).join('');
        }

        r = parseInt(color.substring(0, 2), 16);
        g = parseInt(color.substring(2, 4), 16);
        b = parseInt(color.substring(4, 6), 16);
    } else {
        return true; // Default to light for non-hex colors
    }

    // Calculate perceptive luminance
    // See: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5;
}

export default ColorSelector;