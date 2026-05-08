/**
 * Run with: npx tsx scripts/seed.ts
 * Seeds demo accounts: admin, coach, and regular user
 */
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { users, userProfiles, coachProfiles } from '../src/lib/schema';
import * as schema from '../src/lib/schema';

// oslo Argon2id — dynamic import for ESM
async function hashPassword(password: string): Promise<string> {
  const { Argon2id } = await import('oslo/password');
  return new Argon2id().hash(password);
}

function generateId(length = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (const byte of bytes) id += chars[byte % chars.length];
  return id;
}

async function main() {
  const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  const db = drizzle(client, { schema });

  const seeds = [
    { email: 'demo@vitaelite.com',  password: 'Demo@123',  name: 'Priya Sharma', role: 'user'  as const },
    { email: 'coach@vitaelite.com', password: 'Coach@123', name: 'Arjun Mehta',  role: 'coach' as const },
    { email: 'admin@vitaelite.com', password: 'Admin@123', name: 'Super Admin',  role: 'admin' as const },
  ];

  for (const seed of seeds) {
    // Check if already exists
    const existing = await db.select().from(users).where(
      (await import('drizzle-orm')).eq(users.email, seed.email)
    ).get();

    if (existing) {
      console.log(`⏭  ${seed.email} already exists`);
      continue;
    }

    const hashedPassword = await hashPassword(seed.password);
    const userId = generateId();

    await db.insert(users).values({
      id: userId,
      email: seed.email,
      hashedPassword,
      name: seed.name,
      role: seed.role,
    });

    await db.insert(userProfiles).values({ id: generateId(), userId });

    if (seed.role === 'coach') {
      await db.insert(coachProfiles).values({
        id: generateId(),
        userId,
        bio: 'Certified personal trainer with 8 years of experience specializing in strength and conditioning.',
        tagline: 'Transform your body, transform your life',
        specialization: 'Strength & Conditioning',
        experience: 8,
        pricePerSession: 1500,
        availability: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        isApproved: true,
        isActive: true,
      });
    }

    console.log(`✅ Created ${seed.role}: ${seed.email}`);
  }

  console.log('\nSeeding complete!');
  client.close();
}

main().catch(console.error);
