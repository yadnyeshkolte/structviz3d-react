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

    // Position model with its right edge at the origin, keeping Y and Z positions
    const rightEdgeAtOrigin = () => {
        if (!modelGroupRef || !modelGroupRef.current || !modelRef || !modelRef.current) return;

        // Store current Y and Z positions
        const currentY = modelGroupRef.current.position.y;
        const currentZ = modelGroupRef.current.position.z;

        // Temporarily move the model to origin for bounding box calculation
        modelGroupRef.current.position.set(0, 0, 0);
        modelRef.current.updateMatrixWorld(true);

        // Calculate bounding box in this reset state
        const bbox = new THREE.Box3().setFromObject(modelRef.current);

        // Calculate the offset needed to place the right edge at x=0
        // The right edge is at the maximum x value of the bounding box
        const offsetX = -bbox.max.x;

        // Move the model to align its right edge with the origin while keeping Y and Z
        modelGroupRef.current.position.set(offsetX, currentY, currentZ);

        // Update state to reflect new position
        setOriginX(offsetX);
        setOriginY(currentY);
        setOriginZ(currentZ);
    };

    // Position model with its left edge at the origin, keeping Y and Z positions
    const leftEdgeAtOrigin = () => {
        if (!modelGroupRef || !modelGroupRef.current || !modelRef || !modelRef.current) return;

        // Store current Y and Z positions
        const currentY = modelGroupRef.current.position.y;
        const currentZ = modelGroupRef.current.position.z;

        // Temporarily move the model to origin for bounding box calculation
        modelGroupRef.current.position.set(0, 0, 0);
        modelRef.current.updateMatrixWorld(true);

        // Calculate bounding box in this reset state
        const bbox = new THREE.Box3().setFromObject(modelRef.current);

        // Calculate the offset needed to place the left edge at x=0
        // The left edge is at the minimum x value of the bounding box
        const offsetX = -bbox.min.x;

        // Move the model to align its left edge with the origin while keeping Y and Z
        modelGroupRef.current.position.set(offsetX, currentY, currentZ);

        // Update state to reflect new position
        setOriginX(offsetX);
        setOriginY(currentY);
        setOriginZ(currentZ);
    };

    // Position model with its back side at the origin, keeping X and Y positions
    const backSideAtOrigin = () => {
        if (!modelGroupRef || !modelGroupRef.current || !modelRef || !modelRef.current) return;

        // Store current X and Y positions
        const currentX = modelGroupRef.current.position.x;
        const currentY = modelGroupRef.current.position.y;

        // Temporarily move the model to origin for bounding box calculation
        modelGroupRef.current.position.set(0, 0, 0);
        modelRef.current.updateMatrixWorld(true);

        // Calculate bounding box in this reset state
        const bbox = new THREE.Box3().setFromObject(modelRef.current);

        // Calculate the offset needed to place the front side at z=0
        // The front side is at the minimum z value of the bounding box
        const offsetZ = -bbox.min.z;

        // Move the model to align its front side with the origin while keeping X and Y
        modelGroupRef.current.position.set(currentX, currentY, offsetZ);

        // Update state to reflect new position
        setOriginX(currentX);
        setOriginY(currentY);
        setOriginZ(offsetZ);
    };

    // Position model with its front side at the origin, keeping X and Y positions
    const frontSideAtOrigin = () => {
        if (!modelGroupRef || !modelGroupRef.current || !modelRef || !modelRef.current) return;

        // Store current X and Y positions
        const currentX = modelGroupRef.current.position.x;
        const currentY = modelGroupRef.current.position.y;

        // Temporarily move the model to origin for bounding box calculation
        modelGroupRef.current.position.set(0, 0, 0);
        modelRef.current.updateMatrixWorld(true);

        // Calculate bounding box in this reset state
        const bbox = new THREE.Box3().setFromObject(modelRef.current);

        // Calculate the offset needed to place the back side at z=0
        // The back side is at the maximum z value of the bounding box
        const offsetZ = -bbox.max.z;

        // Move the model to align its back side with the origin while keeping X and Y
        modelGroupRef.current.position.set(currentX, currentY, offsetZ);

        // Update state to reflect new position
        setOriginX(currentX);
        setOriginY(currentY);
        setOriginZ(offsetZ);
    };

    return (
        <div className="control-panel"
             style={{
                 padding: '8px',
                 display: 'flex',
                 flexDirection: 'column',
                 gap: '12px',
                 background: '#4d4d4D',
                 borderRadius: '4px'
             }}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: 'white'}}>Origin Controls</h3>
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
                    <button
                        className="control-button"
                        onClick={leftEdgeAtOrigin}
                        title="Position the left edge of the model at the origin"
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
                        Left Edge at Origin
                    </button>
                    <button
                        className="control-button"
                        onClick={rightEdgeAtOrigin}
                        title="Position the right edge of the model at the origin"
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
                        Right Edge at Origin
                    </button>
                    <button
                        className="control-button"
                        onClick={frontSideAtOrigin}
                        title="Position the front side of the model at the origin"
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
                        Front Side at Origin
                    </button>
                    <button
                        className="control-button"
                        onClick={backSideAtOrigin}
                        title="Position the back side of the model at the origin"
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
                        Back Side at Origin
                    </button>
                </div>

                <div className="control-row">
                    <label style={{color: 'white', fontSize: '12px', width: '50px', margin: '5px'}}>X Position:</label>
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
                    <label style={{color: 'white', fontSize: '12px', width: '50px', margin: '5px'}}>Y Position:</label>
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
                    <label style={{color: 'white', fontSize: '12px', width: '50px', margin: '5px'}}>Z Position:</label>
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