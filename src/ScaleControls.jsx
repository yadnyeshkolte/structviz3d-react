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

    // Add a ref to track the grid size
    const gridSizeRef = useRef(10); // Default grid size, should match GridControls

    // Track previous grid divisions to detect changes
    const prevGridDivisionsRef = useRef(gridDivisions);

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
        if (prevGridDivisionsRef.current !== gridDivisions) {
            updateScalePositions();
            prevGridDivisionsRef.current = gridDivisions;
        }
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
        // Update all scales to reflect the new grid divisions
        scaleObjectsRef.current.forEach(scale => {
            if (!scale.line || !scale.textMesh) return;

            // Recalculate based on the original logical grid position
            moveScale(scale.id, scale.position, true);
        });
    }, [gridDivisions]);

    const updateScaleText = useCallback((scale) => {
        if (!scale.textMesh || !scene) return;

        // Calculate real-world unit based on grid divisions
        const unitPerDivision = gridSizeRef.current / gridDivisions;
        let scaleValue;

        // Calculate scale value based on grid position and plane
        if (scale.plane === 'xz') {
            scaleValue = scale.position.z * unitPerDivision;
        } else if (scale.plane === 'xy') {
            scaleValue = scale.position.y * unitPerDivision;
        } else if (scale.plane === 'yz') {
            scaleValue = scale.position.z * unitPerDivision;
        }

        // Remove old text mesh from scene
        scene.remove(scale.textMesh);

        // Create text texture with updated value
        const texture = createTextTexture(
            `${scaleValue.toFixed(2)}`,
            getColorForPlane(scale.plane)
        );

        // Create new sprite with updated texture
        const textSprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                sizeAttenuation: false
            })
        );

        textSprite.position.copy(scale.textPosition);
        textSprite.scale.set(0.5, 0.5, 1);

        scene.add(textSprite);
        scale.textMesh = textSprite;

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

        // Calculate step size based on grid divisions
        const step = 1; // Move one grid cell at a time
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

        const gridSize = gridSizeRef.current;
        const halfGrid = gridSize / 2;

        // Default position based on active plane
        let start, end, textPos, plane = activePlane;
        let position = { x: 0, y: 0, z: 0 }; // Default to center

        // Calculate world coordinates based on current grid divisions
        const cellSize = gridSize / gridDivisions;

        if (plane === 'xz') {
            // Floor plane (X axis scale)
            start = new THREE.Vector3(-halfGrid, 0, 0);
            end = new THREE.Vector3(halfGrid, 0, 0);
            textPos = new THREE.Vector3(halfGrid + 0.5, 0, 0);
        } else if (plane === 'xy') {
            // Front plane (X axis scale)
            start = new THREE.Vector3(-halfGrid, 0, -halfGrid);
            end = new THREE.Vector3(halfGrid, 0, -halfGrid);
            textPos = new THREE.Vector3(halfGrid + 0.5, 0, -halfGrid);
        } else if (plane === 'yz') {
            // Side plane (Y axis scale)
            start = new THREE.Vector3(-halfGrid, -halfGrid, 0);
            end = new THREE.Vector3(-halfGrid, halfGrid, 0);
            textPos = new THREE.Vector3(-halfGrid, halfGrid + 0.5, 0);
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

        // Create text sprite with placeholder value
        const scaleValue = "0.00";
        const textSprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: createTextTexture(scaleValue, getColorForPlane(plane)),
                sizeAttenuation: false
            })
        );

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
            position: position,
            textPosition: textPos
        };

        // Add to refs and state
        scaleObjectsRef.current.push(scaleObj);
        setScales(prev => [...prev, scaleObj]);

        // Update the scale text to show correct value
        updateScaleText(scaleObj);

        return scaleId;
    }, [scene, activePlane, gridDivisions, getColorForPlane, updateScaleText]);

    // Helper function to create text texture
    const createTextTexture = (text, color) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = 'bold 64px Arial';
        context.fillStyle = color || '#FFFFFF';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    };

    const moveScale = useCallback((scaleId, newPosition, forceUpdate = false) => {
        if (!scene) return;

        const scaleIndex = scaleObjectsRef.current.findIndex(s => s.id === scaleId);
        if (scaleIndex === -1) return;

        const scale = scaleObjectsRef.current[scaleIndex];

        // Only update if position changed or forceUpdate is true
        if (!forceUpdate &&
            scale.position.x === newPosition.x &&
            scale.position.y === newPosition.y &&
            scale.position.z === newPosition.z) {
            return;
        }

        const gridSize = gridSizeRef.current;
        const halfGrid = gridSize / 2;

        // Always recalculate cell size based on current grid divisions
        const cellSize = gridSize / gridDivisions;

        // Calculate grid-aligned position
        const alignedPosition = {
            x: Math.round(newPosition.x),
            y: Math.round(newPosition.y),
            z: Math.round(newPosition.z)
        };

        // Calculate new world positions based on grid position and cell size
        let lineStart, lineEnd, textPos;

        // Calculate world coordinates based on current grid divisions
        if (scale.plane === 'xz') {
            // Floor plane (X-axis scale)
            const worldZ = alignedPosition.z * cellSize;
            lineStart = new THREE.Vector3(-halfGrid, alignedPosition.y * cellSize, worldZ);
            lineEnd = new THREE.Vector3(halfGrid, alignedPosition.y * cellSize, worldZ);
            textPos = new THREE.Vector3(halfGrid + 0.5, alignedPosition.y * cellSize, worldZ);
        } else if (scale.plane === 'xy') {
            // Front plane (X-axis scale)
            const worldY = alignedPosition.y * cellSize;
            lineStart = new THREE.Vector3(-halfGrid, worldY, alignedPosition.z * cellSize);
            lineEnd = new THREE.Vector3(halfGrid, worldY, alignedPosition.z * cellSize);
            textPos = new THREE.Vector3(halfGrid + 0.5, worldY, alignedPosition.z * cellSize);
        } else if (scale.plane === 'yz') {
            // Side plane (Y-axis scale)
            const worldX = alignedPosition.x * cellSize;
            lineStart = new THREE.Vector3(worldX, -halfGrid, alignedPosition.z * cellSize);
            lineEnd = new THREE.Vector3(worldX, halfGrid, alignedPosition.z * cellSize);
            textPos = new THREE.Vector3(worldX, halfGrid + 0.5, alignedPosition.z * cellSize);
        }

        // Update line geometry
        const points = [lineStart, lineEnd];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        if (scale.line) {
            scale.line.geometry.dispose();
            scale.line.geometry = geometry;
        }

        // Update text position
        scale.textPosition = textPos;
        if (scale.textMesh) {
            scale.textMesh.position.copy(textPos);
        }

        // Update scale data
        scale.position = alignedPosition;

        // Update scale text with new position value
        updateScaleText(scale);

        // Update the refs and state
        scaleObjectsRef.current[scaleIndex] = scale;
        setScales([...scaleObjectsRef.current]);

        // Update selected grid line if this is the selected one
        if (selectedGridLine && selectedGridLine.id === scaleId) {
            setSelectedGridLine(scale);
        }
    }, [scene, gridDivisions, updateScaleText]);

    const selectScale = useCallback((scaleId) => {
        // Deselect any currently selected scale
        deselectScale();

        const scale = scaleObjectsRef.current.find(s => s.id === scaleId);
        if (scale) {
            // Highlight the selected scale
            scale.line.material.color.set('#000000'); // Yellow highlight
            setSelectedGridLine(scale);

            // Also switch to the plane this scale is on
            setActivePlane(scale.plane);
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
                            <p style={{ margin: '0', fontSize: '10px' }}>
                                Position: X:{selectedGridLine.position.x} Y:{selectedGridLine.position.y} Z:{selectedGridLine.position.z}
                            </p>
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