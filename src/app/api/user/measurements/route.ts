import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { bodyMeasurements } from '@/lib/schema';
import { generateId } from '@/lib/auth-utils';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db
    .select()
    .from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, user.id))
    .orderBy(desc(bodyMeasurements.date));

  return NextResponse.json({ measurements: rows });
}

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const row = await db.insert(bodyMeasurements).values({
    id: generateId(),
    userId: user.id,
    date: body.date,
    weightKg: body.weightKg,
    bodyFatPct: body.bodyFatPct,
    muscleMassPct: body.muscleMassPct,
    waistCm: body.waistCm,
    hipCm: body.hipCm,
    chestCm: body.chestCm,
    armCm: body.armCm,
    notes: body.notes,
  }).returning();

  return NextResponse.json({ measurement: row[0] }, { status: 201 });
}
