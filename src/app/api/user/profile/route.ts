import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { userProfiles, users } from '@/lib/schema';
import { generateId } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  const userData = await db.select().from(users).where(eq(users.id, user.id)).get();

  return NextResponse.json({ profile, user: userData ? { id: userData.id, email: userData.email, name: userData.name, role: userData.role } : null });
}

export async function PUT(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Update name in users table if provided
  if (body.name) {
    await db.update(users).set({ name: body.name }).where(eq(users.id, user.id));
  }

  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();

  const profileData = {
    age: body.age,
    gender: body.gender,
    heightCm: body.heightCm,
    weightKg: body.weightKg,
    goalWeightKg: body.goalWeightKg,
    activityLevel: body.activityLevel,
    primaryGoal: body.primaryGoal,
    dietaryPreference: body.dietaryPreference,
    medicalConditions: body.medicalConditions ? JSON.stringify(body.medicalConditions) : undefined,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(userProfiles).set(profileData).where(eq(userProfiles.userId, user.id));
  } else {
    await db.insert(userProfiles).values({ id: generateId(), userId: user.id, ...profileData });
  }

  return NextResponse.json({ success: true });
}
