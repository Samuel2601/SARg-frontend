export interface GeoFeature {
	type: string;
	id: string;
	geometry: Geometry;
	geometry_name: string;
	properties: Properties;
}

export interface Geometry {
	type: string;
	coordinates: number[][][][];
}

export interface Properties {
	layer: string;
	parr?: string | null;
	tipo?: string | null;
	nombre?: string | null;
	obser?: string | null;
}
