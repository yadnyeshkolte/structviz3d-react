import React from 'react';

const KeyboardShortcuts = ({ isVisible, onClose }) => {
    const shortcuts = [
        { key: 'f', action: 'Toggle fullscreen' },
        { key: 'h', action: 'Toggle controls visibility' },
        { key: 'Esc', action: 'Exit locked mode / close popups' },
        { key: '5', action: 'Toggle perspective/orthographic camera' },
        { key: '+/-', action: 'Zoom in/out' },
        { key: 'o', action: 'Reset model orientation' },
        { key: 'q', action: 'Toggle wireframe mode' },
        { key: 'x', action: 'Toggle floor grid (XZ)' },
        { key: 'y', action: 'Toggle side grid (XY)' },
        { key: 'z', action: 'Toggle side grid (YZ)' },
        { key: 'd', action: 'Toggle drag/rotate mode' },
        { key: 'e', action: 'Toggle spotlight' },
    ];

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 200,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: 'rgba(30, 30, 34, 0.95)',
                borderRadius: '12px',
                padding: '24px 28px',
                maxWidth: '600px',
                width: '90%',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                position: 'relative',
                color: '#f0f0f0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(to right, #FFFFFF, #00ccff)'
                }}></div>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(80, 80, 90, 0.3)',
                        border: 'none',
                        color: 'red',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(200, 100, 120, 0.5)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(80, 80, 90, 0.3)'}
                >
                    <p>x</p>
                </button>

                <h2 style={{
                    color: 'white',
                    marginTop: '6px',
                    marginBottom: '24px',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>Keyboard Shortcuts</h2>

                <div style={{
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    paddingRight: '8px',
                    marginRight: '-8px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: '0 4px'
                    }}>
                        <tbody>
                        {shortcuts.map((shortcut, index) => (
                            <tr key={index} style={{
                                transition: 'background-color 0.15s ease',
                            }}>
                                <td style={{
                                    padding: '12px 16px',
                                    fontWeight: '600',
                                    background: 'rgba(60, 60, 70, 0.5)',
                                    borderRadius: '6px 0 0 6px',
                                    width: '40%'
                                }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        backgroundColor: 'rgba(80, 80, 100, 0.7)',
                                        borderRadius: '4px',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
                                        fontFamily: 'monospace',
                                        fontSize: '14px',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {shortcut.key}
                                    </div>
                                </td>
                                <td style={{
                                    padding: '12px 16px',
                                    background: 'rgba(50, 50, 60, 0.5)',
                                    borderRadius: '0 6px 6px 0'
                                }}>
                                    {shortcut.action}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)'
                }}>
                    Press <span style={{
                    padding: '2px 6px',
                    color: 'red',
                    backgroundColor: 'rgba(80, 80, 100, 0.7)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    margin: '0 2px'
                }}>X</span> to close
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcuts;