import React, { useState } from 'react';
import SVGExporter from './SVGExporter.js';

const SVGExportControls = ({ scene, renderer, currentCamera, modelName = "model" }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [wireframeExport, setWireframeExport] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(0.5);
    const [includeBg, setIncludeBg] = useState(true);

    const handleExport = () => {
        if (!scene || !renderer || !currentCamera || isExporting) return;

        setIsExporting(true);

        try {
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
            const filename = `${modelName}-${timestamp}.svg`;

            // Get export options
            const options = {
                width: renderer.domElement.width,
                height: renderer.domElement.height,
                wireframe: wireframeExport,
                strokeColor,
                strokeWidth,
                includeBackground: includeBg
            };

            // Generate SVG and trigger download
            const svgContent = SVGExporter.exportToSVG(scene, currentCamera, renderer, options);
            SVGExporter.downloadSVG(svgContent, filename);

        } catch (error) {
            console.error("SVG export failed:", error);
            alert("Failed to export SVG. See console for details.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="svg-export-controls" style={{
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            marginBottom: '8px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    color: 'white',
                    fontWeight: 500
                }}>
                    SVG Export
                </h3>

                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        opacity: 0.8
                    }}
                >
                    {showAdvanced ? 'Hide Options' : 'Show Options'}
                </button>
            </div>

            {showAdvanced && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ color: 'white', fontSize: '14px' }}>
                            <input
                                type="checkbox"
                                checked={wireframeExport}
                                onChange={(e) => setWireframeExport(e.target.checked)}
                            />
                            Wireframe
                        </label>

                        <label style={{ color: 'white', fontSize: '14px' }}>
                            <input
                                type="checkbox"
                                checked={includeBg}
                                onChange={(e) => setIncludeBg(e.target.checked)}
                            />
                            Background
                        </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Stroke:
                            <input
                                type="color"
                                value={strokeColor}
                                onChange={(e) => setStrokeColor(e.target.value)}
                                style={{ width: '24px', height: '24px' }}
                            />
                        </label>

                        <label style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Width:
                            <input
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.1"
                                value={strokeWidth}
                                onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                                style={{ width: '80px' }}
                            />
                            <span>{strokeWidth}</span>
                        </label>
                    </div>
                </div>
            )}

            <button
                onClick={handleExport}
                disabled={isExporting}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    backgroundColor: isExporting ? 'rgba(100, 100, 100, 0.7)' : 'rgba(66, 135, 245, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    width: '100%',
                    fontSize: '14px',
                    gap: '8px'
                }}
            >
                {isExporting ? (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" opacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 12 12"
                                    to="360 12 12"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </path>
                        </svg>
                        Exporting...
                    </>
                ) : (
                    <>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export as SVG
                    </>
                )}
            </button>
        </div>
    );
};

export default SVGExportControls;