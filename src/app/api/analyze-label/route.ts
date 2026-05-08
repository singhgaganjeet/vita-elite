import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 500 });
  }

  let imageBase64: string;
  let mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
  let goals: string[];

  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mediaType = body.mediaType ?? 'image/jpeg';
    goals = Array.isArray(body.goals) ? body.goals : [];
    if (!imageBase64) throw new Error('Missing imageBase64');
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const goalsText = goals.length > 0 ? goals.join(', ') : 'general health';

  const prompt = `You are a professional nutritionist analyzing a food packaging / nutrition facts label.

Extract ALL visible nutritional information from this image and return a detailed health assessment.

User's health goals: ${goalsText}

Return ONLY valid JSON in exactly this structure (no markdown, no explanation):
{
  "productName": "product name from packaging or 'Scanned Product' if not visible",
  "servingSize": "serving size as shown on label",
  "healthScore": number between 1-10 (10 = excellent, 1 = very unhealthy),
  "calories": number (per serving, 0 if not found),
  "protein": number in grams (0 if not found),
  "carbs": number in grams (0 if not found),
  "sugar": number in grams (0 if not found),
  "fat": number in grams (0 if not found),
  "saturatedFat": number in grams (0 if not found),
  "sodium": number in milligrams (0 if not found),
  "fibre": number in grams (0 if not found),
  "redFlags": ["list of health concerns — e.g. 'High sodium — 820mg per serving', 'Contains trans fat'"],
  "positives": ["list of nutritional strengths — e.g. 'Good protein source — 18g', 'Low in sugar'"],
  "ingredients": "first 200 characters of ingredients list if visible, empty string otherwise",
  "verdict": "2-3 sentence plain-English verdict on whether this is a healthy product and why",
  "goalVerdict": "1-2 sentences on how this product fits or conflicts with the user's stated goals: ${goalsText}"
}

Health score guide:
- 8-10: Minimally processed, high protein/fibre, low sugar/sodium/saturated fat
- 5-7: Moderate — acceptable occasionally, some concerns
- 1-4: High sugar/sodium/saturated fat or trans fat present — limit or avoid

If the image is not a nutrition label, return: { "error": "Image does not appear to be a nutrition label. Please photograph the Nutrition Facts panel on the packaging." }`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Analysis failed: ${msg}` }, { status: 500 });
  }
}
