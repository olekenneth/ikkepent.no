import { DataSource, WeatherAlert } from './types';
import { MetNoDataSource } from './metno';

const dataSources: DataSource[] = [
  new MetNoDataSource(),
  // Add more datasources here
];

export async function fetchAllAlerts(): Promise<WeatherAlert[]> {
  const results = await Promise.allSettled(
    dataSources.map(source => source.fetchAlerts())
  );

  const alerts: WeatherAlert[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      alerts.push(...result.value);
    } else {
      console.error('Failed to fetch alerts from datasource:', result.reason);
    }
  }
  return alerts;
}

export { dataSources };
export type { DataSource, WeatherAlert };
