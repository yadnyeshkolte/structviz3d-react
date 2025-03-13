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
                           yzGridColor,
                           camera
                       }) => {
    // Scale settings
    const [scalingEnabled, setScalingEnabled] = useState(false);
    const [activePlane, setActivePlane] = useState('xz'); // Default to floor plane
    const [selectedGridLine, setSelectedGridLine] = useState(null);
    const [scales, setScales] = useState([]);
    const [numberDensity, setNumberDensity] = useState(5);

    // Unit settings
    const [unitSize, setUnitSize] = useState(1);
    const [unitType, setUnitType] = useState('m');
    const [textSize, setTextSize] = useState(1);

    // Refs for scale objects
    const scaleObjectsRef = useRef([]);
    const gridSizeRef = useRef(10); // Default grid size, should match GridControls
    const prevGridDivisionsRef = useRef(gridDivisions);
    const numberDensityRef = useRef(numberDensity);

    // Clean up scales when component unmounts
    useEffect(() => {
        return () => {
            if (scene) {
                scaleObjectsRef.current.forEach(scale => {
                    removeScaleElements(scale);
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

    // Keep numberDensityRef in sync with state
    useEffect(() => {
        numberDensityRef.current = numberDensity;
    }, [numberDensity]);

    // Update all scales when unit size, type, text size or number density changes
    useEffect(() => {
        updateAllScales();
    }, [unitSize, unitType, textSize, numberDensity]);

    const removeScaleElements = (scale) => {
        if (!scene) return;

        // Remove line
        if (scale.line) scene.remove(scale.line);

        // Remove all number labels
        if (scale.numberLabels) {
            scale.numberLabels.forEach(label => {
                scene.remove(label);
            });
        }
    };

    const updateScaleVisibility = useCallback(() => {
        scaleObjectsRef.current.forEach(scale => {
            if (!scale.line) return;

            // Show/hide based on corresponding grid visibility
            let visible = false;
            if (scale.plane === 'xz') {
                visible = showXZGrid;
            } else if (scale.plane === 'xy') {
                visible = showXYGrid;
            } else if (scale.plane === 'yz') {
                visible = showYZGrid;
            }

            scale.line.visible = visible;
            if (scale.numberLabels) {
                scale.numberLabels.forEach(label => {
                    label.visible = visible;
                });
            }
        });
    }, [showXZGrid, showXYGrid, showYZGrid]);

    const updateScalePositions = useCallback(() => {
        // Update all scales to reflect the new grid divisions
        scaleObjectsRef.current.forEach(scale => {
            if (!scale.line) return;

            // Recalculate based on the original logical grid position
            moveScale(scale.id, scale.position, true);
        });
    }, [gridDivisions]);

    const updateAllScales = useCallback(() => {
        scaleObjectsRef.current.forEach(scale => {
            updateScaleNumbers(scale);
        });
    }, [unitSize, unitType, textSize, numberDensity]);

    const updateScaleNumbers = useCallback((scale) => {
        if (!scale.line || !scene) return;

        // Remove old number labels
        if (scale.numberLabels) {
            scale.numberLabels.forEach(label => {
                scene.remove(label);
            });
        }

        const gridSize = gridSizeRef.current;
        const halfGrid = gridSize / 2;
        const divisions = gridDivisions;
        const cellSize = gridSize / divisions;

        // Create new number labels
        const numberLabels = [];
        const formattedUnitSize = parseFloat(unitSize);

        // Use the current numberDensity value from the ref to ensure we have the latest value
        const currentNumberDensity = numberDensityRef.current;

        for (let i = -divisions; i <= divisions; i++) {
            // Skip the origin (0) for cleaner display
            if (i === 0 && scale.skipOrigin) continue;

            // Skip numbers based on density setting
            if (i % currentNumberDensity !== 0) continue;

            // Calculate physical value at this position
            const value = i * formattedUnitSize;

            // Calculate position for the number
            let position = new THREE.Vector3();

            if (scale.plane === 'xz') {
                // Floor plane - X or Z axis
                if (scale.direction === 'x') {
                    position.set(i * cellSize, scale.position.y * cellSize, scale.position.z * cellSize);
                } else { // z direction
                    position.set(scale.position.x * cellSize, scale.position.y * cellSize, i * cellSize);
                }
            } else if (scale.plane === 'xy') {
                // Front plane - X or Y axis
                if (scale.direction === 'x') {
                    position.set(i * cellSize, scale.position.y * cellSize, scale.position.z * cellSize);
                } else { // y direction
                    position.set(scale.position.x * cellSize, i * cellSize, scale.position.z * cellSize);
                }
            } else if (scale.plane === 'yz') {
                // Side plane - Y or Z axis
                if (scale.direction === 'y') {
                    position.set(scale.position.x * cellSize, i * cellSize, scale.position.z * cellSize);
                } else { // z direction
                    position.set(scale.position.x * cellSize, scale.position.y * cellSize, i * cellSize);
                }
            }

            // Create text label
            const textSprite = createTextSprite(
                `${value}${unitType}`,
                getColorForPlane(scale.plane),
                position,
                textSize
            );

            scene.add(textSprite);
            numberLabels.push(textSprite);
        }

        scale.numberLabels = numberLabels;

    }, [scene, gridDivisions, unitSize, unitType, textSize]);

    // Helper function to create text sprite that always faces the camera
    const createTextSprite = (text, color, position, size = 1) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        // Clear canvas with transparent background
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw text
        context.font = 'bold 32px Arial';
        context.fillStyle = color || '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            sizeAttenuation: false,
            transparent: true
        });

        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        // Scale based on user's text size preference
        sprite.scale.set(0.5 * size, 0.25 * size, 1);

        return sprite;
    };

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

    const addScale = useCallback((direction) => {
        if (!scene) return;

        const gridSize = gridSizeRef.current;
        const halfGrid = gridSize / 2;

        // Default position at origin
        let position = { x: 0, y: 0, z: 0 };

        // Calculate line start and end based on plane and direction
        let start, end, plane = activePlane;

        // Create line geometry based on plane and direction
        if (plane === 'xz') {
            if (direction === 'x') {
                // X-axis scale on floor
                start = new THREE.Vector3(-halfGrid, 0, 0);
                end = new THREE.Vector3(halfGrid, 0, 0);
            } else { // z direction
                // Z-axis scale on floor
                start = new THREE.Vector3(0, 0, -halfGrid);
                end = new THREE.Vector3(0, 0, halfGrid);
            }
        } else if (plane === 'xy') {
            if (direction === 'x') {
                // X-axis scale on front wall
                start = new THREE.Vector3(-halfGrid, 0, -halfGrid);
                end = new THREE.Vector3(halfGrid, 0, -halfGrid);
            } else { // y direction
                // Y-axis scale on front wall
                start = new THREE.Vector3(0, -halfGrid, -halfGrid);
                end = new THREE.Vector3(0, halfGrid, -halfGrid);
            }
        } else if (plane === 'yz') {
            if (direction === 'y') {
                // Y-axis scale on side wall
                start = new THREE.Vector3(0, -halfGrid, -halfGrid);
                end = new THREE.Vector3(0, halfGrid, -halfGrid);
            } else { // z direction
                // Z-axis scale on side wall
                start = new THREE.Vector3(0, 0, -halfGrid);
                end = new THREE.Vector3(0, 0, halfGrid);
            }
        }

        // Create line geometry
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: getColorForPlane(plane),
            linewidth: 2
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);

        // Create scale object
        const scaleId = `${plane}-${direction}-${Date.now()}`;
        const scaleObj = {
            id: scaleId,
            line: line,
            plane: plane,
            direction: direction,
            position: position,
            numberLabels: [],
            skipOrigin: false
        };

        // Add to refs and state
        scaleObjectsRef.current.push(scaleObj);
        setScales(prev => [...prev, scaleObj]);

        // Create number labels along the scale
        updateScaleNumbers(scaleObj);

        return scaleId;
    }, [scene, activePlane, gridDivisions, getColorForPlane, updateScaleNumbers]);

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
        const cellSize = gridSize / gridDivisions;

        // Calculate grid-aligned position
        const alignedPosition = {
            x: Math.round(newPosition.x),
            y: Math.round(newPosition.y),
            z: Math.round(newPosition.z)
        };

        // Calculate new world positions based on grid position and cell size
        let lineStart, lineEnd;

        // Calculate world coordinates based on plane and direction
        if (scale.plane === 'xz') {
            if (scale.direction === 'x') {
                // X-axis on floor
                lineStart = new THREE.Vector3(-halfGrid, alignedPosition.y * cellSize, alignedPosition.z * cellSize);
                lineEnd = new THREE.Vector3(halfGrid, alignedPosition.y * cellSize, alignedPosition.z * cellSize);
            } else { // z direction
                // Z-axis on floor
                lineStart = new THREE.Vector3(alignedPosition.x * cellSize, alignedPosition.y * cellSize, -halfGrid);
                lineEnd = new THREE.Vector3(alignedPosition.x * cellSize, alignedPosition.y * cellSize, halfGrid);
            }
        } else if (scale.plane === 'xy') {
            if (scale.direction === 'x') {
                // X-axis on front wall
                lineStart = new THREE.Vector3(-halfGrid, alignedPosition.y * cellSize, alignedPosition.z * cellSize);
                lineEnd = new THREE.Vector3(halfGrid, alignedPosition.y * cellSize, alignedPosition.z * cellSize);
            } else { // y direction
                // Y-axis on front wall
                lineStart = new THREE.Vector3(alignedPosition.x * cellSize, -halfGrid, alignedPosition.z * cellSize);
                lineEnd = new THREE.Vector3(alignedPosition.x * cellSize, halfGrid, alignedPosition.z * cellSize);
            }
        } else if (scale.plane === 'yz') {
            if (scale.direction === 'y') {
                // Y-axis on side wall
                lineStart = new THREE.Vector3(alignedPosition.x * cellSize, -halfGrid, alignedPosition.z * cellSize);
                lineEnd = new THREE.Vector3(alignedPosition.x * cellSize, halfGrid, alignedPosition.z * cellSize);
            } else { // z direction
                // Z-axis on side wall
                lineStart = new THREE.Vector3(alignedPosition.x * cellSize, alignedPosition.y * cellSize, -halfGrid);
                lineEnd = new THREE.Vector3(alignedPosition.x * cellSize, alignedPosition.y * cellSize, halfGrid);
            }
        }

        // Update line geometry
        const points = [lineStart, lineEnd];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        if (scale.line) {
            scale.line.geometry.dispose();
            scale.line.geometry = geometry;
        }

        // Update scale data
        scale.position = alignedPosition;

        // Update number labels
        updateScaleNumbers(scale);

        // Update the refs and state
        scaleObjectsRef.current[scaleIndex] = scale;
        setScales([...scaleObjectsRef.current]);

        // Update selected grid line if this is the selected one
        if (selectedGridLine && selectedGridLine.id === scaleId) {
            setSelectedGridLine(scale);
        }
    }, [scene, gridDivisions, updateScaleNumbers]);

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
            selectedGridLine.line.material.color.set('#FFFFFF');
            setSelectedGridLine(null);
        }
    }, [selectedGridLine, getColorForPlane]);

    const removeScale = useCallback((scaleId) => {
        const scaleIndex = scaleObjectsRef.current.findIndex(s => s.id === scaleId);
        if (scaleIndex === -1 || !scene) return;

        const scale = scaleObjectsRef.current[scaleIndex];

        // Remove from scene
        removeScaleElements(scale);

        // Remove from refs and state
        scaleObjectsRef.current.splice(scaleIndex, 1);
        setScales(prev => prev.filter(s => s.id !== scaleId));

        // If removing selected scale, clear selection
        if (selectedGridLine && selectedGridLine.id === scaleId) {
            setSelectedGridLine(null);
        }
    }, [scene, selectedGridLine]);

    const handleKeyDown = useCallback((e) => {
        if (!scalingEnabled || !selectedGridLine) return;

        // Calculate step size based on grid divisions
        const step = 1; // Move one grid cell at a time
        let newPosition = { ...selectedGridLine.position };

        switch(e.key.toLowerCase()) {
            case 'w': // Move up/forward
                if (selectedGridLine.plane === 'xz') {
                    if (selectedGridLine.direction === 'x') {
                        newPosition.z -= step;
                    } else {
                        newPosition.x += step;
                    }
                } else if (selectedGridLine.plane === 'xy') {
                    if (selectedGridLine.direction === 'x') {
                        newPosition.y += step;
                    } else {
                        newPosition.x += step;
                    }
                } else if (selectedGridLine.plane === 'yz') {
                    if (selectedGridLine.direction === 'y') {
                        newPosition.z -= step;
                    } else {
                        newPosition.y += step;
                    }
                }
                break;
            case 's': // Move down/backward
                if (selectedGridLine.plane === 'xz') {
                    if (selectedGridLine.direction === 'x') {
                        newPosition.z += step;
                    } else {
                        newPosition.x -= step;
                    }
                } else if (selectedGridLine.plane === 'xy') {
                    if (selectedGridLine.direction === 'x') {
                        newPosition.y -= step;
                    } else {
                        newPosition.x -= step;
                    }
                } else if (selectedGridLine.plane === 'yz') {
                    if (selectedGridLine.direction === 'y') {
                        newPosition.z += step;
                    } else {
                        newPosition.y -= step;
                    }
                }
                break;
            case 'a': // Move left
                if (selectedGridLine.plane === 'xz') {
                    if (selectedGridLine.direction === 'x') {
                        newPosition.x -= step;
                    } else {
                        newPosition.z -= step;
                    }
                } else if (selectedGridLine.plane === 'xy') {
                    if (selectedGridLine.direction === 'x') {
                        newPosition.x -= step;
                    } else {
                        newPosition.y -= step;
                    }
                } else if (selectedGridLine.plane === 'yz') {
                    if (selectedGridLine.direction === 'y') {
                        newPosition.y -= step;
                    } else {
                        newPosition.z -= step;
                    }
                }
                break;
            case 'd': // Move right
                if (selectedGridLine.plane === 'xz') {
                    if (selectedGridLine.direction === 'x') {
                        newPosition.x += step;
                    } else {
                        newPosition.z += step;
                    }
                } else if (selectedGridLine.plane === 'xy') {
                    if (selectedGridLine.direction === 'x') {
                        newPosition.x += step;
                    } else {
                        newPosition.y += step;
                    }
                } else if (selectedGridLine.plane === 'yz') {
                    if (selectedGridLine.direction === 'y') {
                        newPosition.y += step;
                    } else {
                        newPosition.z += step;
                    }
                }
                break;
            default:
                return;
        }

        moveScale(selectedGridLine.id, newPosition);
    }, [scalingEnabled, selectedGridLine, moveScale]);

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

    // Update the three.js camera view every frame
    useEffect(() => {
        if (!camera) return;

        const updateLabels = () => {
            // Make all text sprites face the camera
            scaleObjectsRef.current.forEach(scale => {
                if (scale.numberLabels) {
                    scale.numberLabels.forEach(label => {
                        if (label && label.visible) {
                            label.lookAt(camera.position);
                        }
                    });
                }
            });

            requestAnimationFrame(updateLabels);
        };

        const animationId = requestAnimationFrame(updateLabels);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [camera]);

    // Handle real-time updates for number density slider
    const handleNumberDensityChange = (e) => {
        const newDensity = parseInt(e.target.value);
        setNumberDensity(newDensity);
        // Immediately update the ref to ensure the latest value is used
        numberDensityRef.current = newDensity;
        // Immediately update all scales to reflect the new density
        updateAllScales();
    };

    return (
        <div style={{
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#4d4d4D',
            borderRadius: '4px'
        }}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: 'white'}}>Scale Controls</h3>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <button
                    onClick={toggleScaling}
                    style={{
                        padding: '6px 12px',
                        background: scalingEnabled ? '#4CAF50' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        width: '100%',
                        textAlign: 'center',
                        transition: 'background-color 0.3s'
                    }}
                >
                    {scalingEnabled ? '✘ Unit Scaling' : 'Enable Unit Scaling'}
                </button>
            </div>

            {scalingEnabled && (
                <>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <label style={{color: 'white', fontSize: '12px', width: '40px'}}>Unit Size:</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={unitSize}
                            onChange={(e) => setUnitSize(e.target.value)}
                            style={{width: '60px', padding: '4px'}}
                        />
                        <select
                            value={unitType}
                            onChange={(e) => setUnitType(e.target.value)}
                            style={{padding: '4px'}}
                        >
                            <option value="m">m</option>
                            <option value="cm">cm</option>
                            <option value="km">km</option>
                            <option value="in">in</option>
                            <option value="ft">ft</option>
                            <option value="">units</option>
                        </select>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {/* Text and number input side by side */}
                        <div style={{display: 'flex', gap: '8px'}}>
                            <div style={{flex: 1, color: 'white', fontSize: '12px', padding: '4px'}}>
                                Number Density
                            </div>
                            <input
                                type="number"
                                min="1"
                                max={Math.max(10, Math.floor(gridDivisions / 2))}
                                value={numberDensity}
                                onChange={(e) => handleNumberDensityChange({target: {value: e.target.value}})}
                                style={{width: '60px', textAlign: 'center'}}
                            />
                        </div>
                        {/* Existing sliders remain unchanged */}
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input
                                type="range"
                                min="1"
                                max={Math.max(10, Math.floor(gridDivisions / 2))}
                                step="1"
                                value={numberDensity}
                                onChange={handleNumberDensityChange}
                                style={{flex: 1}}
                            />
                            <span style={{
                                color: 'white',
                                fontSize: '12px',
                                width: '40px',
                                textAlign: 'right'
                            }}>1:{numberDensity}</span>
                        </div>
                        {/* Second row: Text and text size input */}
                        <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                            <div style={{flex: 1, color: 'white', fontSize: '12px', padding: '4px'}}>
                                Text Size
                            </div>
                            <input
                                type="number"
                                min="0.1"
                                max="2"
                                step="0.1"
                                value={textSize}
                                onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                style={{width: '60px', textAlign: 'center'}}
                            />
                        </div>
                        {/* Text Size slider */}
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.1"
                                value={textSize}
                                onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                style={{flex: 1}}
                            />
                            <span style={{
                                color: 'white',
                                fontSize: '12px',
                                width: '30px',
                                textAlign: 'right'
                            }}>{textSize.toFixed(1)}</span>
                        </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <label style={{color: 'white', fontSize: '12px'}}>Active Plane:</label>
                        <div style={{display: 'flex', gap: '8px'}}>
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

                    <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                        <button
                            onClick={() => addScale('x')}
                            style={{
                                padding: '6px 12px',
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                flex: '1',
                                fontSize: '11px'
                            }}
                        >
                            {activePlane === 'yz' ? 'Add Y Scale' : 'Add X Scale'}
                        </button>
                        <button
                            onClick={() => addScale(activePlane === 'yz' ? 'y' : 'z')}
                            style={{
                                padding: '6px 12px',
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                flex: '1',
                                fontSize: '11px'
                            }}
                        >
                            {activePlane === 'xy' ? 'Add Y Scale' : 'Add Z Scale'}
                        </button>
                    </div>

                    {selectedGridLine && (
                        <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
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
                                Remove Selected Scale
                            </button>
                        </div>
                    )}

                    {selectedGridLine && (
                        <div style={{marginTop: '8px', color: 'white', fontSize: '12px'}}>
                            <p style={{margin: '0 0 8px 0'}}>Selected: {selectedGridLine.plane.toUpperCase()} {selectedGridLine.direction.toUpperCase()}</p>
                            <p style={{margin: '0 0 4px 0'}}>Use WS to move the scale</p>
                            <p style={{margin: '0 0 4px 0'}}>Use AD to move the scale in 3D</p>
                            <p style={{margin: '0', fontSize: '10px'}}>
                                Position:
                                X:{selectedGridLine.position.x} Y:{selectedGridLine.position.y} Z:{selectedGridLine.position.z}
                            </p>
                        </div>
                    )}

                    {scales.length > 0 && (
                        <div style={{marginTop: '8px'}}>
                            <p style={{color: 'white', fontSize: '12px', margin: '0 0 8px 0'}}>Active Scales:</p>
                            <div style={{maxHeight: '120px', overflowY: 'auto'}}>
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
                                        <span>{scale.plane.toUpperCase()} {scale.direction.toUpperCase()}-axis</span>
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