import { NextResponse } from 'next/server';
import { fetchAllAlerts } from '@/lib/datasources';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const alerts = await fetchAllAlerts();
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
