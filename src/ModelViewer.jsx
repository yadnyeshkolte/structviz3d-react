import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import ColorSelector from './ColorSelector';
import ViewerControls from './ViewerControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const ModelViewer = ({ modelUrl, binUrl, onLoad }) => {
    const [container, setContainer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [modelColor, setModelColor] = useState('#666666'); // Default medium gray

    // Refs to store scene objects for color updates
    const sceneRef = useRef(null);
    const modelRef = useRef(null);
    const rendererRef = useRef(null);
    const lightsRef = useRef([]);
    const controlsRef = useRef(null);

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    };

    // Update model color
    const updateModelColor = (color) => {
        setModelColor(color);

        if (modelRef.current) {
            modelRef.current.traverse((child) => {
                if (child.isMesh) {
                    // If the material is an array, update all materials
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            mat.color = new THREE.Color(color);
                            mat.needsUpdate = true;
                        });
                    } else {
                        child.material.color = new THREE.Color(color);
                        child.material.needsUpdate = true;
                    }
                }
            });
        }
    };

    useEffect(() => {
        // Cleanup function to dispose resources
        // This is important for memory management and will run when component unmounts
        // or when modelUrl changes (to load a new model)
        return () => {
            // Dispose of the previous model if it exists
            if (modelRef.current) {
                modelRef.current.traverse((child) => {
                    if (child.isMesh) {
                        if (child.geometry) {
                            child.geometry.dispose();
                        }

                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => {
                                if (material.map) material.map.dispose();
                                material.dispose();
                            });
                        } else if (child.material) {
                            if (child.material.map) child.material.map.dispose();
                            child.material.dispose();
                        }
                    }
                });
            }

            // Dispose of renderer
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
            }

            // Clear scene
            if (sceneRef.current) {
                sceneRef.current.clear();
            }

            // Dispose of controls
            if (controlsRef.current) {
                controlsRef.current.dispose();
            }

            // Cancel any animation frame
            if (window.animationFrameId) {
                cancelAnimationFrame(window.animationFrameId);
            }
        };
    }, [modelUrl]);

    useEffect(() => {
        if (!container || !modelUrl) return;

        let scene, camera, renderer, controls, model;
        let animationFrameId;

        const init = () => {
            setLoading(true);
            setError(null);

            // Setup scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf5f5f5);
            sceneRef.current = scene;

            // Setup camera
            camera = new THREE.PerspectiveCamera(
                75,
                container.clientWidth / container.clientHeight,
                0.1,
                1000
            );
            camera.position.set(0, 0, 5);

            // Setup renderer with improved settings
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true
            });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            rendererRef.current = renderer;

            // Clear container before adding new renderer
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            container.appendChild(renderer.domElement);

            // Setup controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.enableZoom = true;
            controls.enablePan = true;
            controls.target.set(0, 0, 0);
            controls.update();
            controlsRef.current = controls;

            // Add comprehensive lighting setup
            setupLighting(scene);

            // Add grid helper centered at origin
            const gridHelper = new THREE.GridHelper(10, 10, 0x808080, 0xDDDDDD);
            gridHelper.position.y = -0.01; // Slightly below model to avoid z-fighting
            scene.add(gridHelper);

            // Load model
            loadModel();
        };

        const setupLighting = (scene) => {
            lightsRef.current = []; // Clear previous lights

            // Ambient light for overall illumination
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);
            lightsRef.current.push(ambientLight);

            // Main directional light (sun-like) with shadows
            const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
            mainLight.position.set(5, 10, 7.5);
            mainLight.castShadow = true;
            mainLight.shadow.mapSize.width = 2048;
            mainLight.shadow.mapSize.height = 2048;
            mainLight.shadow.camera.near = 0.5;
            mainLight.shadow.camera.far = 50;
            mainLight.shadow.camera.left = -10;
            mainLight.shadow.camera.right = 10;
            mainLight.shadow.camera.top = 10;
            mainLight.shadow.camera.bottom = -10;
            scene.add(mainLight);
            lightsRef.current.push(mainLight);

            // Hemisphere light for more natural environment lighting
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x223344, 0.5);
            scene.add(hemiLight);
            lightsRef.current.push(hemiLight);

            // Additional fill lights from different directions
            const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
            fillLight1.position.set(-5, 2, -5);
            scene.add(fillLight1);
            lightsRef.current.push(fillLight1);

            const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
            fillLight2.position.set(5, 0, -5);
            scene.add(fillLight2);
            lightsRef.current.push(fillLight2);

            const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
            backLight.position.set(0, 5, -10);
            scene.add(backLight);
            lightsRef.current.push(backLight);
        };

        const loadModel = () => {
            if (modelUrl.toLowerCase().endsWith('.stl')) {
                // Use STLLoader for STL files
                const loader = new STLLoader();
                loader.load(
                    modelUrl,
                    (geometry) => {
                        // Remove any existing model
                        if (model) {
                            scene.remove(model);
                        }

                        // Create a standard material for the STL
                        const material = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(modelColor),
                            roughness: 0.7,
                            metalness: 0.3
                        });

                        // Create mesh with the loaded geometry
                        model = new THREE.Mesh(geometry, material);
                        modelRef.current = model;

                        // Create a group to hold the model
                        const modelGroup = new THREE.Group();
                        scene.add(modelGroup);
                        modelGroup.add(model);

                        // Calculate bounding box to center the model
                        const box = new THREE.Box3().setFromObject(model);
                        const center = box.getCenter(new THREE.Vector3());

                        // Move the model itself (not the group) to center it within the group
                        model.position.set(-center.x, -center.y, -center.z);

                        // Calculate size for scaling
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z);
                        if (maxDim > 0) {
                            const scale = 3 / maxDim;
                            modelGroup.scale.set(scale, scale, scale);
                        }

                        // Enable shadows
                        model.castShadow = true;
                        model.receiveShadow = true;

                        // Reset camera and controls to look at center
                        camera.position.set(0, 2, 5);
                        camera.lookAt(0, 0, 0);
                        controls.target.set(0, 0, 0);
                        controls.update();

                        setLoading(false);

                        // Call onLoad callback if provided
                        if (typeof onLoad === 'function') {
                            onLoad();
                        }
                    },
                    (xhr) => {
                        // Loading progress
                        const progress = (xhr.loaded / xhr.total) * 100;
                        console.log(`${progress.toFixed(2)}% loaded`);
                    },
                    (error) => {
                        console.error('Error loading model:', error);
                        setError('Failed to load the model. Please try again.');
                        setLoading(false);
                    }
                );
            } else {
                // Use GLTFLoader for glTF files (existing code)
                const loader = new GLTFLoader();

                // We need to make sure the model can find its associated binary file
                const resourcePath = modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);
                loader.setResourcePath(resourcePath);

                loader.load(
                    modelUrl,
                    (gltf) => {
                        // Original GLTF loading code continues...
                        // (keep the original code for GLTF loading here)
                        // Remove any existing model
                        if (model) {
                            scene.remove(model);
                        }

                        model = gltf.scene;
                        modelRef.current = model;

                        // Create a group to hold the model
                        const modelGroup = new THREE.Group();
                        scene.add(modelGroup);
                        modelGroup.add(model);

                        // Calculate bounding box to center the model
                        const box = new THREE.Box3().setFromObject(model);
                        const center = box.getCenter(new THREE.Vector3());

                        // Move the model itself (not the group) to center it within the group
                        model.position.set(-center.x, -center.y, -center.z);

                        // Calculate size for scaling
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z);
                        if (maxDim > 0) {
                            const scale = 3 / maxDim;
                            modelGroup.scale.set(scale, scale, scale);
                        }

                        // Enable shadows on all meshes
                        model.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;

                                // Set material properties for better rendering
                                if (Array.isArray(child.material)) {
                                    child.material.forEach(mat => {
                                        mat.color = new THREE.Color(modelColor);
                                        mat.roughness = 0.7;
                                        mat.metalness = 0.3;
                                        mat.needsUpdate = true;
                                    });
                                } else {
                                    child.material.color = new THREE.Color(modelColor);
                                    child.material.roughness = 0.7;
                                    child.material.metalness = 0.3;
                                    child.material.needsUpdate = true;
                                }
                            }
                        });

                        // Reset camera and controls to look at center
                        camera.position.set(0, 2, 5);
                        camera.lookAt(0, 0, 0);
                        controls.target.set(0, 0, 0);
                        controls.update();

                        setLoading(false);

                        // Call onLoad callback if provided
                        if (typeof onLoad === 'function') {
                            onLoad();
                        }
                    },
                    (xhr) => {
                        // Loading progress
                        const progress = (xhr.loaded / xhr.total) * 100;
                        console.log(`${progress.toFixed(2)}% loaded`);
                    },
                    (error) => {
                        console.error('Error loading model:', error);
                        setError('Failed to load the model. Please try again.');
                        setLoading(false);
                    }
                );
            }
        };

        const animate = () => {
            window.animationFrameId = requestAnimationFrame(animate);

            if (controls) {
                controls.update();
            }

            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        };

        const handleResize = () => {
            if (container && renderer && camera) {
                const width = container.clientWidth;
                const height = container.clientHeight;

                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        };

        init();
        animate();
        window.addEventListener('resize', handleResize);

        // Listen for fullscreen change
        const fullscreenChangeHandler = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', fullscreenChangeHandler);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('fullscreenchange', fullscreenChangeHandler);

            if (window.animationFrameId) {
                cancelAnimationFrame(window.animationFrameId);
            }
        };
    }, [container, modelUrl, binUrl, onLoad, modelColor]);

    return (
        <div className="model-viewer-wrapper">
            <div
                ref={setContainer}
                className="model-viewer-container"
            />

            {/* Controls Overlay */}
            {!loading && !error && modelUrl && (
                <ViewerControls
                    isFullscreen={isFullscreen}
                    toggleFullscreen={toggleFullscreen}
                >
                    <ColorSelector
                        currentColor={modelColor}
                        onColorChange={updateModelColor}
                    />
                </ViewerControls>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading model...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default ModelViewer;