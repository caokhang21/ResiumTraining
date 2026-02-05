# React + Resium Project

This project demonstrates a React application with Resium (React components for CesiumJS) to display an interactive 3D globe.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

## 📦 What's Included

- **React 19** - Latest React framework
- **Vite** - Fast build tool and dev server
- **Resium 1.19.3** - React components for CesiumJS
- **CesiumJS 1.138.0** - 3D globe and map engine
- **vite-plugin-cesium** - Vite plugin for CesiumJS asset handling

## 🗂️ Project Structure

```
ResiumTraining/
├── src/
│   ├── App.jsx          # Main Cesium Viewer component
│   ├── App.css          # Minimal styles for full viewport
│   ├── index.css        # Global styles
│   └── main.jsx         # React entry point
├── vite.config.js       # Vite configuration with Cesium plugin
└── package.json         # Project dependencies
```

## 🌍 Features

- Full-screen 3D globe viewer
- Interactive Earth visualization
- Clean UI with minimal controls
- Fast development with Vite HMR

## 🔧 Configuration

### Cesium Ion Access Token (Optional)

To access premium Cesium Ion assets, you can add your access token in `src/App.jsx`:

```javascript
import { Ion } from 'cesium';

Ion.defaultAccessToken = 'YOUR_ACCESS_TOKEN_HERE';
```

Get a free token at [https://cesium.com/ion/signup](https://cesium.com/ion/signup)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

The Viewer component in `App.jsx` has many customization options. You can enable/disable UI controls:

```javascript
<Viewer
	full
	timeline={true} // Show timeline
	animation={true} // Show animation controls
	homeButton={true} // Show home button
	geocoder={true} // Show search
	sceneModePicker={true} // Show 2D/3D toggle
	baseLayerPicker={true} // Show imagery selector
/>
```

## 📚 Learn More

- [Resium Documentation](https://resium.reearth.io/)
- [CesiumJS Documentation](https://cesium.com/learn/cesiumjs-learn/)
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
