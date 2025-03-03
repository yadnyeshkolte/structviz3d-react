import React, { useState } from 'react';

const OrientationControls = ({ modelGroup, resetOrientation }) => {
    const [rotationX, setRotationX] = useState(0);
    const [rotationY, setRotationY] = useState(0);
    const [rotationZ, setRotationZ] = useState(0);

    // Track empty input state
    const [inputValues, setInputValues] = useState({
        x: '0',
        y: '0',
        z: '0'
    });

    const handleRotationChange = (axis, value) => {
        // Clamp value between -180 and 180
        const clampedValue = Math.min(180, Math.max(-180, value));
        const radians = (clampedValue * Math.PI) / 180;

        if (modelGroup) {
            if (axis === 'x') {
                modelGroup.rotation.x = radians;
                setRotationX(clampedValue);
                setInputValues(prev => ({ ...prev, x: clampedValue.toString() }));
            } else if (axis === 'y') {
                modelGroup.rotation.y = radians;
                setRotationY(clampedValue);
                setInputValues(prev => ({ ...prev, y: clampedValue.toString() }));
            } else if (axis === 'z') {
                modelGroup.rotation.z = radians;
                setRotationZ(clampedValue);
                setInputValues(prev => ({ ...prev, z: clampedValue.toString() }));
            }
        }
    };

    const handleInputChange = (axis, e) => {
        const inputValue = e.target.value;

        // Update input value state regardless of validity
        setInputValues(prev => ({ ...prev, [axis]: inputValue }));

        // Only update actual rotation if it's a valid number
        if (inputValue === '') {
            // Don't update rotation when field is empty
            return;
        }

        const value = parseFloat(inputValue);
        if (!isNaN(value)) {
            handleRotationChange(axis, value);
        }
    };

    const handleInputBlur = (axis) => {
        // When input loses focus, if it's empty, set it to 0
        if (inputValues[axis] === '') {
            const value = 0;
            handleRotationChange(axis, value);
        }
    };

    const handleReset = () => {
        if (modelGroup) {
            modelGroup.rotation.set(0, 0, 0);
            setRotationX(0);
            setRotationY(0);
            setRotationZ(0);
            setInputValues({ x: '0', y: '0', z: '0' });
            if (resetOrientation) resetOrientation();
        }
    };

    const handleFlip = (axis) => {
        if (modelGroup) {
            if (axis === 'x') {
                modelGroup.rotation.x = modelGroup.rotation.x + Math.PI;
                const newValue = rotationX + 180;
                setRotationX(newValue);
                setInputValues(prev => ({ ...prev, x: newValue.toString() }));
            } else if (axis === 'y') {
                modelGroup.rotation.y = modelGroup.rotation.y + Math.PI;
                const newValue = rotationY + 180;
                setRotationY(newValue);
                setInputValues(prev => ({ ...prev, y: newValue.toString() }));
            } else if (axis === 'z') {
                modelGroup.rotation.z = modelGroup.rotation.z + Math.PI;
                const newValue = rotationZ + 180;
                setRotationZ(newValue);
                setInputValues(prev => ({ ...prev, z: newValue.toString() }));
            }
        }
    };

    return (
        <div style={{ marginTop: '10px' }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px'
            }}>
                <h3 style={{
                    color: 'white',
                    margin: '0 0 10px 0',
                    fontSize: '14px',
                    fontWeight: 'normal'
                }}>
                    Orientation Controls
                </h3>

                {/* X-Axis Controls */}
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <label style={{ color: 'white', fontSize: '12px', width: '50px' }}>X-Axis:</label>
                        <input
                            type="text"
                            min="-180"
                            max="180"
                            value={inputValues.x}
                            onChange={(e) => handleInputChange('x', e)}
                            onBlur={() => handleInputBlur('x')}
                            style={{
                                width: '30px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            value={rotationX}
                            onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={() => handleFlip('x')}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                            title="Flip X"
                        >
                            Flip
                        </button>
                    </div>
                </div>

                {/* Y-Axis Controls */}
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <label style={{ color: 'white', fontSize: '12px', width: '50px' }}>Y-Axis:</label>
                        <input
                            type="text"
                            min="-180"
                            max="180"
                            value={inputValues.y}
                            onChange={(e) => handleInputChange('y', e)}
                            onBlur={() => handleInputBlur('y')}
                            style={{
                                width: '30px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            value={rotationY}
                            onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={() => handleFlip('y')}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                            title="Flip Y"
                        >
                            Flip
                        </button>
                    </div>
                </div>

                {/* Z-Axis Controls */}
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <label style={{ color: 'white', fontSize: '12px', width: '50px' }}>Z-Axis:</label>
                        <input
                            type="text"
                            min="-180"
                            max="180"
                            value={inputValues.z}
                            onChange={(e) => handleInputChange('z', e)}
                            onBlur={() => handleInputBlur('z')}
                            style={{
                                width: '30px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            value={rotationZ}
                            onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={() => handleFlip('z')}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                            title="Flip Z"
                        >
                            Flip
                        </button>
                    </div>
                </div>

                {/* Preset Buttons */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginTop: '10px'
                }}>
                    <button
                        onClick={handleReset}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            gridColumn: 'span 3'
                        }}
                    >
                        Reset Orientation
                    </button>

                    <button
                        onClick={() => {
                            handleRotationChange('x', 0);
                            handleRotationChange('y', 0);
                            handleRotationChange('z', 0);
                        }}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                        title="Front view"
                    >
                        Front
                    </button>

                    <button
                        onClick={() => {
                            handleRotationChange('x', 0);
                            handleRotationChange('y', 180);
                            handleRotationChange('z', 0);
                        }}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                        title="Back view"
                    >
                        Back
                    </button>

                    <button
                        onClick={() => {
                            handleRotationChange('x', 0);
                            handleRotationChange('y', 90);
                            handleRotationChange('z', 0);
                        }}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                        title="Right view"
                    >
                        Right
                    </button>

                    <button
                        onClick={() => {
                            handleRotationChange('x', 0);
                            handleRotationChange('y', -90);
                            handleRotationChange('z', 0);
                        }}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                        title="Left view"
                    >
                        Left
                    </button>

                    <button
                        onClick={() => {
                            handleRotationChange('x', -90);
                            handleRotationChange('y', 0);
                            handleRotationChange('z', 0);
                        }}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                        title="Top view"
                    >
                        Top
                    </button>

                    <button
                        onClick={() => {
                            handleRotationChange('x', 90);
                            handleRotationChange('y', 0);
                            handleRotationChange('z', 0);
                        }}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                        title="Bottom view"
                    >
                        Bottom
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrientationControls;