export function getSeverityColor(severity: string, riskMatrixColor?: string): string {
  if (riskMatrixColor) {
    const colorMap: Record<string, string> = {
      Red: '#dc2626',
      Orange: '#ea580c',
      Yellow: '#ca8a04',
      Green: '#16a34a',
    };
    if (colorMap[riskMatrixColor]) return colorMap[riskMatrixColor];
  }
  
  switch (severity) {
    case 'Extreme': return '#7c3aed'; // purple
    case 'Severe': return '#dc2626';  // red
    case 'Moderate': return '#ea580c'; // orange
    case 'Minor': return '#ca8a04';    // yellow
    default: return '#6b7280';         // gray
  }
}

export function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case 'Extreme': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Severe': return 'bg-red-100 text-red-800 border-red-300';
    case 'Moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Minor': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getSeverityBorderClass(severity: string): string {
  switch (severity) {
    case 'Extreme': return 'border-l-purple-500';
    case 'Severe': return 'border-l-red-500';
    case 'Moderate': return 'border-l-orange-500';
    case 'Minor': return 'border-l-yellow-500';
    default: return 'border-l-gray-400';
  }
}
