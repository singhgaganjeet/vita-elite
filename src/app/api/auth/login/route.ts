import { NextRequest, NextResponse } from 'next/server';
import { Argon2id } from 'oslo/password';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { lucia } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await new Argon2id().verify(user.hashedPassword, password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { headers: { 'Set-Cookie': sessionCookie.serialize() } }
    );
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
