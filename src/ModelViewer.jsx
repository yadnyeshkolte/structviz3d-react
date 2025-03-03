import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import ColorSelector from './ColorSelector';
import ViewerControls from './ViewerControls';
import ViewControls from './ViewControls';
import CameraControls from './CameraControls';
import KeyboardShortcuts from './KeyboardShortcuts';
import cameraStateManager from './CameraStateManager.js';
import GridControls from './GridControls';

// Constants
const DEFAULT_COLOR = '#999999';
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
    const [isOrthographic, setIsOrthographic] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [controlsLocked, setControlsLocked] = useState(false);
    const [shortcutsVisible, setShortcutsVisible] = useState(false);
    const [showXZGrid, setShowXZGrid] = useState(true);
    const [showXYGrid, setShowXYGrid] = useState(false);
    const [showYZGrid, setShowYZGrid] = useState(false);
    const [gridDivisions, setGridDivisions] = useState(20);
    const [xzGridColor, setXZGridColor] = useState('#CFCFCF');
    const [xyGridColor, setXYGridColor] = useState('#8BC34A');  // Green
    const [yzGridColor, setYZGridColor] = useState('#2196F3');  // Blue

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
    const perspectiveCameraRef = useRef(null);
    const orthographicCameraRef = useRef(null);
    const currentCameraRef = useRef(null); // Points to active camera
    const xzGridRef = useRef(null);
    const xyGridRef = useRef(null);
    const yzGridRef = useRef(null);


    const handleZoomIn = useCallback(() => {
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
    }, [isOrthographic]);

    const handleZoomOut = useCallback(() => {
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
    }, [isOrthographic]);

    const createGrids = useCallback(() => {
        if (!sceneRef.current) return;

        // Remove existing grids
        if (xzGridRef.current) sceneRef.current.remove(xzGridRef.current);
        if (xyGridRef.current) sceneRef.current.remove(xyGridRef.current);
        if (yzGridRef.current) sceneRef.current.remove(yzGridRef.current);

        const gridSize = 10;

        // XZ Grid (floor)
        const xzGrid = new THREE.GridHelper(gridSize, gridDivisions, new THREE.Color(xzGridColor), new THREE.Color(xzGridColor));
        xzGrid.position.y = 0;
        xzGrid.visible = showXZGrid;
        sceneRef.current.add(xzGrid);
        xzGridRef.current = xzGrid;

        // XY Grid (front)
        const xyGrid = new THREE.GridHelper(gridSize, gridDivisions, new THREE.Color(xyGridColor), new THREE.Color(xyGridColor));
        xyGrid.rotation.x = Math.PI / 2; // Rotate to make vertical
        xyGrid.position.z = 0;
        xyGrid.visible = showXYGrid;
        sceneRef.current.add(xyGrid);
        xyGridRef.current = xyGrid;

        // YZ Grid (side)
        const yzGrid = new THREE.GridHelper(gridSize, gridDivisions, new THREE.Color(yzGridColor), new THREE.Color(yzGridColor));
        yzGrid.rotation.z = Math.PI / 2; // Rotate to make vertical
        yzGrid.position.x = 0;
        yzGrid.visible = showYZGrid;
        sceneRef.current.add(yzGrid);
        yzGridRef.current = yzGrid;
    }, [gridDivisions, xzGridColor, xyGridColor, yzGridColor, showXZGrid, showXYGrid, showYZGrid]);

    const toggleXZGrid = useCallback(() => {
        setShowXZGrid(prev => !prev);
    }, []);

    const toggleXYGrid = useCallback(() => {
        setShowXYGrid(prev => !prev);
    }, []);

    const toggleYZGrid = useCallback(() => {
        setShowYZGrid(prev => !prev);
    }, []);

    const handleGridDivisionsChange = useCallback((value) => {
        setGridDivisions(value);
    }, []);

    const handleXZGridColorChange = useCallback((color) => {
        setXZGridColor(color);
    }, []);

    const handleXYGridColorChange = useCallback((color) => {
        setXYGridColor(color);
    }, []);

    const handleYZGridColorChange = useCallback((color) => {
        setYZGridColor(color);
    }, []);

    const toggleControlsLock = useCallback(() => {
        setControlsVisible(false);
        setControlsLocked(true);
    }, []);

    const toggleShortcuts = useCallback(() => {
        setShortcutsVisible(prev => !prev);
    }, []);

    // Animate camera helper function - defined before other callbacks that depend on it
    const animateCamera = useCallback((newPosition, targetPosition) => {
        // Store starting position and orientation
        const currentCamera = currentCameraRef.current;
        if (!currentCamera || !controlsRef.current) return;
        const startPos = currentCamera.position.clone();
        const startTarget = controlsRef.current.target.clone();

        // Cancel any ongoing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        const startTime = Date.now();

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
        setAnimating(true);
        animationRef.current = requestAnimationFrame(animateCameraMove);
    }, []);

    // Handle zoom function - defined before it's used in initThreeJS
    const handleZoom = useCallback((event) => {
        event.preventDefault();

        if (!controlsRef.current || !currentCameraRef.current || !container) return;

        // Get mouse position in normalized device coordinates
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        const y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        // Create raycaster and find intersection point with model
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), currentCameraRef.current);

        // Check for intersections with model
        const intersects = raycaster.intersectObject(modelRef.current, true);

        if (intersects.length > 0) {
            // Get zoom delta and direction
            const zoomDelta = event.deltaY * -0.001;  // Adjust sensitivity here

            // Calculate target position (the intersection point)
            const targetPos = intersects[0].point;

            // Move camera along the direction toward/away from the intersection point
            const cameraPos = currentCameraRef.current.position;
            const direction = new THREE.Vector3().subVectors(targetPos, cameraPos).normalize();
            const distance = direction.multiplyScalar(zoomDelta * 10);

            currentCameraRef.current.position.add(distance);
            controlsRef.current.update();
        } else {
            // Fallback to default OrbitControls zoom
            const zoomDelta = event.deltaY * 0.001;
            controlsRef.current.zoom(Math.pow(0.95, -zoomDelta));
            controlsRef.current.update();
        }
    }, [container]);

    const getModelSize = useCallback(() => {
        if (!modelRef.current) return 5;

        const box = new THREE.Box3().setFromObject(modelRef.current);
        const size = box.getSize(new THREE.Vector3());
        return Math.max(size.x, size.y, size.z);
    }, []);

    const toggleCameraMode = useCallback(() => {
        if (!orthographicCameraRef.current && container) {
            // Create orthographic camera if it doesn't exist
            const aspect = container.clientWidth / container.clientHeight;
            const frustumSize = 10;
            const camera = new THREE.OrthographicCamera(
                frustumSize * aspect / -2,
                frustumSize * aspect / 2,
                frustumSize / 2,
                frustumSize / -2,
                0.1,
                1000
            );
            camera.position.copy(perspectiveCameraRef.current.position);
            camera.rotation.copy(perspectiveCameraRef.current.rotation);
            orthographicCameraRef.current = camera;

            // Initialize both cameras in the manager
            cameraStateManager.initialize(
                perspectiveCameraRef.current,
                orthographicCameraRef.current,
                controlsRef.current,
                getModelSize()
            );
        }

        const isOrthographic = cameraStateManager.toggleCameraMode();
        setIsOrthographic(isOrthographic);

        // Update current camera reference
        currentCameraRef.current = cameraStateManager.getCurrentCamera();
    }, [container, getModelSize]);

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
        // Update the state
        setModelColor(color);

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

        // Fix: Create Vector3 with individual coordinates instead of array
        const positionArray = positions[view] || positions.default;
        return new THREE.Vector3(positionArray[0], positionArray[1], positionArray[2]);
    }, []);

    // Handle view changes - memoized
    const handleViewChange = useCallback((view) => {
        if (!controlsRef.current || animating) return;

        if (view === 'frame') {
            setAnimating(true);

            // Get bounding box of the model
            const box = new THREE.Box3().setFromObject(modelRef.current);
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
                const fov = currentCameraRef.current.fov * (Math.PI / 180);
                distance = maxDim / (2 * Math.tan(fov / 2)) * 1.2;
            }

            // Get isometric direction
            const direction = new THREE.Vector3(1, 1, 1).normalize();

            // Calculate new position
            const position = center.clone().add(direction.multiplyScalar(distance));

            // Animate to the new position
            animateCamera(position, center);
            return;
        }

        setAnimating(true);

        // Calculate target (center of the model)
        const target = new THREE.Vector3(0, 0, 0);

        // Update model size in the camera manager if needed
        const modelSize = getModelSize();
        if (modelSize !== cameraStateManager.modelSize) {
            cameraStateManager.updateModelSize(modelSize);
        }

        // Get new position based on view
        const newPosition = cameraStateManager.getPositionForView(view);

        // Animate to the new position
        animateCamera(newPosition, target);
    }, [animating, getModelSize, isOrthographic, animateCamera]);


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

    // Refactored function to handle model setup (reduces code duplication)
    const setupModel = useCallback((model, scene) => {
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

        return { box, size, center, maxDim };
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

                // Setup the model and get model properties
                setupModel(model, scene);

                // Enable shadows
                model.castShadow = true;
                model.receiveShadow = true;

                onSuccess(model);
            },
            onProgress,
            onError
        );
    },[setupModel]);

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

                // Setup the model and get model properties
                setupModel(model, scene);

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
    }, [setupModel]);

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

    const handleResize = useCallback(() => {
        if (!container || !rendererRef.current) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const aspect = width / height;

        rendererRef.current.setSize(width, height);

        // Update perspective camera
        if (perspectiveCameraRef.current) {
            perspectiveCameraRef.current.aspect = aspect;
            perspectiveCameraRef.current.updateProjectionMatrix();
        }

        // Update orthographic camera
        if (orthographicCameraRef.current) {
            const frustumSize = 10;
            orthographicCameraRef.current.left = frustumSize * aspect / -2;
            orthographicCameraRef.current.right = frustumSize * aspect / 2;
            orthographicCameraRef.current.top = frustumSize / 2;
            orthographicCameraRef.current.bottom = frustumSize / -2;
            orthographicCameraRef.current.updateProjectionMatrix();
        }

        // Update camera manager with current model size if possible
        if (modelRef.current) {
            const modelSize = getModelSize();
            cameraStateManager.updateModelSize(modelSize);
        }
    }, [container, getModelSize]);

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
        const perspCamera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        perspCamera.position.set(5, 5, 5);
        perspectiveCameraRef.current = perspCamera;
        cameraRef.current = perspCamera;
        currentCameraRef.current = perspCamera;

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        // Fix: Update to the correct encoding property
        renderer.outputColorSpace = THREE.SRGBColorSpace;
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

        const controls = new OrbitControls(perspCamera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.panSpeed = 0.8;
        controls.zoomSpeed = 1.0;
        controls.rotateSpeed = 0.8;
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        controls.target.set(0, 0, 0);
        controls.update();
        controlsRef.current = controls;

        // Initialize camera state manager
        if (modelRef.current) {
            const box = new THREE.Box3().setFromObject(modelRef.current);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            cameraStateManager.initialize(
                perspCamera,
                orthographicCameraRef.current, // Will be null initially
                controls,
                maxDim
            );
        }

        // Remove any existing wheel event listeners to prevent duplicates
        if (renderer.domElement) {
            renderer.domElement.removeEventListener('wheel', handleZoom);
        }

        // Setup lighting
        lightsRef.current = setupLighting(scene);

        // Add grid helper
        createGrids();

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
                    // Fix: Check if xhr.total exists before using it
                    const progress = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0;
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
                    // Fix: Check if xhr.total exists before using it
                    const progress = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0;
                    console.log(`${progress.toFixed(2)}% loaded`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    setError('Failed to load the model. Please try again.');
                    setLoading(false);
                }
            );
        }

        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            if (controlsRef.current) controlsRef.current.update();
            if (rendererRef.current && sceneRef.current && currentCameraRef.current) {
                rendererRef.current.render(sceneRef.current, currentCameraRef.current);
            }
        };

        animate();
    }, [container, modelUrl, binUrl, onLoad, setupLighting, loadSTLModel, loadGLTFModel, setOptimalInitialView, handleZoom]);


    useEffect(() => {
        if (xzGridRef.current) xzGridRef.current.visible = showXZGrid;
        if (xyGridRef.current) xyGridRef.current.visible = showXYGrid;
        if (yzGridRef.current) yzGridRef.current.visible = showYZGrid;
    }, [showXZGrid, showXYGrid, showYZGrid]);

    // Effect to recreate grids when divisions or color changes
    useEffect(() => {
        createGrids();
    }, [createGrids, gridDivisions, xzGridColor, xyGridColor, yzGridColor]);

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

    // Add event listener for keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Numpad keys
            switch (event.code) {
                case 'Numpad1':
                    handleViewChange('front');
                    break;
                case 'Numpad3':
                    handleViewChange('right');
                    break;
                case 'Numpad7':
                    handleViewChange('top');
                    break;
                case 'Numpad5':
                    toggleCameraMode();
                    break;
                case 'Home':
                    handleViewChange('frame');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleViewChange, toggleCameraMode]);

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
                    visible={controlsVisible}
                    locked={controlsLocked}
                    onToggleLock={toggleControlsLock}
                    onToggleShortcuts={toggleShortcuts}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                >
                    <ColorSelector
                        currentColor={modelColor}
                        onColorChange={updateModelColor}
                    />

                    <CameraControls
                        isOrthographic={isOrthographic}
                        toggleCameraMode={toggleCameraMode}
                    />

                    <ViewControls
                        onViewChange={handleViewChange}
                    />

                    {/* Add the new grid controls */}
                    <GridControls
                        showXZGrid={showXZGrid}
                        showXYGrid={showXYGrid}
                        showYZGrid={showYZGrid}
                        gridDivisions={gridDivisions}
                        xzGridColor={xzGridColor}
                        xyGridColor={xyGridColor}
                        yzGridColor={yzGridColor}
                        onToggleXZGrid={toggleXZGrid}
                        onToggleXYGrid={toggleXYGrid}
                        onToggleYZGrid={toggleYZGrid}
                        onGridDivisionsChange={handleGridDivisionsChange}
                        onXZGridColorChange={handleXZGridColorChange}
                        onXYGridColorChange={handleXYGridColorChange}
                        onYZGridColorChange={handleYZGridColorChange}
                    />
                </ViewerControls>
            )}
            <KeyboardShortcuts
                isVisible={shortcutsVisible}
                onClose={() => setShortcutsVisible(false)}
            />

            {/* Show controls button when controls are hidden */}
            {!controlsVisible && (
                <div
                    className="controls-indicator"
                    onClick={() => setControlsVisible(true)}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(33, 33, 33, 0.75)',
                        color: 'yellow',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(4px)'
                    }}
                    title="Show controls"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path
                            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                </div>
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