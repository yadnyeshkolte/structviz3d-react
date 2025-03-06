import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

const ScaleControls = ({
                           scene,
                           gridDivisions,
                           showXZGrid,
                           showXYGrid,
                           showYZGrid,
                           xzGridColor,
                           xyGridColor,
                           yzGridColor
                       }) => {
    const [scalingEnabled, setScalingEnabled] = useState(false);
    const [activePlane, setActivePlane] = useState('xz'); // Default to floor plane
    const [selectedGridLine, setSelectedGridLine] = useState(null);
    const [scales, setScales] = useState([]);

    // Refs for scale objects
    const scaleObjectsRef = useRef([]);
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseRef = useRef(new THREE.Vector2());

    // Clean up scales when component unmounts
    useEffect(() => {
        return () => {
            if (scene) {
                scaleObjectsRef.current.forEach(scale => {
                    if (scale.line) scene.remove(scale.line);
                    if (scale.textMesh) scene.remove(scale.textMesh);
                });
            }
        };
    }, [scene]);

    // Update scale visibility when grids change
    useEffect(() => {
        updateScaleVisibility();
    }, [showXZGrid, showXYGrid, showYZGrid]);

    // Update scale positions when divisions change
    useEffect(() => {
        updateScalePositions();
    }, [gridDivisions]);

    const updateScaleVisibility = useCallback(() => {
        scaleObjectsRef.current.forEach(scale => {
            if (!scale.line || !scale.textMesh) return;

            // Show/hide based on corresponding grid visibility
            if (scale.plane === 'xz') {
                scale.line.visible = showXZGrid;
                scale.textMesh.visible = showXZGrid;
            } else if (scale.plane === 'xy') {
                scale.line.visible = showXYGrid;
                scale.textMesh.visible = showXYGrid;
            } else if (scale.plane === 'yz') {
                scale.line.visible = showYZGrid;
                scale.textMesh.visible = showYZGrid;
            }
        });
    }, [showXZGrid, showXYGrid, showYZGrid]);

    const updateScalePositions = useCallback(() => {
        // Update scale positions and values based on new grid divisions
        scaleObjectsRef.current.forEach(scale => {
            if (!scale.line || !scale.textMesh) return;

            // Update text to show proper scale value
            updateScaleText(scale);
        });
    }, [gridDivisions]);

    const updateScaleText = useCallback((scale) => {
        if (!scale.textMesh) return;

        // Calculate real-world unit based on grid divisions
        const gridSize = 10; // This should match the grid size in GridControls
        const unitPerDivision = gridSize / gridDivisions;
        const scaleValue = scale.gridIndex * unitPerDivision;

        // Update text
        if (scene) {
            scene.remove(scale.textMesh);

            // Create new text mesh
            const textGeometry = new THREE.TextGeometry(`${scaleValue.toFixed(2)}`, {
                size: 0.2,
                height: 0.02,
                curveSegments: 4,
                font: new THREE.Font() // You would need to load a font
            });

            // Fallback to basic mesh with sprite if TextGeometry isn't available
            const textMaterial = new THREE.MeshBasicMaterial({
                color: getColorForPlane(scale.plane)
            });

            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.copy(scale.textPosition);

            // Rotate text based on plane
            if (scale.plane === 'xy') {
                textMesh.rotation.x = -Math.PI / 2;
            } else if (scale.plane === 'yz') {
                textMesh.rotation.y = Math.PI / 2;
            }

            scene.add(textMesh);
            scale.textMesh = textMesh;
        }
    }, [scene, gridDivisions]);

    const getColorForPlane = useCallback((plane) => {
        switch(plane) {
            case 'xz': return xzGridColor;
            case 'xy': return xyGridColor;
            case 'yz': return yzGridColor;
            default: return '#FFFFFF';
        }
    }, [xzGridColor, xyGridColor, yzGridColor]);

    const toggleScaling = useCallback(() => {
        setScalingEnabled(prev => !prev);
    }, []);

    const handlePlaneChange = useCallback((plane) => {
        setActivePlane(plane);
        setSelectedGridLine(null);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (!scalingEnabled || !selectedGridLine) return;

        const step = 1; // One grid line at a time
        let newPosition = { ...selectedGridLine.position };

        switch(e.key.toLowerCase()) {
            case 'w': // Move forward
                if (activePlane === 'xz' || activePlane === 'xy') {
                    newPosition.y += step;
                } else if (activePlane === 'yz') {
                    newPosition.z -= step;
                }
                break;
            case 's': // Move backward
                if (activePlane === 'xz' || activePlane === 'xy') {
                    newPosition.y -= step;
                } else if (activePlane === 'yz') {
                    newPosition.z += step;
                }
                break;
            case 'a': // Move left
                if (activePlane === 'xz' || activePlane === 'yz') {
                    newPosition.x -= step;
                } else if (activePlane === 'xy') {
                    newPosition.x -= step;
                }
                break;
            case 'd': // Move right
                if (activePlane === 'xz' || activePlane === 'yz') {
                    newPosition.x += step;
                } else if (activePlane === 'xy') {
                    newPosition.x += step;
                }
                break;
            default:
                return;
        }

        moveScale(selectedGridLine.id, newPosition);
    }, [scalingEnabled, selectedGridLine, activePlane]);

    // Effect to add/remove keyboard listeners
    useEffect(() => {
        if (scalingEnabled) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [scalingEnabled, handleKeyDown]);

    const addScale = useCallback(() => {
        if (!scene) return;

        const gridSize = 10;
        const halfGrid = gridSize / 2;

        // Default position based on active plane
        let start, end, textPos, plane = activePlane;
        let gridIndex = 0; // Default to center grid line

        if (plane === 'xz') {
            // Floor plane
            start = new THREE.Vector3(-halfGrid, 0, 0);
            end = new THREE.Vector3(halfGrid, 0, 0);
            textPos = new THREE.Vector3(halfGrid + 0.5, 0, 0);
        } else if (plane === 'xy') {
            // Front plane
            start = new THREE.Vector3(-halfGrid, 0, 0);
            end = new THREE.Vector3(halfGrid, 0, 0);
            textPos = new THREE.Vector3(halfGrid + 0.5, 0, 0);
        } else if (plane === 'yz') {
            // Side plane
            start = new THREE.Vector3(0, -halfGrid, 0);
            end = new THREE.Vector3(0, halfGrid, 0);
            textPos = new THREE.Vector3(0, halfGrid + 0.5, 0);
        }

        // Create line geometry
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: getColorForPlane(plane),
            linewidth: 3
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);

        // Create text for scale
        const scaleValue = (gridIndex * (gridSize / gridDivisions)).toFixed(2);

        // Add primitive text
        const textSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: createTextTexture(scaleValue, getColorForPlane(plane)),
            sizeAttenuation: false
        }));

        textSprite.position.copy(textPos);
        textSprite.scale.set(0.5, 0.5, 1);
        scene.add(textSprite);

        // Create scale object
        const scaleId = Date.now().toString();
        const scaleObj = {
            id: scaleId,
            line: line,
            textMesh: textSprite,
            plane: plane,
            gridIndex: gridIndex,
            position: { x: 0, y: 0, z: 0 }, // offset from default grid
            textPosition: textPos
        };

        // Add to refs and state
        scaleObjectsRef.current.push(scaleObj);
        setScales(prev => [...prev, scaleObj]);

        return scaleId;
    }, [scene, activePlane, gridDivisions, getColorForPlane]);

    // Helper function to create text texture
    const createTextTexture = (text, color) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        context.font = '64px Arial';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    };

    const moveScale = useCallback((scaleId, newPosition) => {
        if (!scene) return;

        const scaleIndex = scaleObjectsRef.current.findIndex(s => s.id === scaleId);
        if (scaleIndex === -1) return;

        const scale = scaleObjectsRef.current[scaleIndex];
        const gridSize = 10;
        const halfGrid = gridSize / 2;

        // Calculate new world positions based on grid position
        let lineStart, lineEnd, textPos;

        if (scale.plane === 'xz') {
            // Floor plane (x-axis scale)
            lineStart = new THREE.Vector3(-halfGrid, newPosition.y, newPosition.z);
            lineEnd = new THREE.Vector3(halfGrid, newPosition.y, newPosition.z);
            textPos = new THREE.Vector3(halfGrid + 0.5, newPosition.y, newPosition.z);
            scale.gridIndex = newPosition.z + halfGrid;
        } else if (scale.plane === 'xy') {
            // Front plane (x-axis scale)
            lineStart = new THREE.Vector3(-halfGrid, newPosition.y, newPosition.z);
            lineEnd = new THREE.Vector3(halfGrid, newPosition.y, newPosition.z);
            textPos = new THREE.Vector3(halfGrid + 0.5, newPosition.y, newPosition.z);
            scale.gridIndex = newPosition.y + halfGrid;
        } else if (scale.plane === 'yz') {
            // Side plane (y-axis scale)
            lineStart = new THREE.Vector3(newPosition.x, -halfGrid, newPosition.z);
            lineEnd = new THREE.Vector3(newPosition.x, halfGrid, newPosition.z);
            textPos = new THREE.Vector3(newPosition.x, halfGrid + 0.5, newPosition.z);
            scale.gridIndex = newPosition.z + halfGrid;
        }

        // Update line geometry
        const points = [lineStart, lineEnd];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        scale.line.geometry.dispose();
        scale.line.geometry = geometry;

        // Update text position
        scale.textPosition = textPos;
        scale.textMesh.position.copy(textPos);

        // Update scale data
        scale.position = newPosition;

        // Update scale text with new position value
        updateScaleText(scale);

        // Update the refs and state
        scaleObjectsRef.current[scaleIndex] = scale;
        setScales([...scaleObjectsRef.current]);

        // Update selected grid line
        setSelectedGridLine(scale);
    }, [scene, updateScaleText]);

    const selectScale = useCallback((scaleId) => {
        const scale = scaleObjectsRef.current.find(s => s.id === scaleId);
        if (scale) {
            // Highlight the selected scale
            scale.line.material.color.set('#000000'); // Yellow highlight
            setSelectedGridLine(scale);
        }
    }, []);

    const deselectScale = useCallback(() => {
        if (selectedGridLine) {
            // Reset the color of the previously selected scale
            const originalColor = getColorForPlane(selectedGridLine.plane);
            selectedGridLine.line.material.color.set(originalColor);
            setSelectedGridLine(null);
        }
    }, [selectedGridLine, getColorForPlane]);

    const removeScale = useCallback((scaleId) => {
        const scaleIndex = scaleObjectsRef.current.findIndex(s => s.id === scaleId);
        if (scaleIndex === -1 || !scene) return;

        const scale = scaleObjectsRef.current[scaleIndex];

        // Remove from scene
        if (scale.line) scene.remove(scale.line);
        if (scale.textMesh) scene.remove(scale.textMesh);

        // Remove from refs and state
        scaleObjectsRef.current.splice(scaleIndex, 1);
        setScales(prev => prev.filter(s => s.id !== scaleId));

        // If removing selected scale, clear selection
        if (selectedGridLine && selectedGridLine.id === scaleId) {
            setSelectedGridLine(null);
        }
    }, [scene, selectedGridLine]);

    return (
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'white' }}>Scale Controls</h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                    <input
                        type="checkbox"
                        checked={scalingEnabled}
                        onChange={toggleScaling}
                        style={{ marginRight: '8px' }}
                    />
                    Enable Scaling
                </label>
            </div>

            {scalingEnabled && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: 'white', fontSize: '12px' }}>Active Plane:</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handlePlaneChange('xz')}
                                style={{
                                    padding: '4px 8px',
                                    background: activePlane === 'xz' ? '#4CAF50' : '#333',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    flex: '1',
                                    fontSize: '11px'
                                }}
                                disabled={!showXZGrid}
                            >
                                XZ (Floor)
                            </button>
                            <button
                                onClick={() => handlePlaneChange('xy')}
                                style={{
                                    padding: '4px 8px',
                                    background: activePlane === 'xy' ? '#4CAF50' : '#333',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    flex: '1',
                                    fontSize: '11px'
                                }}
                                disabled={!showXYGrid}
                            >
                                XY (Front)
                            </button>
                            <button
                                onClick={() => handlePlaneChange('yz')}
                                style={{
                                    padding: '4px 8px',
                                    background: activePlane === 'yz' ? '#4CAF50' : '#333',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    flex: '1',
                                    fontSize: '11px'
                                }}
                                disabled={!showYZGrid}
                            >
                                YZ (Side)
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                            onClick={addScale}
                            style={{
                                padding: '6px 12px',
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                flex: '1'
                            }}
                        >
                            Add Scale
                        </button>
                        {selectedGridLine && (
                            <button
                                onClick={() => removeScale(selectedGridLine.id)}
                                style={{
                                    padding: '6px 12px',
                                    background: '#F44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    flex: '1'
                                }}
                            >
                                Remove Scale
                            </button>
                        )}
                    </div>

                    {selectedGridLine && (
                        <div style={{ marginTop: '8px', color: 'white', fontSize: '12px' }}>
                            <p style={{ margin: '0 0 8px 0' }}>Selected Scale: {selectedGridLine.plane.toUpperCase()}</p>
                            <p style={{ margin: '0 0 4px 0' }}>Use WASD to move the scale along grid lines</p>
                        </div>
                    )}

                    {scales.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                            <p style={{ color: 'white', fontSize: '12px', margin: '0 0 8px 0' }}>Scales:</p>
                            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                {scales.map((scale) => (
                                    <div
                                        key={scale.id}
                                        onClick={() => selectScale(scale.id)}
                                        style={{
                                            padding: '4px 8px',
                                            marginBottom: '4px',
                                            background: selectedGridLine && selectedGridLine.id === scale.id ? '#4CAF50' : '#333',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: 'white',
                                            fontSize: '11px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span>Scale {scale.plane.toUpperCase()} {scale.id.slice(-4)}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeScale(scale.id);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#F44336',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                padding: '0',
                                                lineHeight: '1'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ScaleControls;