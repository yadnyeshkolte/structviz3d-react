// KeyboardShortcuts.jsx
import React, { useState } from 'react';

const KeyboardShortcuts = () => {
    const [showShortcuts, setShowShortcuts] = useState(false);

    const shortcuts = [
        { key: 'Middle Mouse', action: 'Orbit' },
        { key: 'Shift + Middle Mouse', action: 'Pan' },
        { key: 'Mouse Wheel', action: 'Zoom' },
        { key: 'Numpad 1', action: 'Front View' },
        { key: 'Numpad 3', action: 'Right View' },
        { key: 'Numpad 7', action: 'Top View' },
        { key: 'Numpad 5', action: 'Toggle Orthographic/Perspective' },
        { key: 'Home', action: 'Frame All' }
    ];

    return (
        <div className="keyboard-shortcuts" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '12px'
        }}>
            <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    padding: '8px',
                    transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
                {showShortcuts ? "Hide Keyboard Shortcuts" : "Show Keyboard Shortcuts"}
            </button>

            {showShortcuts && (
                <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '6px',
                    padding: '8px',
                    marginTop: '4px'
                }}>
                    <table style={{ color: 'white', fontSize: '12px', width: '100%' }}>
                        <tbody>
                        {shortcuts.map((shortcut, index) => (
                            <tr key={index}>
                                <td style={{ padding: '4px', fontWeight: 'bold' }}>{shortcut.key}</td>
                                <td style={{ padding: '4px' }}>{shortcut.action}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default KeyboardShortcuts;