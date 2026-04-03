'use client';

import { WeatherAlert } from '@/lib/datasources/types';
import AlertCard from './AlertCard';
import { haversineDistance } from '@/lib/distance';

interface AlertListProps {
  alerts: WeatherAlert[];
  userLocation: { lat: number; lng: number } | null;
  showAll: boolean;
  onToggleShowAll: () => void;
  selectedAlertId: string | null;
  onSelectAlert: (id: string | null) => void;
}

const NEARBY_RADIUS_KM = 200;

export default function AlertList({
  alerts,
  userLocation,
  showAll,
  onToggleShowAll,
  selectedAlertId,
  onSelectAlert,
}: AlertListProps) {
  const alertsWithDistance = alerts.map(alert => ({
    alert,
    distance: userLocation && alert.centroid
      ? haversineDistance(userLocation.lat, userLocation.lng, alert.centroid[0], alert.centroid[1])
      : undefined,
  }));

  const sortedAlerts = [...alertsWithDistance].sort((a, b) => {
    if (a.distance === undefined && b.distance === undefined) return 0;
    if (a.distance === undefined) return 1;
    if (b.distance === undefined) return -1;
    return a.distance - b.distance;
  });

  const displayedAlerts = showAll || !userLocation
    ? sortedAlerts
    : sortedAlerts.filter(({ distance }) => distance === undefined || distance <= NEARBY_RADIUS_KM);

  const nearbyCount = userLocation
    ? sortedAlerts.filter(({ distance }) => distance !== undefined && distance <= NEARBY_RADIUS_KM).length
    : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div>
          <h2 className="font-semibold text-gray-800">
            {showAll ? 'All Alerts' : userLocation ? 'Nearby Alerts' : 'Alerts'}
          </h2>
          <p className="text-xs text-gray-500">
            {displayedAlerts.length} alert{displayedAlerts.length !== 1 ? 's' : ''}
            {!showAll && userLocation && ` within ${NEARBY_RADIUS_KM} km`}
          </p>
        </div>
        {userLocation && (
          <button
            onClick={onToggleShowAll}
            className="text-xs px-3 py-1.5 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {showAll ? `Show nearby (${nearbyCount})` : `Show all (${alerts.length})`}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayedAlerts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🌤️</div>
            <p className="text-sm font-medium">No active alerts</p>
            <p className="text-xs mt-1">
              {userLocation
                ? `No alerts within ${NEARBY_RADIUS_KM} km of your location`
                : 'No weather alerts at this time'}
            </p>
          </div>
        ) : (
          displayedAlerts.map(({ alert, distance }) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              distance={distance}
              isSelected={selectedAlertId === alert.id}
              onClick={() => onSelectAlert(selectedAlertId === alert.id ? null : alert.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
