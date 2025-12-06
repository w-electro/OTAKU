import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe, createCustomer, createCheckoutSession, SUBSCRIPTION_PRICES } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { tier } = await request.json();

    if (!tier || !SUBSCRIPTION_PRICES[tier.toUpperCase()]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      const customer = await createCustomer(
        user!.email,
        user?.name || undefined
      );

      customerId = customer.id;

      // Update subscription with customer ID
      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const priceId = SUBSCRIPTION_PRICES[tier.toUpperCase()];

    const checkoutSession = await createCheckoutSession(
      customerId,
      priceId,
      `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/subscribe?cancelled=true`
    );

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
