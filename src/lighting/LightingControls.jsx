import React, { useState } from 'react';
import lightingManager from './LightingManager.jsx';

const LightingControls = ({ scene }) => {
    const [intensities, setIntensities] = useState({
        ambient: 0.4,
        main: 0.8,
        hemisphere: 0.5,
        fill: 0.3,
        back: 0.2
    });

    const [mainLightPosition, setMainLightPosition] = useState({
        x: 5,
        y: 10,
        z: 7.5
    });

    const [shadowsEnabled, setShadowsEnabled] = useState(true);

    // Handle intensity changes
    const handleIntensityChange = (lightType, value) => {
        const newIntensities = { ...intensities, [lightType]: parseFloat(value) };
        setIntensities(newIntensities);
        lightingManager.updateLightIntensities(newIntensities);
    };

    // Handle main light position changes
    const handlePositionChange = (axis, value) => {
        const newPosition = { ...mainLightPosition, [axis]: parseFloat(value) };
        setMainLightPosition(newPosition);

        lightingManager.updateLightPositions({
            main: newPosition
        });
    };

    // Toggle shadows
    const handleToggleShadows = () => {
        const newShadowsState = !shadowsEnabled;
        setShadowsEnabled(newShadowsState);
        lightingManager.toggleShadows(newShadowsState);
    };

    // Reset all lighting to default
    const handleResetLighting = () => {
        if (scene) {
            lightingManager.setupLighting(scene);
            setIntensities({
                ambient: 0.4,
                main: 0.8,
                hemisphere: 0.5,
                fill: 0.3,
                back: 0.2
            });
            setMainLightPosition({
                x: 5,
                y: 10,
                z: 7.5
            });
            setShadowsEnabled(true);
        }
    };

    return (
        <div className="lighting-controls">
            <h3>Lighting Controls</h3>

            <div className="control-section">
                <h4>Light Intensities</h4>

                <div className="control-row">
                    <label htmlFor="ambient-intensity">Ambient:</label>
                    <input
                        id="ambient-intensity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={intensities.ambient}
                        onChange={(e) => handleIntensityChange('ambient', e.target.value)}
                    />
                    <span>{intensities.ambient.toFixed(2)}</span>
                </div>

                <div className="control-row">
                    <label htmlFor="main-intensity">Main:</label>
                    <input
                        id="main-intensity"
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.05"
                        value={intensities.main}
                        onChange={(e) => handleIntensityChange('main', e.target.value)}
                    />
                    <span>{intensities.main.toFixed(2)}</span>
                </div>

                <div className="control-row">
                    <label htmlFor="hemisphere-intensity">Hemisphere:</label>
                    <input
                        id="hemisphere-intensity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={intensities.hemisphere}
                        onChange={(e) => handleIntensityChange('hemisphere', e.target.value)}
                    />
                    <span>{intensities.hemisphere.toFixed(2)}</span>
                </div>

                <div className="control-row">
                    <label htmlFor="fill-intensity">Fill:</label>
                    <input
                        id="fill-intensity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={intensities.fill}
                        onChange={(e) => handleIntensityChange('fill', e.target.value)}
                    />
                    <span>{intensities.fill.toFixed(2)}</span>
                </div>

                <div className="control-row">
                    <label htmlFor="back-intensity">Back:</label>
                    <input
                        id="back-intensity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={intensities.back}
                        onChange={(e) => handleIntensityChange('back', e.target.value)}
                    />
                    <span>{intensities.back.toFixed(2)}</span>
                </div>
            </div>

            <div className="control-section">
                <h4>Main Light Position</h4>

                <div className="control-row">
                    <label htmlFor="main-x">X:</label>
                    <input
                        id="main-x"
                        type="range"
                        min="-20"
                        max="20"
                        step="0.5"
                        value={mainLightPosition.x}
                        onChange={(e) => handlePositionChange('x', e.target.value)}
                    />
                    <span>{mainLightPosition.x.toFixed(1)}</span>
                </div>

                <div className="control-row">
                    <label htmlFor="main-y">Y:</label>
                    <input
                        id="main-y"
                        type="range"
                        min="-20"
                        max="20"
                        step="0.5"
                        value={mainLightPosition.y}
                        onChange={(e) => handlePositionChange('y', e.target.value)}
                    />
                    <span>{mainLightPosition.y.toFixed(1)}</span>
                </div>

                <div className="control-row">
                    <label htmlFor="main-z">Z:</label>
                    <input
                        id="main-z"
                        type="range"
                        min="-20"
                        max="20"
                        step="0.5"
                        value={mainLightPosition.z}
                        onChange={(e) => handlePositionChange('z', e.target.value)}
                    />
                    <span>{mainLightPosition.z.toFixed(1)}</span>
                </div>
            </div>

            <div className="control-section">
                <div className="control-row">
                    <label htmlFor="shadows-toggle">Shadows:</label>
                    <input
                        id="shadows-toggle"
                        type="checkbox"
                        checked={shadowsEnabled}
                        onChange={handleToggleShadows}
                    />
                </div>

                <button className="reset-button" onClick={handleResetLighting}>
                    Reset Lighting
                </button>
            </div>
        </div>
    );
};

export default LightingControls;