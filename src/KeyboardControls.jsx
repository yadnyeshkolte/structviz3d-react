import React, { useEffect } from 'react';

const KeyboardControls = ({
                              // Camera controls
                              toggleCameraMode,
                              handleZoomIn,
                              handleZoomOut,

                              // View controls
                              viewManager,

                              // Model controls
                              resetModelOrientation,
                              toggleFullscreen,

                              // Display controls
                              toggleWireframe,
                              toggleDragMode,
                              toggleSpotlight,
                              toggleControlsLock,
                              toggleShortcuts,

                              // Grid controls
                              toggleXZGrid,
                              toggleXYGrid,
                              toggleYZGrid,

                              // Other controls
                              updateModelColor,
                              animating
                          }) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Skip if we're in a text input or if animation is running
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || animating) {
                return;
            }

            // Get key combo info
            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey || event.metaKey;
            const shift = event.shiftKey;
            const alt = event.altKey;

            // Handle various keyboard shortcuts
            switch (key) {
                // Camera controls
                case 'numpad5':
                case '5':
                    if (alt) toggleCameraMode();
                    break;

                case '=':
                case '+':
                    handleZoomIn();
                    break;

                case '-':
                case '_':
                    handleZoomOut();
                    break;

                // View controls
                case 'numpad1':
                case '1':
                    if (viewManager) viewManager.setFrontView();
                    break;

                case 'numpad3':
                case '3':
                    if (viewManager) viewManager.setRightView();
                    break;

                case 'numpad7':
                case '7':
                    if (viewManager) viewManager.setTopView();
                    break;

                case 'home':
                    if (viewManager) viewManager.resetView();
                    break;

                // Display controls
                case 'f':
                    if (ctrl) {
                        event.preventDefault();
                        toggleFullscreen();
                    }
                    break;

                case 'w':
                    if (ctrl) {
                        event.preventDefault();
                        toggleWireframe();
                    }
                    break;

                case 'd':
                    if (ctrl) {
                        event.preventDefault();
                        toggleDragMode();
                    }
                    break;

                case 'l':
                    if (ctrl) {
                        event.preventDefault();
                        toggleSpotlight();
                    }
                    break;

                case 'h':
                    if (ctrl) {
                        event.preventDefault();
                        toggleShortcuts();
                    }
                    break;

                case 'r':
                    if (ctrl) {
                        event.preventDefault();
                        resetModelOrientation();
                    }
                    break;

                // Grid controls
                case 'g':
                    if (ctrl && !shift && !alt) {
                        event.preventDefault();
                        toggleXZGrid();
                    } else if (ctrl && shift && !alt) {
                        event.preventDefault();
                        toggleXYGrid();
                    } else if (ctrl && !shift && alt) {
                        event.preventDefault();
                        toggleYZGrid();
                    }
                    break;

                // Color shortcuts
                case '0':
                    if (ctrl) {
                        event.preventDefault();
                        updateModelColor('#999999'); // Default gray
                    }
                    break;

                case '9':
                    if (ctrl) {
                        event.preventDefault();
                        updateModelColor('#3498db'); // Blue
                    }
                    break;

                case '8':
                    if (ctrl) {
                        event.preventDefault();
                        updateModelColor('#e74c3c'); // Red
                    }
                    break;

                case 'escape':
                    // Toggle controls lock
                    toggleControlsLock();
                    break;

                default:
                    break;
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);

        // Clean up
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        toggleCameraMode,
        handleZoomIn,
        handleZoomOut,
        viewManager,
        resetModelOrientation,
        toggleFullscreen,
        toggleWireframe,
        toggleDragMode,
        toggleSpotlight,
        toggleControlsLock,
        toggleShortcuts,
        toggleXZGrid,
        toggleXYGrid,
        toggleYZGrid,
        updateModelColor,
        animating
    ]);

    // This component doesn't render anything
    return null;
};

export default KeyboardControls;