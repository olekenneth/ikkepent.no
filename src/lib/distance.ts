export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sortAlertsByDistance(
  alerts: { centroid?: [number, number] }[],
  userLat: number,
  userLon: number
) {
  return [...alerts].sort((a, b) => {
    if (!a.centroid && !b.centroid) return 0;
    if (!a.centroid) return 1;
    if (!b.centroid) return -1;
    const distA = haversineDistance(userLat, userLon, a.centroid[0], a.centroid[1]);
    const distB = haversineDistance(userLat, userLon, b.centroid[0], b.centroid[1]);
    return distA - distB;
  });
}
