import React, { useEffect, useState } from 'react';

// Screen scaling settings
const SCALING_CONFIG = {
    '1366x768': 0.67,  // 67% scale for 1366x768
    '1600x900': 0.75,  // 75% scale for 1600x900
    '1920x1080': 1.0   // 100% scale (default) for 1920x1080
};

const ScalingWrapper = ({ children }) => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        // Function to determine the appropriate scale based on screen resolution
        const determineScale = () => {
            const width = window.screen.width;
            const height = window.screen.height;
            const resolution = `${width}x${height}`;

            // Check if the exact resolution exists in our config
            if (SCALING_CONFIG[resolution]) {
                return SCALING_CONFIG[resolution];
            }

            // If no exact match, use the closest resolution based on width
            if (width <= 1366) return 0.67;
            if (width <= 1600) return 0.75;
            if (width <= 1920) return 1.0;

            // For larger screens, you might want to scale up
            if (width > 1920) return 1.0; // Or any other scaling factor for larger screens

            // Default fallback
            return 1.0;
        };

        // Set the scale based on the current screen resolution
        setScale(determineScale());

        // Add resize event listener to handle window resizing
        const handleResize = () => {
            setScale(determineScale());
        };

        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Apply the scaling transformation to the entire app
    const scalingStyle = {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,  // Compensate for the scaling to prevent horizontal scrollbars
        height: `${100 / scale}%`, // Adjust height to prevent vertical scrollbars
        overflow: 'hidden'
    };

    return (
        <div style={scalingStyle}>
            {children}
        </div>
    );
};

export default ScalingWrapper;