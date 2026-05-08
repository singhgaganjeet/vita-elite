import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { coachProfiles, users } from '@/lib/schema';
import { generateId } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const profile = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, user.id)).get();
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  if (body.name) {
    await db.update(users).set({ name: body.name }).where(eq(users.id, user.id));
  }

  const existing = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, user.id)).get();

  const profileData = {
    bio: body.bio,
    tagline: body.tagline,
    specialization: body.specialization,
    experience: body.experience,
    pricePerSession: body.pricePerSession,
    availability: body.availability ? JSON.stringify(body.availability) : undefined,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(coachProfiles).set(profileData).where(eq(coachProfiles.userId, user.id));
  } else {
    await db.insert(coachProfiles).values({ id: generateId(), userId: user.id, ...profileData });
  }

  return NextResponse.json({ success: true });
}
