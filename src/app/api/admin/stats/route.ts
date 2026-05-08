import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { users, bookings, coachProfiles } from '@/lib/schema';
import { eq, count } from 'drizzle-orm';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [totalUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'user'));
  const [totalCoaches] = await db.select({ count: count() }).from(users).where(eq(users.role, 'coach'));
  const [totalBookings] = await db.select({ count: count() }).from(bookings);
  const [pendingCoaches] = await db.select({ count: count() }).from(coachProfiles).where(eq(coachProfiles.isApproved, false));

  return NextResponse.json({
    stats: {
      totalUsers: totalUsers.count,
      totalCoaches: totalCoaches.count,
      totalBookings: totalBookings.count,
      pendingCoaches: pendingCoaches.count,
    },
  });
}
