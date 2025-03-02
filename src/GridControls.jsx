import React from 'react';

const GridControls = ({
                          showXZGrid,
                          showXYGrid,
                          showYZGrid,
                          gridDivisions,
                          xzGridColor,
                          xyGridColor,
                          yzGridColor,
                          onToggleXZGrid,
                          onToggleXYGrid,
                          onToggleYZGrid,
                          onGridDivisionsChange,
                          onXZGridColorChange,
                          onXYGridColorChange,
                          onYZGridColorChange
                      }) => {
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
                    min="5"
                    max="100"
                    value={gridDivisions}
                    onChange={(e) => onGridDivisionsChange(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    );
};

export default GridControls;