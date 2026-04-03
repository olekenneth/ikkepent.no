# ikkepent.no 🌩️

> "Not pretty" — A weather app focused on showing where the weather is bad.

A real-time Norwegian weather alert application built with Next.js, showing active weather warnings from multiple datasources on an interactive map.

## Features

- 🗺️ **Interactive map** — OpenStreetMap with weather alert areas highlighted
- 📍 **Location-aware** — Shows alerts closest to you first
- 🔔 **Real-time alerts** — Pulls from Norwegian Meteorological Institute (met.no)
- 🌈 **Severity color-coding** — Visual distinction between Minor, Moderate, Severe, and Extreme alerts
- 📱 **Responsive** — Works on mobile and desktop
- 🔌 **Extensible datasource architecture** — Easy to add new alert providers

## Datasources

| Source | Description | API |
|--------|-------------|-----|
| **met.no** | Norwegian Meteorological Institute weather alerts | `https://api.met.no/weatherapi/metalerts/2.0/current.json` |

### Adding a new datasource

1. Create a new file in `src/lib/datasources/` implementing the `DataSource` interface:

```typescript
import { DataSource, WeatherAlert } from './types';

export class MyDataSource implements DataSource {
  name = 'my-source';

  async fetchAlerts(): Promise<WeatherAlert[]> {
    // Fetch and transform your data
    return [];
  }
}
```

2. Register it in `src/lib/datasources/index.ts`:

```typescript
import { MyDataSource } from './my-datasource';

const dataSources: DataSource[] = [
  new MetNoDataSource(),
  new MyDataSource(), // Add here
];
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** — React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** — Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** — Styling
- **[Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)** — Interactive mapping
- **[met.no MetAlerts API](https://api.met.no/weatherapi/metalerts/2.0/documentation)** — Weather alert data

## API

### `GET /api/alerts`

Returns all active weather alerts from all configured datasources.

```json
{
  "alerts": [
    {
      "id": "2.49.0.1.578.0.20240101T120000Z.001",
      "title": "Yellow wind warning",
      "description": "Strong winds expected...",
      "severity": "Moderate",
      "event": "wind",
      "onset": "2024-01-01T12:00:00Z",
      "expires": "2024-01-02T00:00:00Z",
      "area": "Vestland",
      "source": "met.no",
      "centroid": [60.5, 5.3]
    }
  ]
}
```

## License

GNU GPL v3 — see [LICENSE](LICENSE).
