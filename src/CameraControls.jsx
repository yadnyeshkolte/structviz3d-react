// CameraControls.jsx
import React from 'react';

const CameraControls = ({ isOrthographic, toggleCameraMode }) => {
    return (
        <div className="camera-controls" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '12px'
        }}>
            <div style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
            }}>
                Camera Type
            </div>

            <button
                onClick={toggleCameraMode}
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
                {isOrthographic ? "Switch to Perspective" : "Switch to Orthographic"}
            </button>
        </div>
    );
};

export default CameraControls;