import React from 'react';

const ViewerControls = ({
                            children,
                            isFullscreen,
                            toggleFullscreen,
                            visible = true,
                            locked = false,
                            onToggleLock,
                            onToggleShortcuts
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
            {/* Lock/unlock button */}
            <button
                onClick={onToggleLock}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    backgroundColor: locked ? 'rgba(75, 181, 67, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: '40px',
                    height: '40px',
                    alignSelf: 'flex-end',
                }}
                title={locked ? "Unlock controls" : "Lock controls"}
            >
                {locked ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    </svg>
                )}
            </button>
            <div style={{
                display: 'flex',
                gap: '8px',
                alignSelf: 'flex-end'
            }}>
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                )}
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