import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { bookings, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await db
    .select({
      booking: bookings,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .where(eq(bookings.coachId, user.id))
    .orderBy(desc(bookings.date));

  return NextResponse.json({ bookings: rows });
}

export async function PATCH(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, status, notes } = await req.json();

  await db.update(bookings).set({ status, notes }).where(eq(bookings.id, id));

  return NextResponse.json({ success: true });
}
