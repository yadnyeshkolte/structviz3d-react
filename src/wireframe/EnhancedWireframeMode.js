// This is a utility file for enhanced wireframe/pencil view

import * as THREE from 'three';

// Edge detection shader
const edgeShader = {
    uniforms: {
        'baseTexture': { value: null },
        'edgeStrength': { value: 3.0 },
        'edgeGlow': { value: 1.0 },
        'edgeThickness': { value: 1.0 },
        'edgeColor': { value: new THREE.Color(0x000000) },
        'viewportSize': { value: new THREE.Vector2(800, 600) }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D baseTexture;
    uniform float edgeStrength;
    uniform float edgeGlow;
    uniform float edgeThickness;
    uniform vec3 edgeColor;
    uniform vec2 viewportSize;
    varying vec2 vUv;
    
    float getDepth(vec2 uv) {
      return texture2D(baseTexture, uv).r;
    }
    
    void main() {
      vec2 pixelSize = 1.0 / viewportSize;
      float depth = getDepth(vUv);
      
      float dx = getDepth(vUv + vec2(pixelSize.x, 0.0)) - depth;
      float dy = getDepth(vUv + vec2(0.0, pixelSize.y)) - depth;
      
      vec2 gradient = vec2(dx, dy) * edgeStrength;
      float edgeFactor = length(gradient) * edgeGlow;
      edgeFactor = clamp(edgeFactor, 0.0, 1.0);
      
      vec3 finalColor = mix(vec3(1.0), edgeColor, edgeFactor);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const applyPencilView = (scene, renderer, camera, enabled) => {
    if (!scene || !renderer || !camera) return;

    // If there's an existing composer, remove it
    if (scene.userData.composer) {
        scene.userData.composer = null;
    }

    if (enabled) {
        // Create a new render target
        const size = new THREE.Vector2();
        renderer.getSize(size);

        // Set up parameters for normal material override
        const parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };

        // Create a shader pass for edge detection
        const renderTarget = new THREE.WebGLRenderTarget(size.x, size.y, parameters);

        // Create the edge detection shader material
        const edgeMaterial = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(edgeShader.uniforms),
            vertexShader: edgeShader.vertexShader,
            fragmentShader: edgeShader.fragmentShader
        });

        // Update uniforms
        edgeMaterial.uniforms['viewportSize'].value = new THREE.Vector2(size.x, size.y);

        // Store for cleanup
        scene.userData.pencilViewMaterial = edgeMaterial;
        scene.userData.pencilViewTarget = renderTarget;

        // Apply wireframe to all meshes
        scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    object.userData.originalMaterials = object.material.map(m => m.clone());
                    object.material.forEach(material => {
                        material.wireframe = true;
                        material.wireframeLinewidth = 2;
                        material.color.set(0x000000);
                        material.emissive.set(0x000000);
                        material.roughness = 1.0;
                        material.metalness = 0.0;
                    });
                } else {
                    object.userData.originalMaterial = object.material.clone();
                    object.material.wireframe = true;
                    object.material.wireframeLinewidth = 2;
                    object.material.color.set(0x000000);
                    object.material.emissive.set(0x000000);
                    object.material.roughness = 1.0;
                    object.material.metalness = 0.0;
                }
            }
        });

        // Set background to white for drawing mode
        scene.userData.originalBackground = scene.background.clone();
        scene.background = new THREE.Color(0xffffff);
    } else {
        // Restore original materials
        scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material) && object.userData.originalMaterials) {
                    object.material = object.userData.originalMaterials;
                    delete object.userData.originalMaterials;
                } else if (object.userData.originalMaterial) {
                    object.material = object.userData.originalMaterial;
                    delete object.userData.originalMaterial;
                }
            }
        });

        // Restore original background
        if (scene.userData.originalBackground) {
            scene.background = scene.userData.originalBackground;
            delete scene.userData.originalBackground;
        }

        // Clean up
        if (scene.userData.pencilViewTarget) {
            scene.userData.pencilViewTarget.dispose();
            delete scene.userData.pencilViewTarget;
        }

        if (scene.userData.pencilViewMaterial) {
            delete scene.userData.pencilViewMaterial;
        }
    }
};

export default {
    applyPencilView
};