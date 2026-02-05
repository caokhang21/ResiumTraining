import { CameraFlyTo, Viewer } from 'resium';
import { Cartesian3, Ion } from 'cesium';
import './App.css';
import { XmlStructureLoader } from './components/XmlStructureLoader';

Ion.defaultAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZTc0YmU5Ny1hODk1LTQ0ZTMtYjMzNS03ODQyMjE3NWRkOTciLCJpZCI6Mzg3MTYzLCJpYXQiOjE3NzAyNTY5OTh9.UMn_i42e3OxVGJ59MfsSEEcrXR4NA9qz0aQp92eQAB8';

function App() {
	return (
		<div style={{ width: '100vw', height: '10vh' }}>
			<Viewer
				full
				timeline={true}
				animation={true}
				homeButton={true}
				geocoder={true}
				sceneModePicker={true}
				baseLayerPicker={true}
				navigationHelpButton={true}
				infoBox={true}
				selectionIndicator={true}
			>
				<XmlStructureLoader />
				<CameraFlyTo destination={Cartesian3.fromDegrees(-93.6205, 42.0186, 310)} />
			</Viewer>
		</div>
	);
}

export default App;
