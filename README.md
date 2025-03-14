# StructViz3D

## 3D Structural Engineering Model Viewer

StructViz3D is a web-based application for visualizing and interacting with 3D structural engineering models. It provides engineers, architects, and designers with a powerful tool to view, analyze, and manipulate STL and GLTF files directly in the browser.

https://youtu.be/8gEaS0dXfAg

![StructViz3D Screenshot](https://github.com/user-attachments/assets/6f509d6e-e994-4cdc-a0e9-497cc2f34722)

## 🔍 Features

- **High-Performance 3D Rendering**: Built on Three.js for smooth, hardware-accelerated 3D visualization
- **Multiple File Format Support**: Load and visualize STL and GLTF/GLB files
- **Advanced Camera Controls**:
  - Orthographic and perspective camera modes
  - Zoom, pan, and orbit functionality
  - Precise model focusing
- **Comprehensive Viewing Options**:
  - Customizable model colors
  - Wireframe visualization mode
  - Enhanced pencil-sketch rendering
  - Multiple grid planes (XZ, XY, YZ) with customizable colors and divisions
- **Flexible Lighting System**: Adjust lighting to enhance model visibility and detail
- **Model Orientation Controls**: Easily reset and adjust model orientation
- **Fullscreen Mode**: Maximize your workspace for detailed inspection
- **Keyboard Shortcuts**: Streamline your workflow with convenient shortcuts
- **Responsive Design**: Works on desktop and mobile devices
- **Drag Mode**: Toggle between rotation and pan modes for intuitive model manipulation

## 💻 Live Demo

Visit the live application: [https://yadnyeshkolte.github.io/structviz3d-react/](https://yadnyeshkolte.github.io/structviz3d-react/)

## 🏗️ Architecture

StructViz3D consists of two main components:

1. **Frontend**: React-based web application with Three.js for 3D rendering
2. **Backend API**: Python-based service for file processing and model optimization

The frontend is deployed on GitHub Pages, while the backend API is hosted on Render.com.

## 🚀 Getting Started

### Using the Live Application

1. Visit [https://yadnyeshkolte.github.io/structviz3d-react/](https://yadnyeshkolte.github.io/structviz3d-react/)
2. Choose "Try Sample Model" to explore the application with a pre-loaded model
3. Or select "Upload Your Model" to visualize your own STL or GLTF/GLB files

### Running Locally

#### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/structviz3d.git
   cd structviz3d
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🔧 API Configuration

By default, the application connects to the backend API deployed on Render.com. To use a different API endpoint:

1. Create a `.env` file in the project root directory
2. Add the following line:
   ```
   VITE_APP_API_URL=https://your-api-endpoint.com
   ```

## 📚 Usage Guide

### Basic Controls

- **Left Mouse Button**: Rotate model (default) or pan (in drag mode)
- **Right Mouse Button**: Pan the camera
- **Mouse Wheel**: Zoom in/out
- **Double Click**: Focus on a specific part of the model

### Viewer Controls

- **Color Selector**: Change the model's color
- **Camera Controls**: Switch between perspective and orthographic views
- **View Controls**: Set standard views (top, front, side, etc.)
- **Grid Controls**: Toggle and customize grid planes
- **Orientation Controls**: Reset and adjust model orientation
- **Wireframe Controls**: Toggle wireframe visualization modes
- **Lighting Controls**: Adjust scene lighting

### Keyboard Shortcuts

- Press keyboard button to view all available keyboard shortcuts

## 👨‍💻 API Repository

The backend API code is available in a separate repository:
[https://github.com/yourusername/structviz3d-api](https://github.com/yadnyeshkolte/structviz3d-api)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
