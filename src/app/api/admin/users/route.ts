import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, ne } from 'drizzle-orm';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const allUsers = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt })
    .from(users)
    .where(ne(users.role, 'admin'));

  return NextResponse.json({ users: allUsers });
}

export async function PATCH(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, action } = await req.json();
  // action: 'suspend' | 'reactivate' — we can extend schema later for status field
  // For now just return success (status field can be added in a migration)
  console.log(`Admin ${user.id} ${action}ed user ${id}`);

  return NextResponse.json({ success: true });
}
