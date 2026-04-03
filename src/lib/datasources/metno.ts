import { DataSource, WeatherAlert, AlertGeometry } from './types';

interface MetNoFeature {
  type: string;
  geometry: AlertGeometry | null;
  when: {
    interval: string[];
  };
  properties: {
    id: string;
    MunicipalityId?: string;
    administrativeId?: string;
    awarenessResponse?: string;
    awarenessSeriousness?: string;
    awareness_level?: string;
    awareness_type?: string;
    ceiling?: number;
    certainty?: string;
    consequences?: string;
    contact?: string;
    county?: string[];
    description?: string;
    event?: string;
    eventAwarenessName?: string;
    eventEndingTime?: string;
    floor?: number;
    geographicDomain?: string;
    instruction?: string;
    resources?: Array<{ description: string; mimeType: string; uri: string }>;
    riskMatrixColor?: string;
    severity?: string;
    status?: string;
    title?: string;
    triggerLevel?: string;
    type?: string;
    municipality?: string[];
  };
}

interface MetNoResponse {
  type: string;
  features: MetNoFeature[];
}

function cleanTitle(title: string): string {
  return title
    .split(',')
    .filter(part => {
      const trimmed = part.trim();
      // Filter out ISO 8601 timestamps (e.g. "2026-04-03T14:00:00+00:00")
      if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) return false;
      // Filter out date-time ranges (e.g. "04 april 22:00 UTC til ...")
      if (/\d{2}:\d{2}\s+UTC/.test(trimmed)) return false;
      return true;
    })
    .join(',')
    .trim();
}

function mapSeverity(severity?: string): WeatherAlert['severity'] {
  switch (severity?.toLowerCase()) {
    case 'extreme': return 'Extreme';
    case 'severe': return 'Severe';
    case 'moderate': return 'Moderate';
    case 'minor': return 'Minor';
    default: return 'Unknown';
  }
}

function getCentroid(geometry: AlertGeometry | null): [number, number] | undefined {
  if (!geometry) return undefined;
  
  if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates.length > 0) {
    const ring = geometry.coordinates[0] as number[][];
    if (ring.length === 0) return undefined;
    let lat = 0, lng = 0;
    for (const coord of ring) {
      lng += coord[0];
      lat += coord[1];
    }
    return [lat / ring.length, lng / ring.length];
  }
  
  if (geometry.type === 'MultiPolygon' && geometry.coordinates && geometry.coordinates.length > 0) {
    const allCoords: number[][] = [];
    for (const poly of geometry.coordinates as number[][][][]) {
      if (poly[0]) allCoords.push(...poly[0]);
    }
    if (allCoords.length === 0) return undefined;
    let lat = 0, lng = 0;
    for (const coord of allCoords) {
      lng += coord[0];
      lat += coord[1];
    }
    return [lat / allCoords.length, lng / allCoords.length];
  }

  if (geometry.type === 'GeometryCollection' && geometry.geometries) {
    for (const g of geometry.geometries) {
      const c = getCentroid(g);
      if (c) return c;
    }
  }
  
  return undefined;
}

export class MetNoDataSource implements DataSource {
  name = 'met.no';
  private url = 'https://api.met.no/weatherapi/metalerts/2.0/current.json';

  async fetchAlerts(): Promise<WeatherAlert[]> {
    const response = await fetch(this.url, {
      headers: {
        'User-Agent': 'ikkepent.no/1.0 (https://ikkepent.no; contact@ikkepent.no)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch met.no alerts: ${response.statusText}`);
    }

    const data: MetNoResponse = await response.json();
    
    return data.features.map((feature, index) => {
      const props = feature.properties;
      // Filter out numeric-only IDs and ISO date strings, keeping only human-readable location names
      const isLocationName = (s: string) =>
        !!s && !/^\d+$/.test(s) && !/^\d{4}-\d{2}-\d{2}T/.test(s);

      const area = (props.county || [])
        .filter(isLocationName)
        .join(', ') || props.administrativeId || 'Norway';

      return {
        id: props.id || `metno-${index}`,
        title: cleanTitle(props.title || props.eventAwarenessName || props.event || 'Weather Alert'),
        description: props.description || '',
        severity: mapSeverity(props.severity),
        event: props.event || props.eventAwarenessName || 'Unknown',
        onset: feature.when?.interval?.[0] || '',
        expires: feature.when?.interval?.[1] || '',
        area,
        geometry: feature.geometry || undefined,
        source: this.name,
        color: props.riskMatrixColor,
        instruction: props.instruction,
        awareness_type: props.awareness_type,
        awareness_level: props.awareness_level,
        centroid: getCentroid(feature.geometry),
      };
    });
  }
}
