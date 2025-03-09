"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { CylinderGeometry } from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

interface Location {
	city: string;
	coordinates: [number, number];
}

const DRAG_THRESHOLD = 3; // Minimum pixels of movement before initiating drag

interface GlobeMeshProps {
	position?: [number, number, number];
	scale?: number;
	onLocationUpdate: (location: Location | null) => void;
	onCoordinateUpdate: (coords: { lat: number; long: number }) => void;
	onDataUpdate?: (points: Array<[number, number]>) => void;
}

function formatCoordinates(lat: number, long: number): string {
	return `${lat.toFixed(4)}°${lat >= 0 ? "N" : "S"}, ${long.toFixed(4)}°${
		long >= 0 ? "E" : "W"
	}`;
}

// Add this custom marker component before GlobeMesh
function LocationMarker({ position }: { position: [number, number, number] }) {
	const markerGeometry = useMemo(() => {
		const geometry = new THREE.BufferGeometry();
		const stemHeight = 0.099; // Reduced from 0.15
		const pinHeadSize = 0.035; // Increased from 0.025
		const stemRadius = 0.003;

		// Create stem (thin cylinder)
		const stem = new CylinderGeometry(stemRadius, stemRadius, stemHeight, 3);
		stem.translate(0, -stemHeight / 2, 0); // Move stem down instead of up

		// Create pin head (sphere)
		const head = new THREE.SphereGeometry(pinHeadSize, 8, 8);
		head.translate(0, -stemHeight, 0); // Move head down instead of up

		// Combine geometries
		geometry.copy(BufferGeometryUtils.mergeGeometries([stem, head]));

		return geometry;
	}, []);

	// Calculate rotation to point inward
	const rotation = useMemo(() => {
		const markerPos = new THREE.Vector3(...position);
		// Removed unused variable 'direction'

		// Create a rotation that aligns with the surface normal and points inward
		const quaternion = new THREE.Quaternion();
		const matrix = new THREE.Matrix4();

		// Point from center toward position (0,0,0)
		const center = new THREE.Vector3(0, 0, 0);
		const up = new THREE.Vector3(0, 1, 0);
		matrix.lookAt(markerPos, center, up);
		quaternion.setFromRotationMatrix(matrix);

		// Add additional rotations to align the marker with the surface
		const rotX = new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(1, 0, 0),
			Math.PI / 2
		);
		const rotZ = new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(0, 0, 1),
			Math.PI
		);
		quaternion.multiply(rotX).multiply(rotZ);

		return new THREE.Euler().setFromQuaternion(quaternion);
	}, [position]);

	return (
		<mesh
			position={position}
			rotation={rotation}>
			<primitive object={markerGeometry} />
			<meshPhongMaterial
				color="#EF4444"
				emissive="#EF4444"
				emissiveIntensity={0.5}
				shininess={50}
			/>
		</mesh>
	);
}

// Add these helper functions at the top of the file

// Replace the CSV processing functions with GeoJSON processing
// Replace the processGeoJSONData function with this improved version
interface GeoJSONFeature {
	type: string;
	geometry: {
		type: string;
		coordinates: number[][][] | number[][][][];
	};
}

interface GeoJSONData {
	features: GeoJSONFeature[];
}

// Update the processGeoJSONData function signature
function processGeoJSONData(data: GeoJSONData): Array<[number, number][]> {
	const processCoordinates = (coords: number[][]): [number, number][] => {
		return coords.map((coord) => [coord[1], coord[0]] as [number, number]);
	};

	let features = data.features.flatMap((feature: GeoJSONFeature) => {
		if (feature.geometry.type === "Polygon") {
			// For Polygon, get the outer ring (first array of coordinates)
			return [
				processCoordinates(feature.geometry.coordinates[0] as number[][]),
			];
		} else if (feature.geometry.type === "MultiPolygon") {
			// For MultiPolygon, get the outer ring of each polygon
			return (feature.geometry.coordinates as number[][][][]).map((poly) =>
				processCoordinates(poly[0])
			);
		}
		return [];
	});

	features = features
		// Further remove small polygons (less than 20 points)
		.filter((points) => points.length >= 20)
		.map((points): [number, number][] => {
			// Close the polygon if not already closed
			if (
				points[0][0] !== points[points.length - 1][0] ||
				points[0][1] !== points[points.length - 1][1]
			) {
				points.push([points[0][0], points[0][1]] as [number, number]);
			}
			return points as [number, number][];
		});

	// Reduce total number of points
	return reducePoints(features);
}

// Add this new function after processGeoJSONData
function reducePoints(
	features: Array<[number, number][]>
): Array<[number, number][]> {
	const mergePointsInRadius = (
		points: [number, number][]
	): [number, number][] => {
		if (points.length <= 5) return points; // Minimum points to keep shape

		const RADIUS = 2; // Reduced from 5 to keep smaller islands visible
		const result: [number, number][] = [];
		const used = new Set<number>();

		// Helper to calculate spherical distance between points
		const distance = (p1: [number, number], p2: [number, number]): number => {
			const [lat1, lon1] = p1.map((d) => (d * Math.PI) / 180);
			const [lat2, lon2] = p2.map((d) => (d * Math.PI) / 180);
			const dLat = lat2 - lat1;
			const dLon = lon2 - lon1;
			const a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(lat1) *
					Math.cos(lat2) *
					Math.sin(dLon / 2) *
					Math.sin(dLon / 2);
			return (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 180) / Math.PI;
		};

		// Process points sequentially
		for (let i = 0; i < points.length; i++) {
			if (used.has(i)) continue;

			// Find all points within radius
			const cluster: [number, number][] = [];
			for (let j = 0; j < points.length; j++) {
				if (!used.has(j) && distance(points[i], points[j]) <= RADIUS) {
					cluster.push(points[j]);
					used.add(j);
				}
			}

			// Merge cluster into a single point by averaging
			if (cluster.length > 0) {
				const merged: [number, number] = [
					cluster.reduce((sum, p) => sum + p[0], 0) / cluster.length,
					cluster.reduce((sum, p) => sum + p[1], 0) / cluster.length,
				];
				result.push(merged);
			}
		}

		// Ensure first and last points match if they did originally
		if (
			points[0][0] === points[points.length - 1][0] &&
			points[0][1] === points[points.length - 1][1]
		) {
			result.push([...result[0]]);
		}

		return result;
	};

	// Process each feature independently
	return features.map((points) => mergePointsInRadius(points));
}

function GlobeMesh({
	position,
	onLocationUpdate,
	onCoordinateUpdate,
}: GlobeMeshProps) {
	const meshRef = useRef<THREE.Mesh>(null!);
	const [focusedLocation, setFocusedLocation] = useState<Location | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [, setCurrentCoordinates] = useState({
		lat: 0,
		long: 0,
	});
	const [hovered, setHovered] = useState(false);

	// Add ref for original positions
	const originalPositionsRef = useRef<Float32Array | null>(null);

	// Add interface and state for multiple ripples
	interface Ripple {
		center: THREE.Vector3;
		startTime: number;
		strength: number;
	}

	const [ripples, setRipples] = useState<Ripple[]>([]);
	const sphereRef = useRef<THREE.BufferGeometry>(null!);
	const basePositions = useRef<Float32Array | null>(null);

	const getRandomSpherePoint = () => {
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(2 * Math.random() - 1);
		return new THREE.Vector3(
			Math.sin(phi) * Math.cos(theta),
			Math.sin(phi) * Math.sin(theta),
			Math.cos(phi)
		);
	};

	const {
		scale: glowScale,
		color,
		emissiveIntensity,
	} = useSpring<{
		scale: number;
		color: string;
		emissiveIntensity: number;
	}>({
		scale: hovered ? 1.02 : 1,
		color: hovered ? "#B366F8" : "#A855F7",
		emissiveIntensity: hovered ? 0.6 : 0.4,
		distortionScale: 0,
		config: { tension: 300, friction: 10 },
	});

	// Global event listeners for drag
	const dragStartRef = useRef<{ x: number; y: number } | null>(null);
	const dragState = useRef({
		isDragging: false,
		lastPosition: { x: 0, y: 0 },
		rotation: { x: 0, y: 0 }, // Changed from Math.PI to 0
		momentum: { x: 0, y: 0 },
		targetRotation: null as { x: number; y: number } | null,
	});

	// Move calculateGlobePosition before it's used
	const calculateGlobePosition = (
		lat: number,
		long: number,
		elevation: number = 0
	): [number, number, number] => {
		const latRad = (lat * Math.PI) / 180;
		const longRad = (-long * Math.PI) / 180; // Add negative sign here
		const radius = 1.015 + elevation;
		const pos = new THREE.Vector3(
			radius * Math.cos(latRad) * Math.cos(longRad),
			radius * Math.sin(latRad),
			radius * Math.cos(latRad) * Math.sin(longRad)
		);
		return [pos.x, pos.y, pos.z];
	};

	// Add continent outlines data
	const [continentPaths, setContinentPaths] = useState<
		Array<{
			points: [number, number][];
			elevation: number;
		}>
	>([]);

	const [, setAllPoints] = useState<Array<[number, number]>>([]);

	useEffect(() => {
		async function loadContinentData() {
			try {
				const response = await fetch("/ne_110m_land.json");
				const data: GeoJSONData = await response.json();
				const processedContinents = processGeoJSONData(data); // Changed from processCSVData

				const paths = processedContinents.map((points) => ({
					points,
					elevation: 0.065 + Math.random() * 0.02,
				}));

				setContinentPaths(paths);
				setAllPoints(processedContinents.flatMap((continent) => continent));
			} catch (error: unknown) {
				console.error(
					"Failed to load GeoJSON data:",
					error instanceof Error ? error.message : error
				);
				setContinentPaths([]);
				setAllPoints([]);
			}
		}

		loadContinentData();
	}, []);
	const continentGeometry = useMemo(() => {
		const outlineGeometry = new THREE.BufferGeometry();
		const outlineVertices: number[] = [];

		// Create outline vertices for each continent
		continentPaths.forEach(({ points }) => {
			// For each point in the continent, create a line segment to the next point
			for (let i = 0; i < points.length; i++) {
				const next = (i + 1) % points.length;

				// Calculate current and next vertex positions
				const curr = calculateGlobePosition(points[i][0], points[i][1], 0);
				const nextVert = calculateGlobePosition(
					points[next][0],
					points[next][1],
					0
				);

				// Add line segment vertices
				outlineVertices.push(...curr, ...nextVert);
			}
		});

		// Set up outline geometry
		outlineGeometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(outlineVertices, 3)
		);

		return {
			outlineGeometry,
			// Provide empty depth geometry to maintain interface compatibility
			depthGeometry: new THREE.BufferGeometry(),
		};
	}, [continentPaths]);

	useEffect(() => {
		const onMouseMove = (e: MouseEvent) => {
			if (!dragStartRef.current) return;

			const deltaX = e.clientX - dragStartRef.current.x;
			const deltaY = e.clientY - dragStartRef.current.y;
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			if (distance > DRAG_THRESHOLD) {
				dragState.current.isDragging = true;
				setIsDragging(true);
			}

			if (dragState.current.isDragging) {
				const deltaX = e.clientX - dragState.current.lastPosition.x;
				const deltaY = e.clientY - dragState.current.lastPosition.y;

				const rotationSpeed = 0.005;
				dragState.current.rotation.y += deltaX * rotationSpeed;
				dragState.current.rotation.x += deltaY * rotationSpeed;
				dragState.current.momentum = {
					x: deltaY * rotationSpeed * 0.1,
					y: deltaX * rotationSpeed * 0.1,
				};

				dragState.current.lastPosition = { x: e.clientX, y: e.clientY };
			}
		};

		const onMouseUp = () => {
			dragState.current.isDragging = false;
			dragStartRef.current = null;
			setIsDragging(false);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);

		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, []);

	// Add this function before handlePointerDown
	const MAX_RIPPLES = 5;
	const canCreateRippleRef = useRef(true);

	// Update createRipple function
	const createRipple = () => {
		if (!canCreateRippleRef.current || ripples.length >= MAX_RIPPLES) return;

		const newRipple: Ripple = {
			center: getRandomSpherePoint(),
			startTime: Date.now(),
			strength: 0.9, // Reduced strength for subtler effect
		};
		setRipples((prev) => [...prev.slice(-(MAX_RIPPLES - 1)), newRipple]);
		canCreateRippleRef.current = false;
	};

	// Add this state to track dragging
	const [isDragging, setIsDragging] = useState(false);

	// Update handlePointerDown
	const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
		dragStartRef.current = { x: e.clientX, y: e.clientY };
		dragState.current.lastPosition = { x: e.clientX, y: e.clientY };
		setIsDragging(false); // Don't set dragging immediately
		dragState.current.targetRotation = null;
		setIsAnimating(false);
		resetIdleTimer();
		createRipple();
	};

	// Update handlePointerUp
	const handlePointerUp = () => {
		dragState.current.isDragging = false;
		setIsDragging(false); // Add this
		canCreateRippleRef.current = true;
	};

	// Add pointer up listener
	useEffect(() => {
		window.addEventListener("pointerup", handlePointerUp);
		return () => window.removeEventListener("pointerup", handlePointerUp);
	}, []);
	// Add helper to check for momentum
	const hasMomentum = useCallback(() => {
		return (
			Math.abs(dragState.current.momentum.x) > 0.001 ||
			Math.abs(dragState.current.momentum.y) > 0.001
		);
	}, []);
	// Add this state to track if we're in the transition period after clearing location
	const [isTransitioning, setIsTransitioning] = useState(false);
	// Add this function to handle idle detection
	const resetIdleTimer = useCallback(() => {
		if (idleTimerRef.current) {
			clearTimeout(idleTimerRef.current);
		}

		// Don't reset idle state if we're in the transition period
		if (!isTransitioning) {
			setIsIdle(false);
			idleTimerRef.current = setTimeout(() => {
				// Only start auto-rotation if not dragging, not animating, and no momentum
				if (!dragState.current.isDragging && !isAnimating && !hasMomentum()) {
					setIsIdle(true);
				}
			}, 3000);
		}
	}, [isTransitioning, isAnimating, hasMomentum]);

	// Update the handleClearLocation handler in the event listener useEffect
	useEffect(() => {
		const handleFocusLocation = (e: CustomEvent<Location>) => {
			if (!dragState.current.isDragging) {
				const [lat, long] = e.detail.coordinates;

				// Convert to radians and adjust rotation direction
				const latRad = (lat * Math.PI) / 180; // Add negative sign to fix latitude rotation
				const longRad = (-long * Math.PI) / 180 - Math.PI / 2; // Add negative sign and quarter turn to fix longitude rotation

				dragState.current.targetRotation = {
					x: latRad,
					y: longRad, // Remove the - Math.PI / 2 offset
				};
				setFocusedLocation(e.detail);
				onLocationUpdate(e.detail);
				setIsAnimating(true);
				setIsIdle(false);
			}
		};

		const handleClearLocation = () => {
			setFocusedLocation(null);
			onLocationUpdate(null);
			setIsAnimating(false);
			// Immediately set to idle for instant rotation
			setIsIdle(true);
			setIsTransitioning(true);

			// After a delay, trigger the normal idle timer
			setTimeout(() => {
				setIsTransitioning(false);
				resetIdleTimer();
			}, 1000); // 2 second transition period
		};

		window.addEventListener(
			"focusLocation",
			handleFocusLocation as EventListener
		);
		window.addEventListener(
			"clearLocation",
			handleClearLocation as EventListener
		);

		return () => {
			window.removeEventListener(
				"focusLocation",
				handleFocusLocation as EventListener
			);
			window.removeEventListener(
				"clearLocation",
				handleClearLocation as EventListener
			);
		};
	}, [onLocationUpdate, resetIdleTimer]);

	// Fix the rotationToCoordinates function
	const rotationToCoordinates = (rotationX: number, rotationY: number) => {
		// Convert rotation to lat/long
		let lat = (rotationX * 180) / Math.PI; // Keep negative for correct latitude
		let long = (-rotationY * 180) / Math.PI - 90; // Adjust longitude by removing 90 degrees

		// Normalize longitude to -180 to 180
		long = ((long + 180) % 360) - 180;
		if (long < -180) long += 360;

		// Cap latitude to -90 to 90
		lat = Math.max(-90, Math.min(90, lat));

		return { lat, long };
	};

	// Store original positions when geometry is created
	useEffect(() => {
		if (meshRef.current) {
			const geometry = meshRef.current.geometry as THREE.BufferGeometry;
			const positions = geometry.attributes.position.array;
			originalPositionsRef.current = new Float32Array(positions);
		}
	}, []);

	// Store base sphere positions
	useEffect(() => {
		if (meshRef.current) {
			const geometry = meshRef.current.geometry;
			basePositions.current = new Float32Array(
				geometry.attributes.position.array
			);
		}
	}, []);

	// Add this helper function before useFrame
	const applyRippleEffect = (
		vertex: THREE.Vector3,
		ripples: Ripple[],
		now: number,
		baseScale: number = 1,
		intensity: number = 1
	) => {
		let totalBulge = 0;

		ripples.forEach((ripple) => {
			const age = (now - ripple.startTime) / 1000;
			if (age > 1.5) return;

			const angle = vertex.angleTo(ripple.center);
			const rippleProgress = age * 2.5;
			const distanceFromWave = angle - rippleProgress;

			const wave =
				Math.sin(distanceFromWave * 10) *
				Math.exp(-Math.abs(distanceFromWave) * 3) *
				Math.exp(-age * 1.0) *
				ripple.strength *
				intensity;

			totalBulge += wave;
		});

		return baseScale + totalBulge;
	};

	// Add new state for continent hover
	const [hoveredContinent] = useState<number | null>(null);

	// Add these new states/refs for idle detection and auto-rotation
	const [isIdle, setIsIdle] = useState(true);
	const idleTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const autoRotationSpeed = 0.1; // Degrees per frame

	// Add cleanup for idle timer
	useEffect(() => {
		return () => {
			if (idleTimerRef.current) {
				clearTimeout(idleTimerRef.current);
			}
		};
	}, []);

	// Add constant for equator rotation speed
	const EQUATOR_ROTATION_SPEED = 0.005; // Adjust this value to control speed of equator alignment

	// Replace the ripple section in useFrame with this updated version
	useFrame(() => {
		if (dragState.current.isDragging) {
			resetIdleTimer();
			// Cap rotation.x (latitude)
			dragState.current.rotation.x = Math.max(
				-Math.PI / 2,
				Math.min(Math.PI / 2, dragState.current.rotation.x)
			);

			// Normalize rotation.y (longitude)
			dragState.current.rotation.y =
				dragState.current.rotation.y % (Math.PI * 2);

			meshRef.current.rotation.x = dragState.current.rotation.x; // Removed negative sign
			meshRef.current.rotation.y = dragState.current.rotation.y; // Removed negative sign
		} else if (dragState.current.targetRotation && isAnimating) {
			resetIdleTimer();
			// Normalize target rotation
			const targetY = dragState.current.targetRotation.y % (Math.PI * 2);
			let deltaY = targetY - dragState.current.rotation.y;

			// Take shortest path
			if (Math.abs(deltaY) > Math.PI) {
				deltaY -= Math.sign(deltaY) * Math.PI * 2;
			}

			dragState.current.rotation.x = THREE.MathUtils.lerp(
				dragState.current.rotation.x,
				dragState.current.targetRotation.x,
				0.05
			);

			dragState.current.rotation.y += deltaY * 0.05;

			meshRef.current.rotation.x = dragState.current.rotation.x; // Removed negative sign
			meshRef.current.rotation.y = dragState.current.rotation.y; // Removed negative sign
		} else if (isIdle && !hasMomentum()) {
			// Auto-rotate when idle AND no momentum
			dragState.current.rotation.y += (autoRotationSpeed * Math.PI) / 180;

			// Gradually rotate towards equator (x rotation = 0)
			if (Math.abs(dragState.current.rotation.x) > 0.001) {
				dragState.current.rotation.x = THREE.MathUtils.lerp(
					dragState.current.rotation.x,
					0,
					EQUATOR_ROTATION_SPEED
				);
			} else {
				dragState.current.rotation.x = 0;
			}

			// Apply rotations
			meshRef.current.rotation.x = dragState.current.rotation.x;
			meshRef.current.rotation.y = dragState.current.rotation.y;

			// Update coordinates during auto-rotation
			const coords = rotationToCoordinates(
				dragState.current.rotation.x,
				dragState.current.rotation.y
			);
			setCurrentCoordinates(coords);
			onCoordinateUpdate(coords);
		} else {
			// Apply momentum with reduced decay (0.95 -> 0.98 for more lasting momentum)
			if (hasMomentum()) {
				dragState.current.rotation.x = Math.max(
					-Math.PI / 2,
					Math.min(
						Math.PI / 2,
						dragState.current.rotation.x + dragState.current.momentum.x
					)
				);

				dragState.current.rotation.y += dragState.current.momentum.y;
				dragState.current.rotation.y =
					dragState.current.rotation.y % (Math.PI * 2);

				dragState.current.momentum.x *= 0.98; // Increased from 0.95
				dragState.current.momentum.y *= 0.98; // Increased from 0.95

				meshRef.current.rotation.x = dragState.current.rotation.x; // Removed negative sign
				meshRef.current.rotation.y = dragState.current.rotation.y; // Removed negative sign

				// Check if momentum has stopped
				if (!hasMomentum()) {
					resetIdleTimer(); // Start idle timer once momentum stops
				}
			}
		}

		// Update current coordinates and pass to parent
		const coords = rotationToCoordinates(
			dragState.current.rotation.x,
			dragState.current.rotation.y
		);
		setCurrentCoordinates(coords);
		onCoordinateUpdate(coords);

		// Modified ripple effect for both sphere and continents
		if (meshRef.current && ripples.length > 0) {
			const now = Date.now();

			// Process base sphere
			const sphereGeometry = meshRef.current.geometry.attributes.position;
			if (basePositions.current) {
				sphereGeometry.array.set(basePositions.current);

				for (let i = 0; i < sphereGeometry.count; i++) {
					const i3 = i * 3;
					const vertex = new THREE.Vector3(
						sphereGeometry.array[i3],
						sphereGeometry.array[i3 + 1],
						sphereGeometry.array[i3 + 2]
					).normalize();

					const scale = applyRippleEffect(vertex, ripples, now, 1, 0.015);

					sphereGeometry.array[i3] = vertex.x * scale;
					sphereGeometry.array[i3 + 1] = vertex.y * scale;
					sphereGeometry.array[i3 + 2] = vertex.z * scale;
				}
				sphereGeometry.needsUpdate = true;
			}

			// Process continents
			const continentMesh = meshRef.current.children[2] as THREE.Mesh<
				THREE.BufferGeometry,
				THREE.Material
			>;
			if (continentMesh && continentMesh.geometry) {
				const continentGeometry = continentMesh.geometry.attributes.position;
				if (originalPositionsRef.current) {
					continentGeometry.array.set(originalPositionsRef.current);

					for (let i = 0; i < continentGeometry.count; i++) {
						const i3 = i * 3;
						const vertex = new THREE.Vector3(
							continentGeometry.array[i3],
							continentGeometry.array[i3 + 1],
							continentGeometry.array[i3 + 2]
						).normalize();

						const scale = applyRippleEffect(vertex, ripples, now, 1.015, 0.025);

						continentGeometry.array[i3] = vertex.x * scale;
						continentGeometry.array[i3 + 1] = vertex.y * scale;
						continentGeometry.array[i3 + 2] = vertex.z * scale;
					}
					continentGeometry.needsUpdate = true;
				}
			}

			// Clean up finished ripples
			setRipples((prev) =>
				prev.filter((ripple) => now - ripple.startTime < 1500)
			);
		}
	});

	// Update the useEffect that stores original positions to include continent geometry
	useEffect(() => {
		if (meshRef.current) {
			// Store base sphere positions
			const sphereGeometry = meshRef.current.geometry;
			basePositions.current = new Float32Array(
				sphereGeometry.attributes.position.array
			);

			// Store continent positions
			const continentGeometry = (meshRef.current.children[2] as THREE.Mesh)
				.geometry;
			originalPositionsRef.current = new Float32Array(
				continentGeometry.attributes.position.array
			);
		}
	}, []);

	// Add useEffect for Canvas hover detection
	useEffect(() => {
		const canvas = document.querySelector("canvas");
		if (!canvas) return;

		const handleMouseEnter = () => setHovered(true);
		const handleMouseLeave = () => setHovered(false);

		canvas.addEventListener("mouseenter", handleMouseEnter);
		canvas.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			canvas.removeEventListener("mouseenter", handleMouseEnter);
			canvas.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, []);

	// Add handlers for hover state
	const handlePointerEnter = () => {
		setHovered(true);
	};

	const handlePointerLeave = () => {
		setHovered(false);
	};

	// Add touch handlers
	const handleTouchStart = (e: React.TouchEvent) => {
		if (!dragStartRef.current && e.touches.length === 1) {
			const touch = e.touches[0];
			dragStartRef.current = { x: touch.clientX, y: touch.clientY };
			dragState.current.lastPosition = { x: touch.clientX, y: touch.clientY };
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (dragStartRef.current && e.touches.length === 1) {
			const touch = e.touches[0];
			const deltaX = touch.clientX - dragState.current.lastPosition.x;
			const deltaY = touch.clientY - dragState.current.lastPosition.y;

			dragState.current.isDragging = true;
			dragState.current.rotation.y += deltaX * 0.005;
			dragState.current.rotation.x += deltaY * 0.005;
			dragState.current.momentum = {
				x: deltaY * 0.005 * 0.1,
				y: deltaX * 0.005 * 0.1,
			};

			dragState.current.lastPosition = { x: touch.clientX, y: touch.clientY };
		}
	};

	return (
		<animated.mesh
			ref={meshRef}
			position={position || [0, 0, 0]}
			scale={glowScale.to((s) => [0.75 * s, 0.75 * s, 0.75 * s])} // Changed from 0.8 to 0.75
			rotation={[0, 0, 0]} // Changed from [0, Math.PI, 0] to [0, 0, 0]
			onPointerDown={handlePointerDown}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handlePointerUp}
			userData={{
				isHovered: hovered,
				isDragging,
				isAnimating,
				isIdle,
			}}>
			{/* Inner black sphere */}
			<mesh
				onPointerEnter={handlePointerEnter}
				onPointerLeave={handlePointerLeave}>
				<sphereGeometry args={[0.98, 32, 32]} />
				<meshBasicMaterial color="black" />
			</mesh>
			{/* Base sphere with lighter color - now with pointer-events-none */}
			<sphereGeometry
				ref={sphereRef}
				args={[1, 64, 64]} // Increased resolution for smoother ripples
			/>
			<animated.meshPhongMaterial
				color={color}
				wireframe
				transparent
				opacity={0.25}
				emissive={color}
				emissiveIntensity={emissiveIntensity}
				shininess={40}
				depthWrite={true}
			/>

			{/* Continent depth */}
			<mesh renderOrder={1}>
				<primitive object={continentGeometry.depthGeometry} />
				<meshStandardMaterial
					color="#FFFFFF"
					transparent={true}
					opacity={1}
					side={THREE.DoubleSide}
					emissive="#FFFFFF"
					emissiveIntensity={hoveredContinent !== null ? 0.5 : 0.15}
					roughness={0.8}
					metalness={0.1}
					depthTest={true}
					depthWrite={true}
				/>
			</mesh>

			{/* Updated continent outlines with glow effect */}
			<lineSegments renderOrder={2}>
				<primitive
					object={continentGeometry.outlineGeometry as THREE.BufferGeometry}
				/>
				<lineBasicMaterial
					color={hoveredContinent !== null ? "#FFFFFF" : "#CCCCCC"}
					linewidth={12}
					transparent={true}
					opacity={hoveredContinent !== null ? 1 : 0.7}
					depthTest={true}
					depthWrite={false}
				/>
			</lineSegments>
			{/* Location marker */}
			{focusedLocation && (
				<LocationMarker
					position={calculateGlobePosition(
						focusedLocation.coordinates[0],
						focusedLocation.coordinates[1],
						-0.02 // Changed from 0.04 to -0.02 to move marker closer to surface
					)}
				/>
			)}
		</animated.mesh>
	);
}

// Update the CSVVisualization component with better styling and debug info
function GeoVisualization({ points }: { points: Array<[number, number]> }) {
	return (
		<div className="w-full h-64 bg-purple-900/20 backdrop-blur-sm rounded-lg relative overflow-hidden border border-white/10">
			{points.length > 0 ? (
				points.map(([lat, long], i) => {
					const x = ((long + 180) / 360) * 100;
					const y = ((90 - lat) / 180) * 100;

					return (
						<div
							key={i}
							className="absolute w-1 h-1 bg-white/70 rounded-full hover:bg-white/100 transition-opacity"
							style={{
								left: `${x}%`,
								top: `${y}%`,
								transform: "translate(-50%, -50%)",
							}}
							title={`${lat.toFixed(2)}°, ${long.toFixed(2)}°`}
						/>
					);
				})
			) : (
				<div className="absolute inset-0 flex items-center justify-center text-white/50">
					Loading data...
				</div>
			)}

			{/* Grid lines - vertical (longitude) */}
			{Array.from({ length: 7 }).map((_, i) => (
				<div
					key={`v${i}`}
					className="absolute h-full w-px bg-white/10"
					style={{ left: `${(i * 100) / 6}%` }}
				/>
			))}

			{/* Grid lines - horizontal (latitude) */}
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={`h${i}`}
					className="absolute w-full h-px bg-white/10"
					style={{ top: `${(i * 100) / 4}%` }}
				/>
			))}

			{/* Grid and Label Container */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Longitude labels with improved spacing */}
				<div className="absolute bottom-4 w-full flex justify-between px-12">
					<span className="text-xs font-medium bg-purple-900/80 px-2 py-1 rounded text-white/90">
						180°W
					</span>
					<span className="text-xs font-medium bg-purple-900/80 px-2 py-1 rounded text-white/90">
						0°
					</span>
					<span className="text-xs font-medium bg-purple-900/80 px-2 py-1 rounded text-white/90">
						180°E
					</span>
				</div>

				{/* Latitude labels with improved spacing and alignment */}
				<div className="absolute left-4 h-full flex flex-col justify-between py-12">
					<span className="text-xs font-medium bg-purple-900/80 px-2 py-1 rounded text-white/90">
						90°N
					</span>
					<span className="text-xs font-medium bg-purple-900/80 px-2 py-1 rounded text-white/90">
						0°
					</span>
					<span className="text-xs font-medium bg-purple-900/80 px-2 py-1 rounded text-white/90">
						90°S
					</span>
				</div>

				{/* Points counter with improved visibility */}
				<div className="absolute top-4 right-4">
					<div className="text-xs font-medium bg-purple-900/80 px-3 py-1.5 rounded-md text-white/90 shadow-sm">
						Points: {points.length}
					</div>
				</div>
			</div>
		</div>
	);
}

// Modify the main Globe component
export default function Globe() {
	const [focusedLocation, setFocusedLocation] = useState<Location | null>(null);
	const [currentCoords, setCurrentCoords] = useState<{
		lat: number;
		long: number;
	}>({ lat: 0, long: 0 });
	const [csvPoints, setCsvPoints] = useState<Array<[number, number]>>([]);
	const [, setContinentPaths] = useState<
		Array<{
			points: [number, number][];
			elevation: number;
		}>
	>([]);

	// Add callback to receive points
	const handleDataUpdate = (points: Array<[number, number]>) => {
		setCsvPoints(points);
	};

	// Update the loadData function to fetch GeoJSON instead of CSV
	useEffect(() => {
		async function loadData() {
			try {
				const response = await fetch("/ne_110m_land.json");
				const data: GeoJSONData = await response.json();
				const continents = processGeoJSONData(data);

				// Create paths with varying elevations for visual interest
				const paths = continents.map((points) => {
					// Calculate size-based elevation
					const size = points.length;
					const baseElevation = 0.035; // Reduced base elevation
					const sizeScale = Math.min(size / 100, 1); // Scale based on polygon size

					return {
						points,
						elevation: baseElevation + sizeScale * 0.02, // Vary elevation slightly
					};
				});

				setContinentPaths(paths);
				setCsvPoints(continents.flat());
			} catch (error: unknown) {
				console.error(
					"Failed to load GeoJSON data:",
					error instanceof Error ? error.message : error
				);
				setContinentPaths([]);
				setCsvPoints([]);
			}
		}

		loadData();
	}, []);

	return (
		<div
			className="relative space-y-6"
			style={{ padding: "20px" }}>
			{/* Existing globe container */}
			<div className="relative h-[300px] md:h-[500px] w-full">
				{/* Updated glow effects */}
				<div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-purple-400/10 to-purple-900/20 rounded-full blur-3xl" />
				<div className="absolute inset-0 bg-purple-500/5 rounded-full blur-2xl" />
				<div className="absolute inset-[10%] bg-purple-400/10 rounded-full blur-xl animate-pulse" />

				<Canvas
					camera={{
						position: [0, 0, window.innerWidth < 768 ? 4 : 3.2], // Changed from 2.8 to 3.2 for better view
						fov: 40,
						near: 1,
						far: 1000,
					}}
					style={{ width: "100%", height: "100%" }}
					onCreated={({ gl }) => {
						gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better performance
					}}>
					<ambientLight intensity={0.8} />
					<pointLight
						position={[10, 10, 10]}
						intensity={1.5}
					/>
					<pointLight
						position={[-10, -10, -10]}
						intensity={0.5}
					/>
					<GlobeMesh
						onLocationUpdate={setFocusedLocation}
						onCoordinateUpdate={setCurrentCoords}
						onDataUpdate={handleDataUpdate}
					/>
				</Canvas>

				{/* Add test cities button 
				<button
					onClick={testNextCity}
					className="absolute top-8 right-8 bg-purple-900/80 backdrop-blur-sm rounded px-4 py-2 text-white font-medium hover:bg-purple-800/80 transition-colors">
					Test Random City
				</button>

				{/* Coordinates display */}
				<div className="absolute top-8 left-8 bg-purple-900/80 backdrop-blur-sm rounded px-4 py-2 text-white font-medium">
					<div className="text-sm text-purple-200">
						Current Position:
						<br />
						{formatCoordinates(currentCoords.lat, currentCoords.long)}
					</div>
				</div>

				{/* City info display */}
				{focusedLocation && (
					<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-purple-900/80 backdrop-blur-sm rounded px-4 py-2 text-white font-medium">
						<div className="text-lg mb-1">{focusedLocation.city}</div>
						<div className="text-sm text-purple-200">
							{formatCoordinates(
								focusedLocation.coordinates[0],
								focusedLocation.coordinates[1]
							)}
						</div>
					</div>
				)}
			</div>

			{/* Add 2D visualization - hidden on mobile */}
			<div className="relative w-full hidden md:block">
				<h3 className="text-white/70 mb-2 font-medium">
					Geographic Data Visualization
				</h3>
				<GeoVisualization points={csvPoints} />
			</div>
		</div>
	);
}
