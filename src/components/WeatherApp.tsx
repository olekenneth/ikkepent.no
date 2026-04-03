'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { WeatherAlert } from '@/lib/datasources/types';
import AlertList from './AlertList';
import AdSlot from './AdSlot';

const WeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-400 text-sm">Laster kart…</div>
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
      setLocationError('Posisjonering støttes ikke av nettleseren din');
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
        setLocationError('Kunne ikke hente posisjonen din. Viser alle varsler.');
        setShowAll(true);
        setIsLoadingLocation(false);
      },
      { timeout: 5000, enableHighAccuracy: false }
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
      console.error('Kunne ikke oppdatere varsler', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMapSelectAlert = useCallback((id: string | null) => {
    setSelectedAlertId(id);
    if (id) {
      setIsMobileListOpen(true);
    }
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      {/* Header */}
      <header
        className="bg-gray-900 text-white px-4 flex items-center justify-between shadow-lg z-10"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))', paddingBottom: '0.75rem' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌩️</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ikkepent.no</h1>
            <p className="text-xs text-gray-400">Norske værvarsler</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoadingLocation && (
            <span className="text-xs text-gray-400 animate-pulse">📍 Finner posisjon…</span>
          )}
          {locationError && !isLoadingLocation && (
            <button
              onClick={requestLocation}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              📍 Slå på posisjon
            </button>
          )}
          {userLocation && (
            <span className="text-xs text-green-400">📍 Posisjon funnet</span>
          )}
          <button
            onClick={refreshAlerts}
            disabled={isRefreshing}
            className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            {isRefreshing ? '⟳ Oppdaterer…' : '⟳ Oppdater'}
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
            onSelectAlert={handleMapSelectAlert}
          />
          
          {/* Mobile toggle button */}
          <button
            onClick={() => setIsMobileListOpen(!isMobileListOpen)}
            className="md:hidden absolute left-1/2 -translate-x-1/2 z-[1001] 
              bg-white shadow-lg rounded-full px-4 py-2 text-sm font-medium text-gray-700
              border border-gray-200 flex items-center gap-2"
            style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {isMobileListOpen ? '🗺️ Vis kart' : `📋 Vis varsler (${alerts.length})`}
          </button>
        </div>

        {/* Alert Panel - desktop: fixed sidebar, mobile: slide-up panel */}
        <div className={`
          bg-white shadow-xl z-[1000] flex flex-col
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
              if (id) setIsMobileListOpen(false);
            }}
          />
          <AdSlot slot="alert-panel-bottom" className="border-t" />
          <div className="px-4 border-t text-xs text-gray-400 text-center"
            style={{ paddingTop: '0.5rem', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            Sist oppdatert: {lastUpdated.toLocaleTimeString('nb-NO')} · Data: met.no
          </div>
        </div>
      </div>
    </div>
  );
}
