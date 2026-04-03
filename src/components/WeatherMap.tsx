'use client';

import { useEffect, useRef } from 'react';
import type { Map, LayerGroup, Marker } from 'leaflet';
import { WeatherAlert } from '@/lib/datasources/types';
import { getSeverityColor } from '@/lib/severity';

interface WeatherMapProps {
  alerts: WeatherAlert[];
  userLocation: { lat: number; lng: number } | null;
  selectedAlertId: string | null;
  onSelectAlert: (id: string | null) => void;
}

export default function WeatherMap({ alerts, userLocation, selectedAlertId, onSelectAlert }: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const layerGroupRef = useRef<LayerGroup | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          center: [65, 15], // Center on Norway
          zoom: 5,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Update alert layers when alerts change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    
    import('leaflet').then((L) => {
      layerGroup.clearLayers();
      
      for (const alert of alerts) {
        if (!alert.geometry) continue;
        
        const color = getSeverityColor(alert.severity, alert.color);
        const isSelected = alert.id === selectedAlertId;
        
        const style = {
          color,
          weight: isSelected ? 3 : 2,
          opacity: isSelected ? 1 : 0.8,
          fillColor: color,
          fillOpacity: isSelected ? 0.35 : 0.2,
        };

        const popupContent = `
          <div style="max-width: 200px">
            <strong style="font-size: 13px">${alert.title}</strong>
            <br/><span style="color: #666; font-size: 11px">${alert.area}</span>
            ${alert.description ? `<br/><p style="margin-top: 4px; font-size: 11px; color: #444">${alert.description.substring(0, 120)}${alert.description.length > 120 ? '...' : ''}</p>` : ''}
          </div>
        `;

        try {
          if (alert.geometry.type === 'GeometryCollection' && alert.geometry.geometries) {
            const geoJsonGeometries = alert.geometry.geometries.map(g => ({
              type: 'Feature' as const,
              properties: {},
              geometry: g as GeoJSON.Geometry,
            }));
            
            for (const geom of geoJsonGeometries) {
              const l = L.geoJSON(geom, { style: () => style });
              l.on('click', () => onSelectAlert(alert.id === selectedAlertId ? null : alert.id));
              l.bindPopup(popupContent);
              l.addTo(layerGroup);
            }
            continue;
          }
          
          const feature: GeoJSON.Feature = { type: 'Feature', properties: {}, geometry: alert.geometry as GeoJSON.Geometry };
          const layer = L.geoJSON(feature, {
            style: () => style,
          });
          
          layer.on('click', () => onSelectAlert(alert.id === selectedAlertId ? null : alert.id));
          layer.bindPopup(popupContent);
          layer.addTo(layerGroup);
        } catch {
          // Skip invalid geometries
        }
      }
    });
  }, [alerts, selectedAlertId, onSelectAlert]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    import('leaflet').then((L) => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      
      if (userLocation) {
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width: 16px; height: 16px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon })
          .bindPopup('Your location')
          .addTo(map);
      }
    });
  }, [userLocation]);

  // Pan to selected alert
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedAlertId) return;
    const map = mapInstanceRef.current;
    
    const alert = alerts.find(a => a.id === selectedAlertId);
    if (alert?.centroid) {
      map.flyTo(alert.centroid, Math.max(map.getZoom(), 7), {
        duration: 0.8,
      });
    }
  }, [selectedAlertId, alerts]);

  return (
    <div className="relative w-full h-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
