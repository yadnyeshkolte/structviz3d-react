import React, { useState } from 'react';
import './App.css';
import FileUpload from './FileUpload';
import ModelViewer from './ModelViewer';
import { Upload, LayoutTemplate, ChevronDown } from 'lucide-react';

function App() {
    const [modelUrl, setModelUrl] = useState(null);
    const [binUrl, setBinUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showUploadScreen, setShowUploadScreen] = useState(true);
    const [showSampleDropdown, setShowSampleDropdown] = useState(false);

    const sampleModels = [
        { name: 'Crane', file: 'crane.stl' },
        { name: 'House', file: 'house.stl' },
        { name: 'Pantheon', file: 'pantheon.stl' },
        { name: 'Modern Villa', file: 'modernvilla.stl' },
        { name: 'Torre Latinoamericana', file: 'torrelatinoamericana.stl' },
        { name: 'Burj Khalifa', file: 'burjkhalifa.stl' },
        { name: 'Luffing Crane', file: 'luffingcrane.stl' },
        { name: 'Transformer', file: 'transformer.stl' }
    ];

    const handleModelLoad = (data) => {
        setIsLoading(true);

        const apiBaseUrl = import.meta.env.VITE_APP_API_URL || '';
        const modelUrl = `${apiBaseUrl}${data.download_url}`;
        const binUrl = data.bin_url ? `${apiBaseUrl}${data.bin_url}` : null;

        setModelUrl(modelUrl);
        setBinUrl(binUrl);
        setShowUploadScreen(false);
    };

    const handleSampleModel = (fileName) => {
        setIsLoading(true);
        setModelUrl(`https://raw.githubusercontent.com/yadnyeshkolte/structviz3d-react/stlfiles/${fileName}`);
        setBinUrl(null);
        setShowUploadScreen(false);
        setShowSampleDropdown(false);
    };

    const toggleSampleDropdown = () => {
        setShowSampleDropdown(!showSampleDropdown);
    };

    const handleNewUpload = () => {
        // Clear the cached model
        setModelUrl(null);
        setBinUrl(null);
        setShowUploadScreen(true);
    };

    return (
        <div className="App">
            {showUploadScreen ? (
                <div className="upload-screen">
                    <div className="upload-content">
                        <header className="App-header">
                            <h1>StructViz3D</h1>
                            <p>Upload and view your structural engineering models in 3D</p>
                        </header>

                        <div className="options-container">
                            <div className="option-card">
                                <div className="option-icon">
                                    <LayoutTemplate size={48} />
                                </div>
                                <h2>Try Sample Models</h2>
                                <p>Test the viewer with pre-loaded models</p>
                                <div className="sample-selector">
                                    <button
                                        className="sample-dropdown-button"
                                        onClick={toggleSampleDropdown}
                                    >
                                        Select a Model <ChevronDown size={16} />
                                    </button>
                                    {showSampleDropdown && (
                                        <div className="sample-dropdown-menu">
                                            {sampleModels.map((model) => (
                                                <div
                                                    key={model.file}
                                                    className="sample-dropdown-item"
                                                    onClick={() => handleSampleModel(model.file)}
                                                >
                                                    {model.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="option-card">
                                <div className="option-icon">
                                    <Upload size={48} />
                                </div>
                                <h2>Upload Your Model</h2>
                                <p>Upload your own STL file to view in 3D</p>
                                <div className="upload-section">
                                    <FileUpload onModelLoad={handleModelLoad} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="viewer-screen">
                    <div className="new-upload-button">
                        <button onClick={handleNewUpload} className="back-button" title="Upload new model">
                            <Upload size={20} />
                            <span>New Upload</span>
                        </button>
                    </div>

                    <div className="fullscreen-viewer">
                        <ModelViewer
                            modelUrl={modelUrl}
                            binUrl={binUrl}
                            onLoad={() => setIsLoading(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;