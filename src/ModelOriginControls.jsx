import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

const ModelOriginControls = ({
                                 modelGroupRef,
                                 modelRef,
                                 scene,
                                 gridDivisions,
                                 showXZGrid,
                                 showXYGrid,
                                 showYZGrid
                             }) => {
    const [originX, setOriginX] = useState(0);
    const [originY, setOriginY] = useState(0);
    const [originZ, setOriginZ] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Initialize origin values when component mounts or modelGroup changes
        if (modelGroupRef && modelGroupRef.current) {
            const position = modelGroupRef.current.position;
            setOriginX(position.x);
            setOriginY(position.y);
            setOriginZ(position.z);
        }
    }, [modelGroupRef]);

    const handleOriginChange = (axis, value) => {
        if (!modelGroupRef || !modelGroupRef.current) return;

        // Update state
        if (axis === 'x') setOriginX(value);
        if (axis === 'y') setOriginY(value);
        if (axis === 'z') setOriginZ(value);

        // Update model position
        modelGroupRef.current.position[axis] = parseFloat(value);
    };

    const resetOrigin = () => {
        if (!modelGroupRef || !modelGroupRef.current) return;

        // Reset position
        modelGroupRef.current.position.set(0, 0, 0);

        // Update state
        setOriginX(0);
        setOriginY(0);
        setOriginZ(0);
    };

    // Position model with its base at the origin, keeping X and Z positions
    const baseAtOrigin = () => {
        if (!modelGroupRef || !modelGroupRef.current || !modelRef || !modelRef.current) return;

        // Store current X and Z positions
        const currentX = modelGroupRef.current.position.x;
        const currentZ = modelGroupRef.current.position.z;

        // We need to create a temporary clone of the model's world matrix
        // This is to calculate the bounding box accurately regardless of current position
        const originalPosition = modelGroupRef.current.position.clone();

        // Temporarily move the model to origin for bounding box calculation
        modelGroupRef.current.position.set(0, 0, 0);
        modelRef.current.updateMatrixWorld(true);

        // Calculate bounding box in this reset state
        const bbox = new THREE.Box3().setFromObject(modelRef.current);

        // Calculate the offset needed to place the bottom at y=0
        const offsetY = -bbox.min.y;

        // Move the model back to original X and Z, but with proper Y to have base at XZ plane
        modelGroupRef.current.position.set(currentX, offsetY, currentZ);

        // Update state to reflect new position
        setOriginX(currentX);
        setOriginY(offsetY);
        setOriginZ(currentZ);
    };

    return (
        <div className="control-panel">
            <div className="control-panel-content">

                <div className="button-group"
                     style={{
                         display: 'grid',
                         gridTemplateColumns: 'repeat(2, 1fr)',
                         gap: '8px',
                         marginBottom: '10px'
                     }}>
                    <button
                        className="control-button"
                        onClick={resetOrigin}
                        title="Reset the model to the origin (0,0,0)"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Reset Origin
                    </button>
                    <button
                        className="control-button"
                        onClick={baseAtOrigin}
                        title="Position the base (bottom) of the model at the origin"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Base at Origin
                    </button>
                </div>

                <div className="control-row">
                    <label style={{ color: 'white', fontSize: '12px', width: '50px', margin: '5px' }}>X Position:</label>
                    <input
                        type="number"
                        value={originX}
                        step="0.1"
                        onChange={(e) => handleOriginChange('x', e.target.value)}
                        className="numeric-input"
                        style={{
                            width: '150px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            fontSize: '12px'
                        }}
                    />
                    <div>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={originX}
                            onChange={(e) => handleOriginChange('x', e.target.value)}
                            style={{
                                width: '220px',
                            }}
                        />
                    </div>
                </div>

                <div className="control-row">
                    <label style={{ color: 'white', fontSize: '12px', width: '50px', margin: '5px' }}>Y Position:</label>
                    <input
                        type="number"
                        value={originY}
                        step="0.1"
                        onChange={(e) => handleOriginChange('y', e.target.value)}
                        className="numeric-input"
                        style={{
                            width: '150px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            fontSize: '12px'
                        }}
                    />
                    <div>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={originY}
                            onChange={(e) => handleOriginChange('y', e.target.value)}
                            style={{
                                width: '220px',
                            }}
                        />
                    </div>
                </div>

                <div className="control-row">
                    <label style={{ color: 'white', fontSize: '12px', width: '50px', margin: '5px' }}>Z Position:</label>
                    <input
                        type="number"
                        value={originZ}
                        step="0.1"
                        onChange={(e) => handleOriginChange('z', e.target.value)}
                        className="numeric-input"
                        style={{
                            width: '150px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            fontSize: '12px'
                        }}
                    />
                    <div>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={originZ}
                            onChange={(e) => handleOriginChange('z', e.target.value)}
                            style={{
                                width: '220px',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelOriginControls;