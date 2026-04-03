export interface AlertGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point' | 'GeometryCollection';
  coordinates: number[][][] | number[][][][] | number[] | any;
  geometries?: AlertGeometry[];
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  event: string;
  onset: string;
  expires: string;
  area: string;
  geometry?: AlertGeometry;
  source: string;
  color?: string;
  instruction?: string;
  awareness_type?: string;
  awareness_level?: string;
  // For distance calculation
  centroid?: [number, number]; // [lat, lng]
}

export interface DataSource {
  name: string;
  fetchAlerts(): Promise<WeatherAlert[]>;
}
