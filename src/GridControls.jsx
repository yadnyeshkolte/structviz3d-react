import React from 'react';

const GridControls = ({
                          showXZGrid,
                          showXYGrid,
                          showYZGrid,
                          gridDivisions,
                          gridColor,
                          onToggleXZGrid,
                          onToggleXYGrid,
                          onToggleYZGrid,
                          onGridDivisionsChange,
                          onGridColorChange
                      }) => {
    return (
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'white' }}>Grid Settings</h3>

            {/* Grid toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                    <input
                        type="checkbox"
                        checked={showXZGrid}
                        onChange={onToggleXZGrid}
                        style={{ marginRight: '8px' }}
                    />
                    XZ Grid (Floor)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                    <input
                        type="checkbox"
                        checked={showXYGrid}
                        onChange={onToggleXYGrid}
                        style={{ marginRight: '8px' }}
                    />
                    XY Grid (Front)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                    <input
                        type="checkbox"
                        checked={showYZGrid}
                        onChange={onToggleYZGrid}
                        style={{ marginRight: '8px' }}
                    />
                    YZ Grid (Side)
                </label>
            </div>

            {/* Grid density/divisions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: 'white', fontSize: '12px' }}>
                    Grid Divisions: {gridDivisions}
                </label>
                <input
                    type="range"
                    min="5"
                    max="100"
                    value={gridDivisions}
                    onChange={(e) => onGridDivisionsChange(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Grid color */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ color: 'white', fontSize: '12px' }}>Grid Color:</label>
                <input
                    type="color"
                    value={gridColor}
                    onChange={(e) => onGridColorChange(e.target.value)}
                    style={{ width: '24px', height: '24px' }}
                />
            </div>
        </div>
    );
};

export default GridControls;