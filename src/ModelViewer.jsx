import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelViewer = ({ modelUrl, binUrl, onLoad }) => {
    const [container, setContainer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [modelColor, setModelColor] = useState('#666666'); // Default medium gray

    // Refs to store scene objects for color updates
    const sceneRef = useRef(null);
    const modelRef = useRef(null);

    // Color options
    const colorOptions = [
        { name: 'Gray', value: '#666666' },
        { name: 'Blue', value: '#4285F4' },
        { name: 'Red', value: '#EA4335' },
        { name: 'Green', value: '#34A853' },
        { name: 'Yellow', value: '#FBBC05' },
        { name: 'Purple', value: '#8E44AD' },
        { name: 'Teal', value: '#16A085' },
    ];

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
                    child.material.color = new THREE.Color(color);
                    child.material.needsUpdate = true;
                }
            });
        }
    };

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

            // Setup renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.outputEncoding = THREE.sRGBEncoding;

            // Clear container before adding new renderer
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            container.appendChild(renderer.domElement);

            // Setup controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.target.set(0, 0, 0); // Ensure controls are targeting the center

            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            // Add grid helper centered at origin
            const gridHelper = new THREE.GridHelper(10, 10);
            scene.add(gridHelper);

            // Load model
            loadModel();
        };

        const loadModel = () => {
            const loader = new GLTFLoader();

            // Make sure the bin file is properly loaded
            const loadingManager = new THREE.LoadingManager();

            // We need to make sure the model can find its associated binary file
            // This is important since we're storing them separately
            const resourcePath = modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);

            loader.setResourcePath(resourcePath);

            loader.load(
                modelUrl,
                (gltf) => {
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

                    // The group is now at the origin (0,0,0) and the model is centered within it

                    // Calculate size for scaling
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 0) {
                        const scale = 3 / maxDim;
                        modelGroup.scale.set(scale, scale, scale);
                    }

                    // Set model material color to current selected color
                    model.traverse((child) => {
                        if (child.isMesh) {
                            // Create a new material with specific color
                            child.material.color = new THREE.Color(modelColor);
                            child.material.needsUpdate = true;
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
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

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
            cancelAnimationFrame(animationFrameId);

            if (model && scene) {
                scene.remove(model);
            }

            if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            renderer?.dispose();
            controls?.dispose();
        };
    }, [container, modelUrl, binUrl, onLoad, modelColor]);

    return (
        <div className="model-viewer-wrapper" style={{ width: '100vw', maxWidth: '100%', marginLeft: 'calc(0%)', position: 'relative' }}>
            <div
                ref={setContainer}
                className="model-viewer-container"
                style={{ width: '100%', height: '70vh', minHeight: '500px', position: 'relative' }}
            />

            {/* Controls Overlay */}
            {!loading && !error && modelUrl && (
                <div className="viewer-controls" style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '10px',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    {/* Fullscreen button */}
                    <button
                        onClick={toggleFullscreen}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                            backgroundColor: '#333',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {isFullscreen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                            </svg>
                        )}
                    </button>

                    {/* Color selector */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                        <label style={{ color: 'white', fontSize: '12px' }}>Model Color</label>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '5px'
                        }}>
                            {colorOptions.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => updateModelColor(color.value)}
                                    title={color.name}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: color.value,
                                        border: modelColor === color.value ? '2px solid white' : '1px solid #ccc',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                />
                            ))}
                        </div>
                        {/* Custom color picker */}
                        <input
                            type="color"
                            value={modelColor}
                            onChange={(e) => updateModelColor(e.target.value)}
                            style={{
                                width: '24px',
                                height: '24px',
                                padding: 0,
                                border: 'none',
                                marginTop: '5px'
                            }}
                            title="Custom color"
                        />
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245, 245, 245, 0.7)' }}>
                    <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p>Loading model...</p>
                </div>
            )}

            {error && (
                <div className="error-message" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '20px', borderRadius: '5px', color: 'red' }}>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

// Add a CSS animation for the spinner
const styleElement = document.createElement('style');
styleElement.textContent = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleElement);

export default ModelViewer;