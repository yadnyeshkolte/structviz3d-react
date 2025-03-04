// SVG export utility for Three.js scenes
import * as THREE from 'three';

const SVGExporter = {
    /**
     * Exports the current view of a Three.js scene to SVG
     * @param {THREE.Scene} scene - The scene to export
     * @param {THREE.Camera} camera - The current camera
     * @param {THREE.WebGLRenderer} renderer - The renderer
     * @param {Object} options - Export options
     * @param {number} options.width - Width of the SVG (default: renderer width)
     * @param {number} options.height - Height of the SVG (default: renderer height)
     * @param {boolean} options.includeBackground - Include scene background (default: true)
     * @param {boolean} options.wireframe - Render as wireframe (default: false)
     * @param {string} options.strokeColor - Stroke color for wireframe (default: "black")
     * @param {number} options.strokeWidth - Stroke width for wireframe (default: 0.5)
     * @returns {string} - SVG content as a string
     */
    exportToSVG: (scene, camera, renderer, options = {}) => {
        const width = options.width || renderer.domElement.width;
        const height = options.height || renderer.domElement.height;
        const includeBackground = options.includeBackground !== false;
        const wireframe = options.wireframe || false;
        const strokeColor = options.strokeColor || "black";
        const strokeWidth = options.strokeWidth || 0.5;

        // Create SVG container
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

        // Add background if requested
        if (includeBackground && scene.background) {
            const bgColor = scene.background.isColor
                ? `#${scene.background.getHexString()}`
                : "#ffffff";
            svg += `<rect width="${width}" height="${height}" fill="${bgColor}" />`;
        }

        // Project visible objects to 2D
        const objects = [];
        scene.traverse((object) => {
            if (object.isMesh && object.visible) {
                objects.push(object);
            }
        });

        // Sort objects by distance from camera (painters algorithm)
        objects.sort((a, b) => {
            const posA = new THREE.Vector3();
            const posB = new THREE.Vector3();

            a.getWorldPosition(posA);
            b.getWorldPosition(posB);

            return camera.position.distanceTo(posB) - camera.position.distanceTo(posA);
        });

        // Process each object
        for (const object of objects) {
            let pathData = "";

            // Clone the geometry to avoid modifying the original
            const geometry = object.geometry.clone();

            // Apply object transformations to the geometry
            geometry.applyMatrix4(object.matrixWorld);

            // Get material color or use default
            let fillColor = "#cccccc";
            if (object.material) {
                if (object.material.color) {
                    fillColor = `#${object.material.color.getHexString()}`;
                }
            }

            // For wireframe mode, we need edges
            if (wireframe) {
                // Convert the geometry to an EdgesGeometry to get the wireframe
                const edges = new THREE.EdgesGeometry(geometry);
                const positions = edges.attributes.position.array;

                // Process each line segment
                for (let i = 0; i < positions.length; i += 6) {
                    const start = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
                    const end = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);

                    // Project to 2D
                    const startProj = SVGExporter.projectToScreen(start, camera, width, height);
                    const endProj = SVGExporter.projectToScreen(end, camera, width, height);

                    // Add to path data if both points are in view
                    if (startProj && endProj) {
                        pathData += `M${startProj.x},${startProj.y} L${endProj.x},${endProj.y} `;
                    }
                }

                if (pathData) {
                    svg += `<path d="${pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" />`;
                }
            } else {
                // For solid mode, we need to process triangles
                if (geometry.index !== null) {
                    const position = geometry.attributes.position;
                    const indices = geometry.index.array;

                    for (let i = 0; i < indices.length; i += 3) {
                        const a = indices[i];
                        const b = indices[i + 1];
                        const c = indices[i + 2];

                        const vA = new THREE.Vector3().fromBufferAttribute(position, a);
                        const vB = new THREE.Vector3().fromBufferAttribute(position, b);
                        const vC = new THREE.Vector3().fromBufferAttribute(position, c);

                        // Create a triangle face
                        const projA = SVGExporter.projectToScreen(vA, camera, width, height);
                        const projB = SVGExporter.projectToScreen(vB, camera, width, height);
                        const projC = SVGExporter.projectToScreen(vC, camera, width, height);

                        // Only add if all points are in view
                        if (projA && projB && projC) {
                            // Compute face normal to check if it's facing the camera
                            const normal = new THREE.Vector3();
                            normal.crossVectors(
                                new THREE.Vector3().subVectors(vB, vA),
                                new THREE.Vector3().subVectors(vC, vA)
                            ).normalize();

                            // Get the direction to the camera
                            const cameraDirection = new THREE.Vector3();
                            cameraDirection.subVectors(camera.position, vA).normalize();

                            // Only render if the face is facing the camera
                            if (normal.dot(cameraDirection) > 0) {
                                svg += `<polygon points="${projA.x},${projA.y} ${projB.x},${projB.y} ${projC.x},${projC.y}" 
                  fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
                            }
                        }
                    }
                }
            }

            // Clean up temporary geometry
            geometry.dispose();
        }

        // Close SVG tag
        svg += "</svg>";

        return svg;
    },

    /**
     * Projects a 3D point to screen space
     * @param {THREE.Vector3} point - 3D point
     * @param {THREE.Camera} camera - Camera
     * @param {number} width - Screen width
     * @param {number} height - Screen height
     * @returns {Object|null} - {x, y} screen coordinates or null if out of view
     */
    projectToScreen: (point, camera, width, height) => {
        const vector = point.clone();

        // Project to NDC space (-1 to +1)
        vector.project(camera);

        // Check if the point is in view
        if (vector.z > 1 || vector.z < -1 ||
            vector.x < -1 || vector.x > 1 ||
            vector.y < -1 || vector.y > 1) {
            return null;
        }

        // Convert to screen coordinates
        const x = (vector.x + 1) / 2 * width;
        const y = (-vector.y + 1) / 2 * height;

        return { x, y };
    },

    /**
     * Triggers a download of the SVG content
     * @param {string} svgContent - SVG content as a string
     * @param {string} filename - Download filename
     */
    downloadSVG: (svgContent, filename = "model-export.svg") => {
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
};

export default SVGExporter;