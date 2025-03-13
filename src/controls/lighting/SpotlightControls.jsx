import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const SpotlightControls = ({ scene, camera, enabled, onToggle }) => {
    const [spotlightIntensity, setSpotlightIntensity] = useState(3);
    const [spotlightColor, setSpotlightColor] = useState('#ffffff');
    const [spotlightAngle, setSpotlightAngle] = useState(0.5);
    const [spotlightDistance, setSpotlightDistance] = useState(15);

    // References to track spotlight objects
    const spotlightRef = useRef(null);
    const targetObjectRef = useRef(null);
    const animationFrameIdRef = useRef(null);

    useEffect(() => {
        // Only proceed if scene is available
        if (!scene) return;

        // Check if spotlight already exists, create if not
        if (!spotlightRef.current) {
            // Create a new spotlight
            const spotlight = new THREE.SpotLight(
                new THREE.Color(spotlightColor),
                enabled ? spotlightIntensity : 0,
                spotlightDistance,
                spotlightAngle,
                0.5,
                1
            );

            spotlight.name = 'modelTorch';
            spotlight.castShadow = true;
            spotlight.shadow.mapSize.width = 1024;
            spotlight.shadow.mapSize.height = 1024;
            spotlight.shadow.camera.near = 0.5;
            spotlight.shadow.camera.far = 30;

            // Create a target for the spotlight
            const targetObject = new THREE.Object3D();
            targetObject.name = 'spotlightTarget';

            // Store references
            spotlightRef.current = spotlight;
            targetObjectRef.current = targetObject;

            // Add the spotlight and target to the scene
            scene.add(spotlight);
            scene.add(targetObject);
            spotlight.target = targetObject;
        } else {
            // Update existing spotlight properties
            const spotlight = spotlightRef.current;
            spotlight.color.set(spotlightColor);
            spotlight.intensity = enabled ? spotlightIntensity : 0;
            spotlight.distance = spotlightDistance;
            spotlight.angle = spotlightAngle;
        }

        // Function to update spotlight position based on camera
        const updateSpotlightPosition = () => {
            if (camera && spotlightRef.current && targetObjectRef.current) {
                // Position spotlight slightly offset from camera
                spotlightRef.current.position.copy(camera.position);

                // Get camera direction
                const cameraDirection = new THREE.Vector3(0, 0, -1);
                cameraDirection.applyQuaternion(camera.quaternion);

                // Calculate target position (in front of camera)
                const targetPos = new THREE.Vector3().copy(camera.position).add(
                    cameraDirection.multiplyScalar(10)
                );

                // Update target position
                targetObjectRef.current.position.copy(targetPos);

                // Update spotlight intensity based on enabled state
                spotlightRef.current.intensity = enabled ? spotlightIntensity : 0;
            }
        };

        // Initial position update (only if camera is available)
        if (camera) {
            updateSpotlightPosition();
        }

        // Setup animation loop for continuous updates
        const animate = () => {
            if (camera) {
                updateSpotlightPosition();
            }
            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Clean up function
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
        };
    }, [scene, camera, enabled, spotlightIntensity, spotlightColor, spotlightAngle, spotlightDistance]);

    // Clean up spotlight when component unmounts
    useEffect(() => {
        return () => {
            if (scene && spotlightRef.current) {
                scene.remove(spotlightRef.current);
                spotlightRef.current = null;
            }

            if (scene && targetObjectRef.current) {
                scene.remove(targetObjectRef.current);
                targetObjectRef.current = null;
            }

            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
        };
    }, [scene]);

    return (
        <div className="spotlight-controls" style={{
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '6px',
            marginTop: '8px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>Lighting Controls</h3>
                <button
                    onClick={onToggle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        backgroundColor: enabled ? 'rgba(94, 226, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '36px',
                        height: '36px'
                    }}
                    title={enabled ? "Turn Off Torch" : "Turn On Torch"}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v8M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h8M18 12h4M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
                    </svg>
                </button>
            </div>

            {enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'white', marginBottom: '4px', fontSize: '12px' }}>
                            Intensity: {spotlightIntensity.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={spotlightIntensity}
                            onChange={(e) => setSpotlightIntensity(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: '#ffd700' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'white', marginBottom: '4px', fontSize: '12px' }}>
                            Color
                        </label>
                        <input
                            type="color"
                            value={spotlightColor}
                            onChange={(e) => setSpotlightColor(e.target.value)}
                            style={{ width: '100%', height: '30px', border: 'none', borderRadius: '4px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'white', marginBottom: '4px', fontSize: '12px' }}>
                            Angle: {(spotlightAngle * 57.29).toFixed(0)}°
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="1.2"
                            step="0.1"
                            value={spotlightAngle}
                            onChange={(e) => setSpotlightAngle(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: '#ffd700' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'white', marginBottom: '4px', fontSize: '12px' }}>
                            Distance: {spotlightDistance.toFixed(0)}
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            step="1"
                            value={spotlightDistance}
                            onChange={(e) => setSpotlightDistance(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: '#ffd700' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpotlightControls;