import { useEffect, useMemo, useRef, useState } from 'react';
import { uruguayDepartmentGeo } from '../data/uruguayDepartmentsGeo';

type Coordinate = [number, number];
type Ring = Coordinate[];
type PolygonCoordinates = Ring[];
type MultiPolygonCoordinates = PolygonCoordinates[];

type GeoDepartment = {
	id: string;
	name: string;
	type: 'Polygon' | 'MultiPolygon';
	coordinates: PolygonCoordinates | MultiPolygonCoordinates;
};

type DepartmentClickDetail = {
	departmentId: string | null;
	departmentName: string | null;
};

type CountsMap = Record<string, number>;

type UruguayMapProps = {
	className?: string;
	selectedDepartmentId?: string;
	onDepartmentClick?: (departmentId: string | null, departmentName: string | null) => void;
};

type Bounds = {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
};

type TooltipState = {
	visible: boolean;
	text: string;
	x: number;
	y: number;
};

const VIEW_BOX_WIDTH = 1000;
const VIEW_BOX_HEIGHT = 1200;
const VIEW_BOX_PADDING = 64;

function isPolygonCoordinates(coordinates: PolygonCoordinates | MultiPolygonCoordinates): coordinates is PolygonCoordinates {
	return Array.isArray(coordinates[0]?.[0]) && typeof coordinates[0]?.[0]?.[0] === 'number';
}

function collectBounds(departments: GeoDepartment[]): Bounds {
	const bounds = {
		minX: Number.POSITIVE_INFINITY,
		minY: Number.POSITIVE_INFINITY,
		maxX: Number.NEGATIVE_INFINITY,
		maxY: Number.NEGATIVE_INFINITY
	};

	for (const department of departments) {
		const polygons = department.type === 'Polygon' ? [department.coordinates] : department.coordinates;

		for (const polygon of polygons) {
			for (const ring of polygon) {
				for (const [x, y] of ring) {
					bounds.minX = Math.min(bounds.minX, x);
					bounds.minY = Math.min(bounds.minY, y);
					bounds.maxX = Math.max(bounds.maxX, x);
					bounds.maxY = Math.max(bounds.maxY, y);
				}
			}
		}
	}

	return bounds;
}

function createProjector(bounds: Bounds) {
	const worldWidth = bounds.maxX - bounds.minX || 1;
	const worldHeight = bounds.maxY - bounds.minY || 1;
	const innerWidth = VIEW_BOX_WIDTH - VIEW_BOX_PADDING * 2;
	const innerHeight = VIEW_BOX_HEIGHT - VIEW_BOX_PADDING * 2;
	const scale = Math.min(innerWidth / worldWidth, innerHeight / worldHeight);
	const projectedWidth = worldWidth * scale;
	const projectedHeight = worldHeight * scale;
	const offsetX = (VIEW_BOX_WIDTH - projectedWidth) / 2;
	const offsetY = (VIEW_BOX_HEIGHT - projectedHeight) / 2;

	return ([lon, lat]: Coordinate): Coordinate => {
		const x = offsetX + (lon - bounds.minX) * scale;
		const y = offsetY + (bounds.maxY - lat) * scale;
		return [x, y];
	};
}

function formatNumber(value: number) {
	return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

function ringToPath(ring: Ring, project: (point: Coordinate) => Coordinate) {
	return ring
		.map((point, index) => {
			const [x, y] = project(point);
			return `${index === 0 ? 'M' : 'L'}${formatNumber(x)} ${formatNumber(y)}`;
		})
		.join(' ');
}

function geometryToPath(department: GeoDepartment, project: (point: Coordinate) => Coordinate) {
	if (department.type === 'Polygon' && isPolygonCoordinates(department.coordinates)) {
		return department.coordinates.map((ring) => `${ringToPath(ring, project)} Z`).join(' ');
	}

	const polygons = department.coordinates as MultiPolygonCoordinates;
	return polygons
		.map((polygon) => polygon.map((ring) => `${ringToPath(ring, project)} Z`).join(' '))
		.join(' ');
}

function getDepartmentTooltipText(name: string, count: number) {
	return `${name}: ${count} usuario${count === 1 ? '' : 's'}`;
}

export default function UruguayMap({ className = '', selectedDepartmentId, onDepartmentClick }: UruguayMapProps) {
	const [internalSelectedDepartmentId, setInternalSelectedDepartmentId] = useState('');
	const [hoveredDepartmentId, setHoveredDepartmentId] = useState('');
	const [departmentCounts, setDepartmentCounts] = useState<CountsMap>({});
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [tooltip, setTooltip] = useState<TooltipState>({
		visible: false,
		text: '',
		x: 0,
		y: 0
	});

	const getCachedDepartmentCounts = () => {
		if (typeof window === 'undefined') {
			return {};
		}

		return (window as Window & { __uruguayMapCounts?: CountsMap }).__uruguayMapCounts ?? {};
	};

	const selectedId = selectedDepartmentId ?? internalSelectedDepartmentId;

    const { departments, selectedDepartment } = useMemo(() => {
		const geoDepartments = uruguayDepartmentGeo as GeoDepartment[];
		const computedBounds = collectBounds(geoDepartments);
		const project = createProjector(computedBounds);

		const views = geoDepartments.map((department) => ({
			...department,
			d: geometryToPath(department, project)
		}));

		return {
			departments: views,
			selectedDepartment: views.find((department) => department.id === selectedId),
		};
	}, [selectedId]);

	useEffect(() => {
		setDepartmentCounts(getCachedDepartmentCounts());

		const handleCountsUpdated = (event: Event) => {
			const detail = (event as CustomEvent<{ counts?: CountsMap }>).detail;
			setDepartmentCounts(detail?.counts ?? {});
		};

		const handleSelectionChanged = (event: Event) => {
			const detail = (event as CustomEvent<{ departmentId: string | null }>).detail;
			setInternalSelectedDepartmentId(detail?.departmentId ?? '');
		};

		window.addEventListener('uruguay-map:counts-updated', handleCountsUpdated as EventListener);
		window.addEventListener('uruguay-map:selection-changed', handleSelectionChanged as EventListener);

		return () => {
			window.removeEventListener('uruguay-map:counts-updated', handleCountsUpdated as EventListener);
			window.removeEventListener('uruguay-map:selection-changed', handleSelectionChanged as EventListener);
		};
	}, []);

	const syncSelection = (departmentId: string, departmentName: string) => {
		const isTogglingOff = selectedId === departmentId;
		const nextDepartmentId = isTogglingOff ? '' : departmentId;
		const eventDepartmentId = isTogglingOff ? null : departmentId;
		const eventDepartmentName = isTogglingOff ? null : departmentName;

		if (selectedDepartmentId === undefined) {
			setInternalSelectedDepartmentId(nextDepartmentId);
		}

		onDepartmentClick?.(eventDepartmentId, eventDepartmentName);

		window.dispatchEvent(
			new CustomEvent<DepartmentClickDetail>('uruguay-map:department-click', {
				detail: { departmentId: eventDepartmentId, departmentName: eventDepartmentName }
			})
		);
	};

	const updateTooltip = (departmentId: string, x: number, y: number) => {
		const department = departments.find((item) => item.id === departmentId);

		if (!department) {
			return;
		}

		const container = containerRef.current;
		const containerBounds = container?.getBoundingClientRect();
		const localX = containerBounds ? x - containerBounds.left : x;
		const localY = containerBounds ? y - containerBounds.top : y;
		const count = departmentCounts[department.id] ?? 0;
		setTooltip({
			visible: true,
			text: getDepartmentTooltipText(department.name, count),
			x: localX + 14,
			y: localY - 14
		});
	};

	return (
		<figure className={`relative ${className}`}>
			<div ref={containerRef} className="relative bg-transparent">
				{tooltip.visible ? (
					<div
						className="pointer-events-none absolute z-20 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-lg"
						style={{ left: tooltip.x, top: tooltip.y }}
					>
						{tooltip.text}
					</div>
				) : null}

				<svg
					viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
					role="img"
					aria-label="Mapa interactivo de Uruguay con 19 departamentos"
					className="h-auto w-full"
					preserveAspectRatio="xMidYMid meet"
				>
				<title>Selecciona un departamento para ver usuarios de Discord</title>
				{departments.map((department) => {
					const count = departmentCounts[department.id] ?? 0;
					const isSelected = selectedId === department.id;
					const isHovered = hoveredDepartmentId === department.id;

					return (
						<g key={department.id}>
							<path
								id={department.id}
								data-name={department.name}
								data-department-id={department.id}
								d={department.d}
								role="button"
								tabIndex={0}
								aria-pressed={isSelected}
								aria-label={`${department.name}: ${count} usuario${count === 1 ? '' : 's'}`}
								className={`department-shape cursor-pointer transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 ${isSelected ? 'fill-cyan-300' : isHovered ? 'fill-cyan-200' : 'fill-slate-100'} stroke-slate-500 hover:fill-cyan-200`}
								vectorEffect="non-scaling-stroke"
								onClick={() => syncSelection(department.id, department.name)}
								onFocus={() => setTooltip({ visible: false, text: '', x: 0, y: 0 })}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										syncSelection(department.id, department.name);
									}
								}}
								onPointerEnter={(event) => {
									setHoveredDepartmentId(department.id);
									updateTooltip(department.id, event.clientX, event.clientY);
								}}
								onPointerMove={(event) => updateTooltip(department.id, event.clientX, event.clientY)}
								onPointerLeave={() => {
									setHoveredDepartmentId('');
									setTooltip({ visible: false, text: '', x: 0, y: 0 });
								}}
							>
								<title>{department.name}</title>
							</path>
						</g>
					);
				})}
					</svg>
			</div>

			<figcaption className="mt-4 flex flex-col gap-1 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
				<span className="font-medium text-slate-900">Departamento seleccionado:</span>
				<strong className="text-cyan-800">{selectedDepartment?.name || 'Ninguno'}</strong>
			</figcaption>
		</figure>
	);
}