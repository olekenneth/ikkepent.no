'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { WeatherAlert } from '@/lib/datasources/types';
import AlertList from './AlertList';

const WeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-400 text-sm">Loading map...</div>
    </div>
  ),
});

interface WeatherAppProps {
  initialAlerts: WeatherAlert[];
  error: string | null;
}

export default function WeatherApp({ initialAlerts, error }: WeatherAppProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>(initialAlerts);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setShowAll(true);
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      () => {
        setLocationError('Could not get your location. Showing all alerts.');
        setShowAll(true);
        setIsLoadingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const refreshAlerts = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.alerts) {
        setAlerts(data.alerts);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Failed to refresh alerts', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌩️</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ikkepent.no</h1>
            <p className="text-xs text-gray-400">Norwegian Weather Alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoadingLocation && (
            <span className="text-xs text-gray-400 animate-pulse">📍 Locating...</span>
          )}
          {locationError && !isLoadingLocation && (
            <button
              onClick={requestLocation}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              📍 Enable location
            </button>
          )}
          {userLocation && (
            <span className="text-xs text-green-400">📍 Located</span>
          )}
          <button
            onClick={refreshAlerts}
            disabled={isRefreshing}
            className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map (always full on desktop, full on mobile behind panel) */}
        <div className="flex-1 relative">
          <WeatherMap
            alerts={alerts}
            userLocation={userLocation}
            selectedAlertId={selectedAlertId}
            onSelectAlert={setSelectedAlertId}
          />
          
          {/* Mobile toggle button */}
          <button
            onClick={() => setIsMobileListOpen(!isMobileListOpen)}
            className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] 
              bg-white shadow-lg rounded-full px-4 py-2 text-sm font-medium text-gray-700
              border border-gray-200 flex items-center gap-2"
          >
            {isMobileListOpen ? '🗺️ Show Map' : `📋 Show Alerts (${alerts.length})`}
          </button>
        </div>

        {/* Alert Panel - desktop: fixed sidebar, mobile: slide-up panel */}
        <div className={`
          bg-white shadow-xl z-10 flex flex-col
          md:w-96 md:border-l md:border-gray-200 md:static
          absolute inset-x-0 bottom-0 transition-transform duration-300
          ${isMobileListOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          h-2/3 md:h-auto
        `}>
          <AlertList
            alerts={alerts}
            userLocation={userLocation}
            showAll={showAll}
            onToggleShowAll={() => setShowAll(!showAll)}
            selectedAlertId={selectedAlertId}
            onSelectAlert={(id) => {
              setSelectedAlertId(id);
              if (id) setIsMobileListOpen(false); // Close panel to show map when alert selected
            }}
          />
          <div className="px-4 py-2 border-t text-xs text-gray-400 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()} · Data: met.no
          </div>
        </div>
      </div>
    </div>
  );
}
