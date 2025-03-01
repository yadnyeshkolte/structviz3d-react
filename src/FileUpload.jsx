import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUpload = ({ onModelLoad }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        // Reset states
        setError(null);
        setUploading(true);
        setUploadProgress(0);

        // Check if file is an STL
        const file = acceptedFiles[0];
        if (!file.name.toLowerCase().endsWith('.stl')) {
            setError('Please upload an STL file');
            setUploading(false);
            return;
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = import.meta.env.VITE_APP_API_URL || '';  // Changed from REACT_APP_API_URL to VITE_APP_API_URL
            const response = await axios.post(
                `${apiUrl}/api/convert-stl`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    },
                }
            );

            // Call the parent component's handler with the response data
            onModelLoad(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [onModelLoad]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="upload-container">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                        <p>Uploading: {uploadProgress}%</p>
                    </div>
                ) : (
                    <div className="upload-content">
                        <div className="upload-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                            </svg>
                        </div>
                        <p className="upload-text">
                            {isDragActive
                                ? 'Drop your STL file here'
                                : 'Drag & drop your STL file here, or click to select'}
                        </p>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;