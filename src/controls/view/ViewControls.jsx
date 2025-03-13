import React, { useCallback } from 'react';
import * as THREE from 'three';

// Constants
const ANIMATION_DURATION = 1000;
const VIEW_DISTANCE_FACTOR = 1.5;

class ViewManager {
    constructor() {
        this.animationRef = null;
        this.animating = false;
    }

    initialize(cameraStateManager, getModelSize) {
        this.cameraStateManager = cameraStateManager;
        this.getModelSize = getModelSize;
    }

    // Calculate position for a specific view based on model size
    calculateViewPosition(view, modelSize) {
        const distance = modelSize * VIEW_DISTANCE_FACTOR;
        const positions = {
            front: [0, 0, distance],
            back: [0, 0, -distance],
            left: [-distance, 0, 0],
            right: [distance, 0, 0],
            top: [0, distance, 0],
            bottom: [0, -distance, 0],
            isometric: [distance * 0.7, distance * 0.7, distance * 0.7],
            default: [0, distance * 0.5, distance]
        };

        const positionArray = positions[view] || positions.default;
        return new THREE.Vector3(positionArray[0], positionArray[1], positionArray[2]);
    }

    // Animate camera movement
    animateCamera(currentCamera, controls, newPosition, targetPosition, onAnimationComplete) {
        if (!currentCamera || !controls) return;

        // Store starting position and orientation
        const startPos = currentCamera.position.clone();
        const startTarget = controls.target.clone();

        // Cancel any ongoing animation
        if (this.animationRef) {
            cancelAnimationFrame(this.animationRef);
        }

        const startTime = Date.now();
        this.animating = true;

        // Animation function
        const animateCameraMove = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // Interpolate position
            const newPos = new THREE.Vector3().lerpVectors(
                startPos,
                newPosition,
                easeProgress
            );
            currentCamera.position.copy(newPos);

            // Interpolate target
            const newTarget = new THREE.Vector3().lerpVectors(
                startTarget,
                targetPosition,
                easeProgress
            );
            controls.target.copy(newTarget);

            // Update controls
            controls.update();

            // Continue animation if not complete
            if (progress < 1) {
                this.animationRef = requestAnimationFrame(animateCameraMove);
            } else {
                this.animating = false;
                if (onAnimationComplete) onAnimationComplete();
            }
        };

        // Start animation
        this.animationRef = requestAnimationFrame(animateCameraMove);
        return this.animating;
    }

    // Handle frame all view
    handleFrameAll(modelRef, currentCamera, controls, isOrthographic, onAnimationComplete) {
        // Get bounding box of the model
        const box = new THREE.Box3().setFromObject(modelRef);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Calculate optimal distance
        const maxDim = Math.max(size.x, size.y, size.z);
        let distance;

        if (isOrthographic) {
            // For orthographic, we just need enough space
            distance = maxDim * 1.2;
        } else {
            // For perspective, calculate based on FOV
            const fov = currentCamera.fov * (Math.PI / 180);
            distance = maxDim / (2 * Math.tan(fov / 2)) * 1.2;
        }

        // Get isometric direction
        const direction = new THREE.Vector3(1, 1, 1).normalize();

        // Calculate new position
        const position = center.clone().add(direction.multiplyScalar(distance));

        // Animate to the new position
        return this.animateCamera(currentCamera, controls, position, center, onAnimationComplete);
    }

    // Set optimal initial view
    setOptimalInitialView(model, camera, controls) {
        if (!model || !camera || !controls) {
            return false;
        }

        // Calculate bounding box to find the optimal distance
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Get isometric position
        const isometricPosition = this.calculateViewPosition('isometric', maxDim);

        // Set camera position
        camera.position.copy(isometricPosition);
        controls.target.set(0, 0, 0);
        controls.update();

        return true;
    }

    // Clean up resources
    cleanup() {
        if (this.animationRef) {
            cancelAnimationFrame(this.animationRef);
            this.animationRef = null;
        }
        this.animating = false;
    }
}

// Singleton instance
export const viewManager = new ViewManager();

const ViewControls = ({ onViewChange, cameraManager, currentCamera, controls, modelRef, isOrthographic, setAnimating }) => {
    // Engineering-style view icons
    const views = [
        { name: 'Front', icon: '↑', view: 'front' },
        { name: 'Back', icon: '↓', view: 'back' },
        { name: 'Left', icon: '←', view: 'left' },
        { name: 'Right', icon: '→', view: 'right' },
        { name: 'Top', icon: '⌄', view: 'top' },
        { name: 'Bottom', icon: '⌃', view: 'bottom' },
        { name: 'Isometric', icon: '⬦', view: 'isometric' },
        { name: 'Frame All', icon: '⤧', view: 'frame' }
    ];

    // Handle view changes internally
    const handleViewChange = useCallback((view) => {
        if (!controls || !currentCamera || viewManager.animating) return;

        if (view === 'frame') {
            setAnimating(true);
            viewManager.handleFrameAll(
                modelRef.current,
                currentCamera,
                controls,
                isOrthographic,
                () => setAnimating(false)
            );
            return;
        }

        setAnimating(true);

        // Calculate target (center of the model)
        const target = new THREE.Vector3(0, 0, 0);

        // Update model size in the camera manager if needed
        if (modelRef.current) {
            const modelSize = (() => {
                const box = new THREE.Box3().setFromObject(modelRef.current);
                const size = box.getSize(new THREE.Vector3());
                return Math.max(size.x, size.y, size.z);
            })();

            if (cameraManager && modelSize !== cameraManager.modelSize) {
                cameraManager.updateModelSize(modelSize);
            }
        }

        // Get new position based on view
        const newPosition = cameraManager ?
            cameraManager.getPositionForView(view) :
            viewManager.calculateViewPosition(view, modelRef.current ? viewManager.getModelSize() : 5);

        // Animate to the new position
        viewManager.animateCamera(
            currentCamera,
            controls,
            newPosition,
            target,
            () => setAnimating(false)
        );
    }, [controls, currentCamera, modelRef, isOrthographic, cameraManager, setAnimating]);

    return (
        <div className="view-controls" style={{
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
                Camera Views
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px'
            }}>
                {views.map((view) => (
                    <button
                        key={view.view}
                        onClick={() => {
                            // Pass to parent if provided, otherwise handle internally
                            if (onViewChange) {
                                onViewChange(view.view);
                            } else {
                                handleViewChange(view.view);
                            }
                        }}
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
                            padding: '8px 4px',
                            transition: 'background-color 0.2s ease',
                            width: '100%',
                            fontSize: '12px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        title={`Switch to ${view.name} view`}
                    >
                        <span style={{ fontSize: '14px', marginRight: '4px' }}>{view.icon}</span>
                        {view.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ViewControls;