import WeatherApp from '@/components/WeatherApp';
import { fetchAllAlerts } from '@/lib/datasources';
import { WeatherAlert } from '@/lib/datasources/types';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  let alerts: WeatherAlert[] = [];
  let error: string | null = null;
  
  try {
    alerts = await fetchAllAlerts();
  } catch (e) {
    error = 'Kunne ikke laste værvarsler. Vennligst prøv igjen senere.';
    console.error(e);
  }

  return <WeatherApp initialAlerts={alerts} error={error} />;
}
