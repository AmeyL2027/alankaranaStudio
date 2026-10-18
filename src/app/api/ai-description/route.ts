
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { aiDescriptionInputSchema } from '@/lib/ai-validation';

export const runtime = 'nodejs';

function generateMockDescription(input: {
  name: string;
  category: string;
  details?: string;
}): string {
  const { name, category, details } = input;

  const categoryText = category.toLowerCase();

  const description = [
    `Discover ${name}, a beautiful addition to our ${categoryText} collection at Alankarana Studio.`,
    details?.trim()
      ? `Product details: ${details.trim()}.`
      : 'A lovely piece to complement your personal style.',
    'Review the details and personalize this description before publishing.',
  ].join(' ');

  return description.slice(0, 400);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication in both modes.
    const authHeader = request.headers.get('authorization');

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Sign in to generate descriptions.' },
        { status: 401 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.error('Supabase environment variables are missing.');

      return NextResponse.json(
        { error: 'Authentication service is not configured.' },
        { status: 503 }
      );
    }

    const authClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Session expired. Sign in again.' },
        { status: 401 }
      );
    }

    // 2. Validate the request.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request.' },
        { status: 400 }
      );
    }

    const parsed = aiDescriptionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            'Enter a valid name, category, and optional details.',
        },
        { status: 400 }
      );
    }

    // 3. Select mock or real AI mode.
    const useMock =
      process.env.ENABLE_MOCK_DESCRIPTIONS?.toLowerCase() === 'true';

    if (useMock) {
      const description = generateMockDescription(parsed.data);

      return NextResponse.json(
        {
          description,
          mode: 'mock',
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // 4. Anthropic mode: only require the API key here.
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not configured.');

      return NextResponse.json(
        {
          error:
            'Claude API is not configured. Add ANTHROPIC_API_KEY or enable mock mode.',
        },
        { status: 503 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
      timeout: 20000,
      maxRetries: 0,
    });

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 220,
      temperature: 0.4,
      system:
        'You write concise, appealing jewellery listings for a Canadian small business. ' +
        'Return only one plain-text description, maximum 400 characters. ' +
        'Use only product facts supplied by the seller. ' +
        'Never invent materials, gemstone authenticity, plating, dimensions, ' +
        'durability, certifications, origin, or benefits. ' +
        'If details are sparse, describe the style without asserting unsupported facts. ' +
        'No hashtags, emojis, or quotation marks.',
      messages: [
        {
          role: 'user',
          content:
            `Product name: ${parsed.data.name}\n` +
            `Category: ${parsed.data.category}\n` +
            `Seller-provided facts: ${parsed.data.details || 'None provided'}`,
        },
      ],
    });

    const description = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join(' ')
      .trim()
      .slice(0, 400);

    if (!description) {
      return NextResponse.json(
        {
          error: 'Claude returned an empty description. Try again.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        description,
        mode: 'anthropic',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error(
      'Description generation failed:',
      error instanceof Error ? error.name : 'unknown error'
    );

    return NextResponse.json(
      {
        error:
          'Could not generate a description right now. Please try again.',
      },
      { status: 502 }
    );
  }
}
