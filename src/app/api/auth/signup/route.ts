import { NextRequest, NextResponse } from 'next/server';
import { Argon2id } from 'oslo/password';
import { db } from '@/lib/db';
import { users, userProfiles } from '@/lib/schema';
import { lucia } from '@/lib/auth';
import { generateId } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role = 'user' } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check existing user
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hashedPassword = await new Argon2id().hash(password);
    const userId = generateId();

    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase(),
      hashedPassword,
      name,
      role: role as 'user' | 'coach' | 'admin',
    });

    // Create empty profile
    await db.insert(userProfiles).values({ id: generateId(), userId });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return NextResponse.json(
      { success: true, user: { id: userId, email: email.toLowerCase(), name, role } },
      {
        status: 201,
        headers: { 'Set-Cookie': sessionCookie.serialize() },
      }
    );
  } catch (err) {
    console.error('[signup]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
