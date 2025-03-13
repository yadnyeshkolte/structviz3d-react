import React, { useState } from 'react';
import EnhancedWireframeMode from './EnhancedWireframeMode.js';

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

    const resetMaterials = () => {
        if (modelRef.current) {
            modelRef.current.traverse((child) => {
                if (child.isMesh) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => {
                            material.wireframe = false;
                        });
                    } else if (child.material) {
                        child.material.wireframe = false;
                    }
                }
            });
        }
    };

    const toggleDrawingMode = () => {
        const newWireframeState = !isWireframe;

        if (!newWireframeState) {
            // Turning off wireframe - handle both simple and pencil modes
            EnhancedWireframeMode.applyPencilView(scene, renderer, currentCamera, false);
            resetMaterials();
        } else {
            // Turning on wireframe
            if (mode === 'pencil') {
                EnhancedWireframeMode.applyPencilView(scene, renderer, currentCamera, true);
            } else {
                // Simple wireframe mode
                if (modelRef.current) {
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
            }
        }

        // Call toggleWireframe after handling the material changes
        toggleWireframe();
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
                    Drawing View
                </h3>
            </div>

            <div style={{
                display: 'flex',
                gap: '8px'
            }}>
                <button
                    onClick={toggleDrawingMode}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 12px',
                        backgroundColor: isWireframe ? 'rgba(66, 135, 245, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        fontSize: '14px',
                    }}
                    title={isWireframe ? "Disable drawing view" : "Enable drawing view"}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {isWireframe ? (
                            // Toggle Off icon (X)
                            <>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </>
                        ) : (
                            // Toggle On icon (Check)
                            <polyline points="20 6 9 17 4 12"></polyline>
                        )}
                    </svg>
                </button>

                <button
                    onClick={() => handleModeChange('simple')}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: isWireframe && mode === 'simple' ? 'rgba(66, 135, 245, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        opacity: isWireframe ? 1 : 0.5
                    }}
                >
                    Wireframe
                </button>

                <button
                    onClick={() => handleModeChange('pencil')}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: isWireframe && mode === 'pencil' ? 'rgba(66, 135, 245, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        opacity: isWireframe ? 1 : 0.5
                    }}
                >
                    Pencil
                </button>
            </div>
        </div>
    );
};

export default WireframeControls;