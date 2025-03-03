import React, { useEffect, useCallback } from 'react';
import * as THREE from 'three';

const GridControls = ({
                          scene,
                          showXZGrid = true,
                          showXYGrid = false,
                          showYZGrid = false,
                          gridDivisions = 20,
                          xzGridColor = '#CFCFCF',
                          xyGridColor = '#8BC34A',
                          yzGridColor = '#2196F3',
                          onToggleXZGrid,
                          onToggleXYGrid,
                          onToggleYZGrid,
                          onGridDivisionsChange,
                          onXZGridColorChange,
                          onXYGridColorChange,
                          onYZGridColorChange
                      }) => {
    // Refs for the grid objects
    const xzGridRef = React.useRef(null);
    const xyGridRef = React.useRef(null);
    const yzGridRef = React.useRef(null);

    const createGrids = useCallback(() => {
        if (!scene) return;

        // Remove existing grids
        if (xzGridRef.current) scene.remove(xzGridRef.current);
        if (xyGridRef.current) scene.remove(xyGridRef.current);
        if (yzGridRef.current) scene.remove(yzGridRef.current);

        const gridSize = 10;

        // XZ Grid (floor)
        const xzGrid = new THREE.GridHelper(gridSize, gridDivisions, new THREE.Color(xzGridColor), new THREE.Color(xzGridColor));
        xzGrid.position.y = 0;
        xzGrid.visible = showXZGrid;
        scene.add(xzGrid);
        xzGridRef.current = xzGrid;

        // XY Grid (front)
        const xyGrid = new THREE.GridHelper(gridSize, gridDivisions, new THREE.Color(xyGridColor), new THREE.Color(xyGridColor));
        xyGrid.rotation.x = Math.PI / 2; // Rotate to make vertical
        xyGrid.position.z = 0;
        xyGrid.visible = showXYGrid;
        scene.add(xyGrid);
        xyGridRef.current = xyGrid;

        // YZ Grid (side)
        const yzGrid = new THREE.GridHelper(gridSize, gridDivisions, new THREE.Color(yzGridColor), new THREE.Color(yzGridColor));
        yzGrid.rotation.z = Math.PI / 2; // Rotate to make vertical
        yzGrid.position.x = 0;
        yzGrid.visible = showYZGrid;
        scene.add(yzGrid);
        yzGridRef.current = yzGrid;
    }, [scene, gridDivisions, xzGridColor, xyGridColor, yzGridColor, showXZGrid, showXYGrid, showYZGrid]);

    // Effect to update grid visibility
    useEffect(() => {
        if (xzGridRef.current) xzGridRef.current.visible = showXZGrid;
        if (xyGridRef.current) xyGridRef.current.visible = showXYGrid;
        if (yzGridRef.current) yzGridRef.current.visible = showYZGrid;
    }, [showXZGrid, showXYGrid, showYZGrid]);

    // Effect to recreate grids when divisions or color changes
    useEffect(() => {
        createGrids();
    }, [createGrids]);

    // Cleanup function to remove grids when component unmounts
    useEffect(() => {
        return () => {
            if (scene) {
                if (xzGridRef.current) scene.remove(xzGridRef.current);
                if (xyGridRef.current) scene.remove(xyGridRef.current);
                if (yzGridRef.current) scene.remove(yzGridRef.current);
            }
        };
    }, [scene]);

    return (
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'white' }}>Grid Settings</h3>

            {/* Grid toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                        <input
                            type="checkbox"
                            checked={showXZGrid}
                            onChange={onToggleXZGrid}
                            style={{ marginRight: '8px' }}
                        />
                        XZ Grid (Floor)
                    </label>
                    <input
                        type="color"
                        value={xzGridColor}
                        onChange={(e) => onXZGridColorChange(e.target.value)}
                        style={{ width: '24px', height: '24px' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                        <input
                            type="checkbox"
                            checked={showXYGrid}
                            onChange={onToggleXYGrid}
                            style={{ marginRight: '8px' }}
                        />
                        XY Grid (Front)
                    </label>
                    <input
                        type="color"
                        value={xyGridColor}
                        onChange={(e) => onXYGridColorChange(e.target.value)}
                        style={{ width: '24px', height: '24px' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                        <input
                            type="checkbox"
                            checked={showYZGrid}
                            onChange={onToggleYZGrid}
                            style={{ marginRight: '8px' }}
                        />
                        YZ Grid (Side)
                    </label>
                    <input
                        type="color"
                        value={yzGridColor}
                        onChange={(e) => onYZGridColorChange(e.target.value)}
                        style={{ width: '24px', height: '24px' }}
                    />
                </div>
            </div>

            {/* Grid density/divisions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: 'white', fontSize: '12px' }}>
                    Grid Divisions: {gridDivisions}
                </label>
                <input
                    type="range"
                    min="2"
                    max="200"
                    step="2"
                    value={gridDivisions}
                    onChange={(e) => onGridDivisionsChange(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    );
};

export default GridControls;