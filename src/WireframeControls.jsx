import React, { useState } from 'react';
import EnhancedWireframeMode from './EnhancedWireframeMode';

const WireframeControls = ({
                               modelRef,
                               isWireframe,
                               toggleWireframe,
                               scene,
                               renderer,
                               currentCamera
                           }) => {
    const [mode, setMode] = useState('simple'); // 'simple' or 'pencil'

    const handleModeChange = (newMode) => {
        setMode(newMode);

        if (newMode === 'simple') {
            // Just use the basic wireframe
            if (isWireframe && modelRef.current) {
                EnhancedWireframeMode.applyPencilView(scene, renderer, currentCamera, false);

                modelRef.current.traverse((child) => {
                    if (child.isMesh) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => {
                                material.wireframe = true;
                                material.wireframeLinewidth = 2;
                            });
                        } else if (child.material) {
                            child.material.wireframe = true;
                            child.material.wireframeLinewidth = 2;
                        }
                    }
                });
            }
        } else if (newMode === 'pencil') {
            // Apply enhanced pencil view
            if (isWireframe) {
                EnhancedWireframeMode.applyPencilView(scene, renderer, currentCamera, true);
            }
        }
    };

    const toggleDrawingMode = () => {
        const newWireframeState = !isWireframe;
        toggleWireframe();

        if (newWireframeState) {
            // Turning on wireframe
            if (mode === 'pencil') {
                EnhancedWireframeMode.applyPencilView(scene, renderer, currentCamera, true);
            }
        } else {
            // Turning off wireframe
            EnhancedWireframeMode.applyPencilView(scene, renderer, currentCamera, false);
        }
    };

    return (
        <div className="wireframe-controls" style={{
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            marginBottom: '8px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    color: 'white',
                    fontWeight: 500
                }}>
                    Drawing Mode
                </h3>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <button
                    onClick={toggleDrawingMode}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: isWireframe ? 'rgba(66, 135, 245, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        fontSize: '14px'
                    }}
                    title="Toggle drawing mode"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    {isWireframe ? "Disable Drawing Mode" : "Enable Drawing Mode"}
                </button>

                {isWireframe && (
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '4px'
                    }}>
                        <button
                            onClick={() => handleModeChange('simple')}
                            style={{
                                padding: '6px 10px',
                                backgroundColor: mode === 'simple' ? 'rgba(66, 135, 245, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Simple Wireframe
                        </button>
                        <button
                            onClick={() => handleModeChange('pencil')}
                            style={{
                                padding: '6px 10px',
                                backgroundColor: mode === 'pencil' ? 'rgba(66, 135, 245, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Pencil Drawing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WireframeControls;