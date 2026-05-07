import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured.' },
      { status: 500 }
    );
  }

  let imageBase64: string;
  let mediaType: 'image/jpeg' | 'image/png' | 'image/webp';

  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mediaType = body.mediaType ?? 'image/jpeg';
    if (!imageBase64) throw new Error('Missing imageBase64');
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const prompt = `You are a professional nutritionist and food analyst. Analyze this food photo and identify every food item visible on the plate or in the bowl.

For each item, estimate:
- The food name (be specific — e.g. "steamed white rice" not just "rice")
- Portion size in grams (visual estimate)
- Calories
- Protein (g)
- Carbohydrates (g)
- Fat (g)

Also compute totals across all items.

Respond ONLY with valid JSON in exactly this shape (no markdown, no explanation):
{
  "foods": [
    {
      "name": "string",
      "portion": "string (e.g. '1 cup (~180g)')",
      "portionGrams": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "healthNotes": "string (2–3 sentences: overall balance, any concerns, suggestions)",
  "mealType": "string (best guess: Breakfast / Lunch / Dinner / Snacks)"
}

If you cannot identify any food (blurry image, not food, etc.), return:
{ "error": "brief explanation" }`;

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
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Analysis failed: ${msg}` }, { status: 500 });
  }
}
