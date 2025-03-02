import React from 'react';

const KeyboardShortcuts = ({ isVisible, onClose }) => {
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

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 200,
            backdropFilter: 'blur(3px)'
        }}>
            <div style={{
                backgroundColor: 'rgba(40, 40, 40, 0.95)',
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <h2 style={{ color: 'white', marginTop: '0', textAlign: 'center' }}>Keyboard Shortcuts</h2>

                <table style={{ color: 'white', width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                    {shortcuts.map((shortcut, index) => (
                        <tr key={index} style={{ borderBottom: index === shortcuts.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{shortcut.key}</td>
                            <td style={{ padding: '10px' }}>{shortcut.action}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KeyboardShortcuts;