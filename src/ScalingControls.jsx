import React, { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const ScalingControls = ({
                             scene,
                             showXZGrid,
                             showXYGrid,
                             showYZGrid,
                             gridDivisions,
                             enabled = false,
                             onToggleScaling
                         }) => {
    const [unitValue, setUnitValue] = useState(1);
    const [unitType, setUnitType] = useState('m');
    const [selectedLines, setSelectedLines] = useState([]);

    // Add a measurement line to a grid plane
    const addMeasurementLine = useCallback((planeName) => {
        const newLine = {
            id: Date.now().toString(),
            plane: planeName,
            color: getRandomColor(),
            isVisible: true  // New property to track visibility
        };

        // Create the actual visual elements
        const visual = createMeasurementVisual(newLine);
        newLine.visual = visual;

        setSelectedLines(prev => [...prev, newLine]);

        scene.add(visual.line);
        visual.labels.forEach(label => scene.add(label));
    }, [scene, selectedLines, gridDivisions, unitValue, unitType]);

    // Toggle visibility of a specific measurement line
    const toggleLineVisibility = useCallback((index) => {
        setSelectedLines(prev => prev.map((line, i) => {
            if (i === index) {
                // Toggle visibility and update scene accordingly
                const newVisibility = !line.isVisible;

                if (line.visual) {
                    if (newVisibility) {
                        // Show the line
                        scene.add(line.visual.line);
                        line.visual.labels.forEach(label => scene.add(label));
                    } else {
                        // Hide the line
                        scene.remove(line.visual.line);
                        line.visual.labels.forEach(label => scene.remove(label));
                    }
                }

                return { ...line, isVisible: newVisibility };
            }
            return line;
        }));
    }, [scene]);

    // Create visual elements for measurement lines
    const createMeasurementVisual = useCallback((lineInfo) => {
        const material = new THREE.LineBasicMaterial({
            color: lineInfo.color,
            linewidth: 2
        });

        // Set up the line geometry based on plane
        let points = [];
        let gridSize = 10; // Match the grid size from GridControls
        let labels = [];

        if (lineInfo.plane === 'XZ') {
            // Create X-axis measurement line
            points = [
                new THREE.Vector3(0, 0, -gridSize / 2),
                new THREE.Vector3(0, 0, gridSize / 2)
            ];

            // Add labels
            for (let i = -Math.floor(gridDivisions / 2); i <= Math.floor(gridDivisions / 2); i++) {
                const labelMesh = createTextLabel(
                    `${i * unitValue}${unitType}`,
                    new THREE.Vector3(0, 0, i * (gridSize / gridDivisions)),
                    lineInfo.color
                );
                labels.push(labelMesh);
            }
        } else if (lineInfo.plane === 'XY') {
            // Create vertical X-axis measurement line
            points = [
                new THREE.Vector3(-gridSize / 2, 0, 0),
                new THREE.Vector3(gridSize / 2, 0, 0)
            ];

            // Add labels
            for (let i = -Math.floor(gridDivisions / 2); i <= Math.floor(gridDivisions / 2); i++) {
                const labelMesh = createTextLabel(
                    `${i * unitValue}${unitType}`,
                    new THREE.Vector3(i * (gridSize / gridDivisions), 0, 0),
                    lineInfo.color
                );
                labels.push(labelMesh);
            }
        } else if (lineInfo.plane === 'YZ') {
            // Create Y-axis measurement line
            points = [
                new THREE.Vector3(0, -gridSize / 2, 0),
                new THREE.Vector3(0, gridSize / 2, 0)
            ];

            // Add labels
            for (let i = -Math.floor(gridDivisions / 2); i <= Math.floor(gridDivisions / 2); i++) {
                const labelMesh = createTextLabel(
                    `${i * unitValue}${unitType}`,
                    new THREE.Vector3(0, i * (gridSize / gridDivisions), 0),
                    lineInfo.color
                );
                labels.push(labelMesh);
            }
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);

        return { line, labels };
    }, [gridDivisions, unitValue, unitType]);

    // Create text labels for measurements
    const createTextLabel = useCallback((text, position, color) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 32;
        canvas.height = 16;

        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = '12px Arial';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(0.5, 0.25, 1);

        return sprite;
    }, []);

    // Remove a measurement line
    const removeMeasurementLine = useCallback((index) => {
        const lineToRemove = selectedLines[index];

        // Remove visual elements from the scene
        if (lineToRemove.visual) {
            scene.remove(lineToRemove.visual.line);
            lineToRemove.visual.labels.forEach(label => scene.remove(label));
        }

        setSelectedLines(prev => prev.filter((_, i) => i !== index));
    }, [scene, selectedLines]);

    // Utility function to get random colors for lines
    const getRandomColor = () => {
        const colors = ['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    // Update measurement lines when gridDivisions or unitValue changes
    useEffect(() => {
        if (!enabled || selectedLines.length === 0) return;

        // Remove old visuals
        selectedLines.forEach(line => {
            if (line.visual) {
                scene.remove(line.visual.line);
                line.visual.labels.forEach(label => scene.remove(label));
            }
        });

        // Create updated visuals with new values
        const updatedLines = selectedLines.map(line => {
            const newVisual = createMeasurementVisual(line);
            scene.add(newVisual.line);
            newVisual.labels.forEach(label => scene.add(label));
            return { ...line, visual: newVisual };
        });

        setSelectedLines(updatedLines);
    }, [enabled, scene, gridDivisions, unitValue, unitType, createMeasurementVisual]);

    // Cleanup function
    useEffect(() => {
        return () => {
            selectedLines.forEach(line => {
                if (line.visual) {
                    scene.remove(line.visual.line);
                    line.visual.labels.forEach(label => scene.remove(label));
                }
            });
        };
    }, [scene, selectedLines]);

    // Effect to handle enabling/disabling scaling
    useEffect(() => {
        if (!enabled) {
            // Remove all measurement lines when scaling is disabled
            selectedLines.forEach(line => {
                if (line.visual) {
                    scene.remove(line.visual.line);
                    line.visual.labels.forEach(label => scene.remove(label));
                }
            });
            setSelectedLines([]);
        }
    }, [enabled, scene, selectedLines]);

    return (
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'white' }}>Scaling & Measurement</h3>

            {/* Toggle scaling mode */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={onToggleScaling}
                        style={{ marginRight: '8px' }}
                    />
                    Enable Scaling
                </label>
            </div>

            {/* Only show these controls when scaling is enabled */}
            {enabled && (
                <>
                    {/* Unit configuration (remains the same) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ color: 'white', fontSize: '12px' }}>Unit Value:</label>
                        <input
                            type="number"
                            min="0.001"
                            step="0.1"
                            value={unitValue}
                            onChange={(e) => setUnitValue(parseFloat(e.target.value))}
                            style={{ width: '60px' }}
                        />
                        <select
                            value={unitType}
                            onChange={(e) => setUnitType(e.target.value)}
                            style={{ padding: '2px' }}
                        >
                            <option value="mm">mm</option>
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                            <option value="km">km</option>
                            <option value="in">in</option>
                            <option value="ft">ft</option>
                            <option value="unit">unit</option>
                        </select>
                    </div>

                    {/* Selected measurement lines display with visibility toggle */}
                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        {selectedLines.map((line, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '4px',
                                marginBottom: '4px',
                                fontSize: '12px',
                                color: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={line.isVisible}
                                        onChange={() => toggleLineVisibility(index)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span>Scale {index + 1} - {line.plane}</span>
                                </div>
                                <button
                                    onClick={() => removeMeasurementLine(index)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ff6b6b',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add new measurement line buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p style={{ margin: '0', fontSize: '12px', color: 'white' }}>Add Measurement Line:</p>

                        {showXZGrid && (
                            <button
                                onClick={() => addMeasurementLine('XZ')}
                                style={{ fontSize: '12px' }}
                            >
                                XZ Grid (Floor)
                            </button>
                        )}

                        {showXYGrid && (
                            <button
                                onClick={() => addMeasurementLine('XY')}
                                style={{ fontSize: '12px' }}
                            >
                                XY Grid (Front)
                            </button>
                        )}

                        {showYZGrid && (
                            <button
                                onClick={() => addMeasurementLine('YZ')}
                                style={{ fontSize: '12px' }}
                            >
                                YZ Grid (Side)
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ScalingControls;