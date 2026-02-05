import { useEffect, useState } from 'react';
import { Entity, Label } from 'resium';
import { Cartesian3, Color, PolygonHierarchy } from 'cesium';
import * as Cesium from 'cesium';

export function XmlStructureLoader() {
	const [entities, setEntities] = useState([]);
	const [lineLabels, setLineLabels] = useState([]);
	const [selectedEntityId, setSelectedEntityId] = useState(null);

	useEffect(() => {
		loadXmlStructure('/squaw_creek_container_info.xml');
	}, []);

	const calculatePerimeter = (positions) => {
		if (!positions || positions.length < 2) return 0;

		let perimeter = 0;
		for (let i = 0; i < positions.length; i++) {
			const p1 = positions[i];
			const p2 = positions[(i + 1) % positions.length];
			perimeter += Cartesian3.distance(p1, p2);
		}
		return perimeter;
	};

	const calculateArea = (positions) => {
		if (!positions || positions.length < 3) return 0;

		let totalArea = 0;
		const p0 = positions[0];

		for (let i = 1; i < positions.length - 1; i++) {
			const v1 = Cesium.Cartesian3.subtract(positions[i], p0, new Cesium.Cartesian3());
			const v2 = Cesium.Cartesian3.subtract(positions[i + 1], p0, new Cesium.Cartesian3());
			const cross = Cesium.Cartesian3.cross(v1, v2, new Cesium.Cartesian3());
			totalArea += Cesium.Cartesian3.magnitude(cross);
		}

		return totalArea * 0.5;
	};

	const loadXmlStructure = async (url) => {
		try {
			const response = await fetch(url);
			const xmlText = await response.text();

			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

			const { entities: parsedEntities, lineLabels: parsedLineLabels } = parseXmlStructure(xmlDoc);
			setEntities(parsedEntities);
			setLineLabels(parsedLineLabels);
		} catch (err) {
			console.error('Error loading XML structure:', err);
		}
	};

	const parseXmlStructure = (xmlDoc) => {
		const entities = [];
		const lineLabels = [];

		const roofs = xmlDoc.getElementsByTagName('ROOF');

		if (roofs.length === 0) {
			console.warn('No ROOF element found in XML');
			return { entities, lineLabels };
		}

		const roof = roofs[0];

		const pointsMap = parsePoints(roof);
		const linesMap = parseLines(roof, pointsMap);
		const faces = parseFaces(roof, linesMap);

		faces.forEach((face, index) => {
			const positions = face.hierarchy.positions;
			const perimeter = calculatePerimeter(positions);
			const area = calculateArea(positions);

			const edgeLengths = [];
			for (let i = 0; i < positions.length; i++) {
				const p1 = positions[i];
				const p2 = positions[(i + 1) % positions.length];
				const length = Cartesian3.distance(p1, p2);
				edgeLengths.push(length);
			}

			const description = `
				<div style="font-family: Arial, sans-serif;">
					<table style="width: 100%; border-collapse: collapse;">
						<tr>
							<td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Tên:</td>
							<td style="padding: 8px; border-bottom: 1px solid #ddd;">Face ${index}</td>
						</tr>
						<tr>
							<td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Chu vi:</td>
							<td style="padding: 8px; border-bottom: 1px solid #ddd;">${perimeter.toFixed(2)} m</td>
						</tr>
						<tr>
							<td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Diện tích:</td>
							<td style="padding: 8px; border-bottom: 1px solid #ddd;">${area.toFixed(2)} m²</td>
						</tr>
					</table>
				</div>
			`;

			entities.push({
				id: `face_${index}`,
				name: `Face ${index}`,
				description: description,
				polygon: {
					hierarchy: face.hierarchy,
					material: Color.TURQUOISE.withAlpha(0.8),
					outline: true,
					outlineColor: Color.BLACK,
					outlineWidth: 2,
					perPositionHeight: true,
				},
			});
		});

		// Tạo labels cho các lines
		linesMap.forEach((positions, lineId) => {
			if (positions && positions.length === 2) {
				const midpoint = Cartesian3.midpoint(positions[0], positions[1], new Cartesian3());

				lineLabels.push({
					id: `label_${lineId}`,
					position: midpoint,
					text: `${lineId} - ${midpoint.z.toFixed(2)}`,
				});
			}
		});

		return { entities, lineLabels };
	};

	const parsePoints = (roof) => {
		const pointsMap = new Map();
		const points = roof.getElementsByTagName('POINT');

		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			const id = point.getAttribute('id');
			const data = point.getAttribute('data');

			const [lon, lat, height] = data.split(',').map((v) => parseFloat(v.trim()));

			pointsMap.set(id, Cartesian3.fromDegrees(lon, lat, height));
		}

		return pointsMap;
	};

	const parseLines = (roof, pointsMap) => {
		const linesMap = new Map();
		const lines = roof.getElementsByTagName('LINE');

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const id = line.getAttribute('id');
			const path = line.getAttribute('path');

			const pointIds = path.split(',').map((v) => v.trim());
			const positions = pointIds.map((pointId) => pointsMap.get(pointId));

			linesMap.set(id, positions);
		}

		return linesMap;
	};

	const parseFaces = (roof, linesMap) => {
		const faces = [];
		const faceElements = roof.getElementsByTagName('FACE');

		for (let i = 0; i < faceElements.length; i++) {
			const face = faceElements[i];
			const polygons = face.getElementsByTagName('POLYGON');

			for (let j = 0; j < polygons.length; j++) {
				const polygon = polygons[j];
				const path = polygon.getAttribute('path');

				const lineIds = path.split(',').map((v) => v.trim());

				const positions = [];
				const addedPoints = new Set();

				lineIds.forEach((lineId) => {
					const linePositions = linesMap.get(lineId);
					if (linePositions) {
						linePositions.forEach((pos) => {
							const key = `${pos.x}_${pos.y}_${pos.z}`;
							if (!addedPoints.has(key)) {
								positions.push(pos);
								addedPoints.add(key);
							}
						});
					}
				});

				if (positions.length >= 3) {
					faces.push({
						hierarchy: new PolygonHierarchy(positions),
					});
				}
			}
		}
		console.log(faces);
		return faces;
	};

	return (
		<>
			{entities.map((entityData) => (
				<Entity
					key={entityData.id}
					{...entityData}
					polygon={{
						...entityData.polygon,
						material:
							selectedEntityId === entityData.id
								? Color.RED.withAlpha(0.8)
								: entityData.polygon.material,
					}}
					onClick={() => {
						setSelectedEntityId(entityData.id);
					}}
				/>
			))}

			{lineLabels.map((labelData) => (
				<Entity
					key={labelData.id}
					position={labelData.position}
					label={{
						text: labelData.text,
						font: '20px',
						fillColor: Color.YELLOW,
						outlineWidth: 2,
						pixelOffset: new Cesium.Cartesian2(0, -10),
					}}
				/>
			))}
		</>
	);
}
