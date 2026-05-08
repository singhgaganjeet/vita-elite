import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';

export async function GET() {
  const { user, session } = await validateRequest();

  if (!user || !session) {
    return NextResponse.json({ user: null, session: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    session: { id: session.id, expiresAt: session.expiresAt },
  });
}
