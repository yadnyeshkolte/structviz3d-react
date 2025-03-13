import * as THREE from 'three';

// ViewerControlsUtils.jsx - Helper functions extracted from ModelViewer
const ViewerControlsUtils = {
    // Zoom in function
    handleZoomIn: (isOrthographic, orthographicCameraRef, currentCameraRef, controlsRef) => {
        if (!controlsRef.current || !currentCameraRef.current) return;

        if (isOrthographic) {
            // For orthographic camera, adjust the zoom property
            if (orthographicCameraRef.current) {
                // Decrease the zoom factor (which increases the view size)
                orthographicCameraRef.current.zoom *= 1.2;
                orthographicCameraRef.current.updateProjectionMatrix();
            }
        } else {
            // For perspective camera, move closer to target
            const direction = new THREE.Vector3();
            direction.subVectors(controlsRef.current.target, currentCameraRef.current.position).normalize();

            // Move camera closer to target (zoom in)
            const distance = direction.multiplyScalar(1); // Adjust this value for zoom speed
            currentCameraRef.current.position.add(distance);
        }

        controlsRef.current.update();
    },

    // Zoom out function
    handleZoomOut: (isOrthographic, orthographicCameraRef, currentCameraRef, controlsRef) => {
        if (!controlsRef.current || !currentCameraRef.current) return;

        if (isOrthographic) {
            // For orthographic camera, adjust the zoom property
            if (orthographicCameraRef.current) {
                // Increase the zoom factor (which decreases the view size)
                orthographicCameraRef.current.zoom *= 0.8;
                orthographicCameraRef.current.updateProjectionMatrix();
            }
        } else {
            // For perspective camera, move away from target
            const direction = new THREE.Vector3();
            direction.subVectors(controlsRef.current.target, currentCameraRef.current.position).normalize();

            // Move camera away from target (zoom out)
            const distance = direction.multiplyScalar(-1); // Negative value for zooming out
            currentCameraRef.current.position.add(distance);
        }

        controlsRef.current.update();
    },

    // Toggle fullscreen mode
    toggleFullscreen: (container, setIsFullscreen) => {
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(err => console.error(`Error enabling fullscreen: ${err.message}`));
        } else {
            document.exitFullscreen()
                .then(() => setIsFullscreen(false))
                .catch(err => console.error(`Error exiting fullscreen: ${err.message}`));
        }
    },

    // Update model color
    updateModelColor: (color, modelRef) => {
        // Update the model material without affecting camera
        if (!modelRef.current) return;

        modelRef.current.traverse((child) => {
            if (!child.isMesh) return;

            if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                    mat.color = new THREE.Color(color);
                    mat.needsUpdate = true;
                });
            } else if (child.material) {
                child.material.color = new THREE.Color(color);
                child.material.needsUpdate = true;
            }
        });

        return color; // Return the color for state updates
    }
};

export default ViewerControlsUtils;