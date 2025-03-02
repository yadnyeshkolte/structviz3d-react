import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import ColorSelector from './ColorSelector';
import ViewerControls from './ViewerControls';
import ViewControls from './ViewControls';

// Constants
const DEFAULT_COLOR = '#666666';
const ANIMATION_DURATION = 1000;
const DEFAULT_SCALE_FACTOR = 3;
const VIEW_DISTANCE_FACTOR = 1.5;
const BG_COLOR = 0xf5f5f5;

const ModelViewer = ({ modelUrl, binUrl, onLoad }) => {
    const [container, setContainer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [modelColor, setModelColor] = useState(DEFAULT_COLOR);
    const [animating, setAnimating] = useState(false);
    const [initialPositionSet, setInitialPositionSet] = useState(false);

    // Refs
    const sceneRef = useRef(null);
    const modelRef = useRef(null);
    const rendererRef = useRef(null);
    const lightsRef = useRef([]);
    const controlsRef = useRef(null);
    const cameraRef = useRef(null);
    const animationRef = useRef(null);
    const modelGroupRef = useRef(null);
    const animationFrameIdRef = useRef(null);

    // Toggle fullscreen - memoized to prevent recreating on every render
    const toggleFullscreen = useCallback(() => {
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
    }, [container]);

    // Update model color - memoized callback
    const updateModelColor = useCallback((color) => {
        setModelColor(color);

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
    }, []);

    // Memoized calculation for view positions based on model size
    const calculateViewPosition = useCallback((view, modelSize) => {
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

        return new THREE.Vector3(...(positions[view] || positions.default));
    }, []);

    // Handle view changes - memoized
    const handleViewChange = useCallback((view) => {
        if (!cameraRef.current || !controlsRef.current || animating) return;

        setAnimating(true);

        // Calculate target (center of the model)
        const target = new THREE.Vector3(0, 0, 0);

        // Get model size
        let modelSize = 5; // Default size
        if (modelRef.current) {
            const box = new THREE.Box3().setFromObject(modelRef.current);
            const size = box.getSize(new THREE.Vector3());
            modelSize = Math.max(size.x, size.y, size.z);
        }

        // Get new position based on view
        const newPosition = calculateViewPosition(view, modelSize);

        // Store starting position and orientation
        const startPos = cameraRef.current.position.clone();
        const startTarget = controlsRef.current.target.clone();

        // Cancel any ongoing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        // Animation start time
        const startTime = Date.now();

        // Animation function
        const animateCameraMove = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

            // Use an ease-out function for smoother slowing at the end
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // Interpolate position
            const newPos = new THREE.Vector3().lerpVectors(
                startPos,
                newPosition,
                easeProgress
            );
            cameraRef.current.position.copy(newPos);

            // Interpolate target
            const newTarget = new THREE.Vector3().lerpVectors(
                startTarget,
                target,
                easeProgress
            );
            controlsRef.current.target.copy(newTarget);

            // Update controls
            controlsRef.current.update();

            // Continue animation if not complete
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateCameraMove);
            } else {
                setAnimating(false);
            }
        };

        // Start animation
        animationRef.current = requestAnimationFrame(animateCameraMove);
    }, [animating, calculateViewPosition]);

    // Set optimal initial view based on model size
    const setOptimalInitialView = useCallback((model) => {
        if (!model || !cameraRef.current || !controlsRef.current || initialPositionSet) {
            return;
        }

        // Calculate bounding box to find the optimal distance
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Get isometric position
        const isometricPosition = calculateViewPosition('isometric', maxDim);

        // Set camera position
        cameraRef.current.position.copy(isometricPosition);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();

        setInitialPositionSet(true);
    }, [initialPositionSet, calculateViewPosition]);

    // Setup lighting - extracted as a separate function
    const setupLighting = useCallback((scene) => {
        const lights = [];

        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        lights.push(ambientLight);

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
        lights.push(mainLight);

        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x223344, 0.5);
        scene.add(hemiLight);
        lights.push(hemiLight);

        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight1.position.set(-5, 2, -5);
        scene.add(fillLight1);
        lights.push(fillLight1);

        const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight2.position.set(5, 0, -5);
        scene.add(fillLight2);
        lights.push(fillLight2);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
        backLight.position.set(0, 5, -10);
        scene.add(backLight);
        lights.push(backLight);

        return lights;
    }, []);

    // Load STL model
    const loadSTLModel = useCallback((url, scene, onSuccess, onProgress, onError) => {
        const loader = new STLLoader();

        loader.load(
            url,
            (geometry) => {
                // Create material
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(modelColor),
                    roughness: 0.7,
                    metalness: 0.3
                });

                // Create mesh
                const model = new THREE.Mesh(geometry, material);
                modelRef.current = model;

                // Create and add group
                const modelGroup = new THREE.Group();
                scene.add(modelGroup);
                modelGroup.add(model);
                modelGroupRef.current = modelGroup;

                // Center model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.set(-center.x, -center.y, -center.z);

                // Scale model
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                    const scale = DEFAULT_SCALE_FACTOR / maxDim;
                    modelGroup.scale.set(scale, scale, scale);
                }

                // Enable shadows
                model.castShadow = true;
                model.receiveShadow = true;

                onSuccess(model);
            },
            onProgress,
            onError
        );
    }, [modelColor]);

    // Load GLTF model
    const loadGLTFModel = useCallback((url, scene, onSuccess, onProgress, onError) => {
        const loader = new GLTFLoader();

        // Set resource path for associated files
        const resourcePath = url.substring(0, url.lastIndexOf('/') + 1);
        loader.setResourcePath(resourcePath);

        loader.load(
            url,
            (gltf) => {
                const model = gltf.scene;
                modelRef.current = model;

                // Create and add group
                const modelGroup = new THREE.Group();
                scene.add(modelGroup);
                modelGroup.add(model);
                modelGroupRef.current = modelGroup;

                // Center model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.set(-center.x, -center.y, -center.z);

                // Scale model
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                    const scale = DEFAULT_SCALE_FACTOR / maxDim;
                    modelGroup.scale.set(scale, scale, scale);
                }

                // Apply material settings to all meshes
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        const materialProps = {
                            color: new THREE.Color(modelColor),
                            roughness: 0.7,
                            metalness: 0.3,
                            needsUpdate: true
                        };

                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => Object.assign(mat, materialProps));
                        } else if (child.material) {
                            Object.assign(child.material, materialProps);
                        }
                    }
                });

                onSuccess(model);
            },
            onProgress,
            onError
        );
    }, [modelColor]);

    // Clean up resources
    const cleanupResources = useCallback(() => {
        // Dispose of the model
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

        // Cancel animations
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    }, []);

    // Handle window resize - memoized
    const handleResize = useCallback(() => {
        if (!container || !rendererRef.current || !cameraRef.current) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
    }, [container]);

    // Setup scene and initialize three.js
    const initThreeJS = useCallback(() => {
        if (!container || !modelUrl) return;

        setLoading(true);
        setError(null);

        // Setup scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(BG_COLOR);
        sceneRef.current = scene;

        // Setup camera
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(5, 5, 5);
        cameraRef.current = camera;

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({
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
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.target.set(0, 0, 0);
        controls.update();
        controlsRef.current = controls;

        // Setup lighting
        lightsRef.current = setupLighting(scene);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x808080, 0xDDDDDD);
        gridHelper.position.y = 0;
        scene.add(gridHelper);

        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5);
        axesHelper.position.y = 0;
        scene.add(axesHelper);

        // Load model based on file extension
        if (modelUrl.toLowerCase().endsWith('.stl')) {
            loadSTLModel(
                modelUrl,
                scene,
                (model) => {
                    setOptimalInitialView(model);
                    setLoading(false);
                    if (typeof onLoad === 'function') onLoad();
                },
                (xhr) => {
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
            loadGLTFModel(
                modelUrl,
                scene,
                (model) => {
                    setOptimalInitialView(model);
                    setLoading(false);
                    if (typeof onLoad === 'function') onLoad();
                },
                (xhr) => {
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

        // Start animation loop
        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            if (controls) controls.update();
            if (renderer && scene && camera) renderer.render(scene, camera);
        };

        animate();
    }, [container, modelUrl, binUrl, onLoad, setupLighting, loadSTLModel, loadGLTFModel, setOptimalInitialView]);

    // Effect to reset initial position when model URL changes
    useEffect(() => {
        if (modelUrl) {
            setInitialPositionSet(false);
        }
    }, [modelUrl]);

    // Effect to handle cleanup on modelUrl change
    useEffect(() => {
        return cleanupResources;
    }, [modelUrl, cleanupResources]);

    // Effect to initialize Three.js
    useEffect(() => {
        initThreeJS();

        // Window resize event listener
        window.addEventListener('resize', handleResize);

        // Fullscreen change listener
        const fullscreenChangeHandler = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', fullscreenChangeHandler);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
            cleanupResources();
        };
    }, [container, modelUrl, binUrl, handleResize, cleanupResources, initThreeJS]);

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

                    <ViewControls
                        onViewChange={handleViewChange}
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