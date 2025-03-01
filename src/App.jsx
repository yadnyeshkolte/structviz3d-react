import React, { useState } from 'react';
import './App.css';
import FileUpload from './FileUpload';
import ModelViewer from './ModelViewer';

function App() {
    const [modelUrl, setModelUrl] = useState(null);
    const [binUrl, setBinUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleModelLoad = (data) => {
        setIsLoading(true);

        const apiBaseUrl = import.meta.env.VITE_APP_API_URL || '';
        const modelUrl = `${apiBaseUrl}${data.download_url}`;
        const binUrl = data.bin_url ? `${apiBaseUrl}${data.bin_url}` : null;

        setModelUrl(modelUrl);
        setBinUrl(binUrl);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>StructViz3D</h1>
                <p>Upload and view your structural engineering models in 3D</p>
            </header>

            <main className="App-main">
                <div className="upload-section">
                    <FileUpload onModelLoad={handleModelLoad} />
                </div>

                <div className="viewer-section">
                    {modelUrl ? (
                        <ModelViewer
                            modelUrl={modelUrl}
                            binUrl={binUrl}
                            onLoad={() => setIsLoading(false)}
                        />
                    ) : (
                        <div className="viewer-placeholder">
                            <p>Upload an STL file to view the 3D model</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="App-footer">
                <p>StructViz3D &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}

export default App;