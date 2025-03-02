// CameraStateManager.js
import * as THREE from 'three';

class CameraStateManager {
    constructor() {
        this.perspectiveCamera = null;
        this.orthographicCamera = null;
        this.currentCamera = null;
        this.controls = null;
        this.isOrthographic = false;
        this.viewPositions = {};
        this.modelSize = 5; // Default size
    }

    initialize(perspectiveCamera, orthographicCamera, controls, modelSize) {
        this.perspectiveCamera = perspectiveCamera;
        this.orthographicCamera = orthographicCamera;
        this.controls = controls;
        this.currentCamera = perspectiveCamera;
        this.modelSize = modelSize;
        this.updateViewPositions();
    }

    updateModelSize(modelSize) {
        this.modelSize = modelSize;
        this.updateViewPositions();
    }

    updateViewPositions() {
        const distance = this.modelSize * 1.5; // VIEW_DISTANCE_FACTOR
        this.viewPositions = {
            front: new THREE.Vector3(0, 0, distance),
            back: new THREE.Vector3(0, 0, -distance),
            left: new THREE.Vector3(-distance, 0, 0),
            right: new THREE.Vector3(distance, 0, 0),
            top: new THREE.Vector3(0, distance, 0),
            bottom: new THREE.Vector3(0, -distance, 0),
            isometric: new THREE.Vector3(distance * 0.7, distance * 0.7, distance * 0.7),
            default: new THREE.Vector3(0, distance * 0.5, distance)
        };
    }

    toggleCameraMode() {
        this.isOrthographic = !this.isOrthographic;

        // Save current position and target
        const oldPosition = this.currentCamera.position.clone();
        const oldTarget = this.controls.target.clone();

        if (this.isOrthographic) {
            this.currentCamera = this.orthographicCamera;
        } else {
            this.currentCamera = this.perspectiveCamera;
        }

        // Transfer position and orientation
        this.currentCamera.position.copy(oldPosition);
        this.controls.object = this.currentCamera;
        this.controls.target.copy(oldTarget);
        this.controls.update();

        return this.isOrthographic;
    }

    getPositionForView(view) {
        return this.viewPositions[view] || this.viewPositions.default;
    }

    getCurrentCamera() {
        return this.currentCamera;
    }

    getControls() {
        return this.controls;
    }
}

export default new CameraStateManager();