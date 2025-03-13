import * as THREE from 'three';

class LightingManager {
    constructor() {
        this.lights = [];
    }

    // Set up and add all lights to the scene
    setupLighting(scene) {
        this.clearLights(scene);
        this.lights = [];

        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Main directional light with shadows
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 7.5);
        mainLight.castShadow = true;

        // Shadow settings
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;

        scene.add(mainLight);
        this.lights.push(mainLight);

        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x223344, 0.5);
        scene.add(hemiLight);
        this.lights.push(hemiLight);

        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight1.position.set(-5, 2, -5);
        scene.add(fillLight1);
        this.lights.push(fillLight1);

        const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight2.position.set(5, 0, -5);
        scene.add(fillLight2);
        this.lights.push(fillLight2);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
        backLight.position.set(0, 5, -10);
        scene.add(backLight);
        this.lights.push(backLight);

        return this.lights;
    }

    // Update light intensities
    updateLightIntensities(intensities) {
        if (!this.lights || this.lights.length === 0) return;

        // Ambient light
        if (intensities.ambient !== undefined && this.lights[0]) {
            this.lights[0].intensity = intensities.ambient;
        }

        // Main directional light
        if (intensities.main !== undefined && this.lights[1]) {
            this.lights[1].intensity = intensities.main;
        }

        // Hemisphere light
        if (intensities.hemisphere !== undefined && this.lights[2]) {
            this.lights[2].intensity = intensities.hemisphere;
        }

        // Fill lights
        if (intensities.fill !== undefined) {
            if (this.lights[3]) this.lights[3].intensity = intensities.fill;
            if (this.lights[4]) this.lights[4].intensity = intensities.fill;
        }

        // Back light
        if (intensities.back !== undefined && this.lights[5]) {
            this.lights[5].intensity = intensities.back;
        }
    }

    // Update light positions
    updateLightPositions(positions) {
        if (!this.lights || this.lights.length === 0) return;

        // Main directional light
        if (positions.main && this.lights[1]) {
            this.lights[1].position.set(
                positions.main.x,
                positions.main.y,
                positions.main.z
            );
        }

        // Fill light 1
        if (positions.fill1 && this.lights[3]) {
            this.lights[3].position.set(
                positions.fill1.x,
                positions.fill1.y,
                positions.fill1.z
            );
        }

        // Fill light 2
        if (positions.fill2 && this.lights[4]) {
            this.lights[4].position.set(
                positions.fill2.x,
                positions.fill2.y,
                positions.fill2.z
            );
        }

        // Back light
        if (positions.back && this.lights[5]) {
            this.lights[5].position.set(
                positions.back.x,
                positions.back.y,
                positions.back.z
            );
        }
    }

    // Update light colors
    updateLightColors(colors) {
        if (!this.lights || this.lights.length === 0) return;

        // Ambient light
        if (colors.ambient && this.lights[0]) {
            this.lights[0].color = new THREE.Color(colors.ambient);
        }

        // Main directional light
        if (colors.main && this.lights[1]) {
            this.lights[1].color = new THREE.Color(colors.main);
        }

        // Hemisphere light
        if (colors.hemisphere && this.lights[2]) {
            this.lights[2].color = new THREE.Color(colors.hemisphere);
        }

        // Fill lights
        if (colors.fill) {
            if (this.lights[3]) this.lights[3].color = new THREE.Color(colors.fill);
            if (this.lights[4]) this.lights[4].color = new THREE.Color(colors.fill);
        }

        // Back light
        if (colors.back && this.lights[5]) {
            this.lights[5].color = new THREE.Color(colors.back);
        }
    }

    // Toggle shadows for all lights
    toggleShadows(enabled) {
        if (!this.lights || this.lights.length === 0) return;

        // Main directional light
        if (this.lights[1]) {
            this.lights[1].castShadow = enabled;
        }
    }

    // Clear all lights from scene
    clearLights(scene) {
        if (this.lights && this.lights.length > 0) {
            this.lights.forEach(light => {
                if (light && scene) {
                    scene.remove(light);
                }
            });
            this.lights = [];
        }
    }

    // Get all current lights
    getLights() {
        return this.lights;
    }
}

// Create and export a singleton instance
const lightingManager = new LightingManager();
export default lightingManager;