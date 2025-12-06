import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateStreamToken, getActiveStreamCount } from '@/lib/streaming';
import { canAccessQuality } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { episodeId, quality } = await request.json();

    if (!episodeId || !quality) {
      return NextResponse.json(
        { error: 'Episode ID and quality are required' },
        { status: 400 }
      );
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      );
    }

    // Check quality access
    if (!canAccessQuality(subscription.tier, quality)) {
      return NextResponse.json(
        { error: 'Upgrade your plan to access this quality' },
        { status: 403 }
      );
    }

    // Check concurrent stream limit
    const tierLimits: Record<string, number> = {
      TRIAL: 1,
      BASIC: 1,
      PREMIUM: 2,
      ULTIMATE: 4,
    };

    const activeStreams = await getActiveStreamCount(session.user.id);
    const limit = tierLimits[subscription.tier] || 1;

    if (activeStreams >= limit) {
      return NextResponse.json(
        { error: 'Maximum concurrent streams reached' },
        { status: 429 }
      );
    }

    // Get IP and user agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generate stream token
    const token = await generateStreamToken(
      session.user.id,
      episodeId,
      quality,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Stream token error:', error);
    return NextResponse.json(
      { error: 'Failed to generate stream token' },
      { status: 500 }
    );
  }
}
