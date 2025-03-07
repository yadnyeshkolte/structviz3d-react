import React from 'react';

const ViewerControls = ({
                            children,
                            isFullscreen,
                            toggleFullscreen,
                            visible = true,
                            onToggleLock,
                            onToggleShortcuts,
                            onZoomIn,
                            onZoomOut,
                            dragModeEnabled,
                            toggleDragMode,
                            captureScreenshot
                        }) => {
    return (
        <div className={`viewer-controls ${visible ? 'visible' : 'hidden'}`} style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(33, 33, 33, 0.75)',
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(20px)',
            pointerEvents: visible ? 'auto' : 'none',
            zIndex: 10,
            maxHeight: '80vh',
            overflowY: 'auto'
        }}>
            <div style={{
                display: 'flex',
                gap: '8px',
                alignSelf: 'flex-end'
            }}>
                <button
                    onClick={captureScreenshot}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '40px',
                        height: '40px',
                        alignSelf: 'flex-end',
                        marginTop: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    title="Take Screenshot"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                </button>
                <button
                    onClick={onToggleShortcuts} // Add this prop to ViewerControls
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '40px',
                        height: '40px',
                        alignSelf: 'flex-end',
                        marginTop: '8px' // Add some spacing between buttons
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    title="Keyboard Shortcuts"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                        <path d="M6 8h.01"></path>
                        <path d="M10 8h.01"></path>
                        <path d="M14 8h.01"></path>
                        <path d="M18 8h.01"></path>
                        <path d="M8 12h.01"></path>
                        <path d="M12 12h.01"></path>
                        <path d="M16 12h.01"></path>
                        <path d="M7 16h10"></path>
                    </svg>
                </button>
                <button
                    onClick={() => onToggleLock()} // This will now just hide the panel
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'red',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '40px',
                        height: '40px',
                        alignSelf: 'flex-end',
                    }}
                    title="Hide controls"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18"/>
                        <path d="M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div style={{
                display: 'flex',
                gap: '8px',
                alignSelf: 'flex-end'
            }}>
                <button
                    onClick={toggleDragMode}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        backgroundColor: dragModeEnabled ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '40px',
                        height: '40px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = dragModeEnabled ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = dragModeEnabled ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
                    title={dragModeEnabled ? "Disable Drag Mode" : "Enable Drag Mode"}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 9l4-4 4 4"/>
                        <path d="M5 15l4 4 4-4"/>
                        <path d="M19 9l-4-4-4 4"/>
                        <path d="M19 15l-4 4-4-4"/>
                    </svg>
                </button>
                <button
                    onClick={onZoomIn}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '40px',
                        height: '40px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    title="Zoom In"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </button>

                <button
                    onClick={onZoomOut}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '40px',
                        height: '40px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    title="Zoom Out"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </button>
                {/* Fullscreen button */}
                <button
                    onClick={toggleFullscreen}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '40px',
                        height: '40px',
                        alignSelf: 'flex-end'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                    {isFullscreen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
                            <path
                                d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
                            <path
                                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                        </svg>
                    )}
                </button>
            </div>
            {/* Divider line */}
            <div style={{
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                width: '100%',
                margin: '4px 0'
            }}/>

            {/* Children components (like ColorSelector and ViewControls) */}
            {children}
        </div>
    );
};

export default ViewerControls;