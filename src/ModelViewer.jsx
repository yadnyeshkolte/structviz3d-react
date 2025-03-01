import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelViewer = ({ modelUrl, binUrl }) => {
    const [container, setContainer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            // Add grid helper
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

                    // Center and scale model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center);

                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 0) {
                        const scale = 3 / maxDim;
                        model.scale.multiplyScalar(scale);
                    }

                    scene.add(model);
                    setLoading(false);
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

        return () => {
            window.removeEventListener('resize', handleResize);
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
    }, [container, modelUrl, binUrl]);

    return (
        <div className="model-viewer-wrapper">
            <div
                ref={setContainer}
                className="model-viewer-container"
                style={{ width: '100%', height: '500px', position: 'relative' }}
            />

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