import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth-utils';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  const { session } = await validateRequest();

  if (session) {
    await lucia.invalidateSession(session.id);
  }

  const cookieStore = await cookies();
  const blankCookie = lucia.createBlankSessionCookie();
  cookieStore.set(blankCookie.name, blankCookie.value, blankCookie.attributes);

  return NextResponse.json({ success: true });
}
