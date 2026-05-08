import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { coachProfiles, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const coaches = await db
    .select({
      profile: coachProfiles,
      name: users.name,
      email: users.email,
    })
    .from(coachProfiles)
    .leftJoin(users, eq(coachProfiles.userId, users.id));

  return NextResponse.json({ coaches });
}

export async function PATCH(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { coachId, action } = await req.json();

  if (action === 'approve') {
    await db.update(coachProfiles).set({ isApproved: true }).where(eq(coachProfiles.userId, coachId));
  } else if (action === 'reject') {
    await db.update(coachProfiles).set({ isApproved: false, isActive: false }).where(eq(coachProfiles.userId, coachId));
  }

  return NextResponse.json({ success: true });
}
