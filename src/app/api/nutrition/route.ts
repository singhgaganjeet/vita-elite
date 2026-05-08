import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { nutritionLogs } from '@/lib/schema';
import { generateId } from '@/lib/auth-utils';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  const logs = await db
    .select()
    .from(nutritionLogs)
    .where(and(eq(nutritionLogs.userId, user.id), eq(nutritionLogs.date, date)));

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const row = await db.insert(nutritionLogs).values({
    id: generateId(),
    userId: user.id,
    date: body.date ?? new Date().toISOString().slice(0, 10),
    meal: body.meal,
    name: body.name,
    calories: body.calories,
    protein: body.protein ?? 0,
    carbs: body.carbs ?? 0,
    fat: body.fat ?? 0,
    portionGrams: body.portionGrams,
  }).returning();

  return NextResponse.json({ log: row[0] }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await db.delete(nutritionLogs).where(and(eq(nutritionLogs.id, id), eq(nutritionLogs.userId, user.id)));

  return NextResponse.json({ success: true });
}
