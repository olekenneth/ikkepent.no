'use client';

import { WeatherAlert } from '@/lib/datasources/types';
import { getSeverityBadgeClass, getSeverityBorderClass } from '@/lib/severity';

interface AlertCardProps {
  alert: WeatherAlert;
  distance?: number;
  onClick?: () => void;
  isSelected?: boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function AlertCard({ alert, distance, onClick, isSelected }: AlertCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm border-l-4 p-4 cursor-pointer transition-all
        hover:shadow-md hover:translate-y-[-1px]
        ${getSeverityBorderClass(alert.severity)}
        ${isSelected ? 'ring-2 ring-blue-400 shadow-md' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {alert.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{alert.area}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getSeverityBadgeClass(alert.severity)}`}>
            {alert.severity}
          </span>
          {distance !== undefined && (
            <span className="text-xs text-gray-400">
              {distance < 1 ? '< 1 km' : `${Math.round(distance)} km`}
            </span>
          )}
        </div>
      </div>

      {alert.description && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{alert.description}</p>
      )}

      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
        {alert.onset && (
          <span>From: {formatDate(alert.onset)}</span>
        )}
        {alert.expires && (
          <span>Until: {formatDate(alert.expires)}</span>
        )}
        <span className="ml-auto text-gray-300">{alert.source}</span>
      </div>
    </div>
  );
}
