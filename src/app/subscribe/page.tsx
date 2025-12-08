import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/subscription/PricingCard';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Check } from 'lucide-react';

export const metadata = {
  title: 'Subscribe - OTAKU',
  description: 'Choose your subscription plan for premium 4K anime streaming',
};

export default async function SubscribePage() {
  const session = await auth();

  let currentTier: string | undefined;
  if (session?.user?.id) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    currentTier = subscription?.tier;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={session?.user} />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16 px-6 text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Premium Anime Streaming
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Experience anime like never before with stunning 4K quality and ultra-smooth 240fps playback.
              Choose the plan that&apos;s right for you.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <PricingSection currentTier={currentTier} />

        {/* Features Comparison */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Compare Plans
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-4 px-4 text-gray-400 font-medium">Feature</th>
                    <th className="py-4 px-4 text-center text-white font-medium">Basic</th>
                    <th className="py-4 px-4 text-center text-white font-medium">Premium</th>
                    <th className="py-4 px-4 text-center text-white font-medium">Ultimate</th>
                  </tr>
                </thead>
                <tbody>
                  <FeatureRow
                    feature="Video Quality"
                    basic="1080p"
                    premium="4K"
                    ultimate="4K 240fps"
                  />
                  <FeatureRow
                    feature="Monthly Downloads"
                    basic="10"
                    premium="50"
                    ultimate="Unlimited"
                  />
                  <FeatureRow
                    feature="Concurrent Streams"
                    basic="1"
                    premium="2"
                    ultimate="4"
                  />
                  <FeatureRow
                    feature="Ad-Free Experience"
                    basic={true}
                    premium={true}
                    ultimate={true}
                  />
                  <FeatureRow
                    feature="Early Access"
                    basic={false}
                    premium={true}
                    ultimate={true}
                  />
                  <FeatureRow
                    feature="Exclusive Content"
                    basic={false}
                    premium={false}
                    ultimate={true}
                  />
                  <FeatureRow
                    feature="VIP Support"
                    basic={false}
                    premium={false}
                    ultimate={true}
                  />
                  <FeatureRow
                    feature="Offline Viewing"
                    basic={true}
                    premium={true}
                    ultimate={true}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 bg-gray-800/30">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <FAQItem
                question="Can I change my plan later?"
                answer="Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly."
              />
              <FAQItem
                question="What payment methods do you accept?"
                answer="We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and various local payment methods depending on your region."
              />
              <FAQItem
                question="Is there a free trial?"
                answer="Yes! All plans come with a 7-day free trial. You won't be charged until the trial period ends, and you can cancel anytime."
              />
              <FAQItem
                question="What is 4K 240fps content?"
                answer="Our Ultimate plan includes specially enhanced anime content that plays at 4K resolution with 240 frames per second, providing incredibly smooth and detailed playback."
              />
              <FAQItem
                question="Can I download content for offline viewing?"
                answer="Yes, all plans include download capabilities. The number of downloads per month depends on your plan."
              />
              <FAQItem
                question="How do I cancel my subscription?"
                answer="You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Watching?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of anime fans enjoying premium 4K content.
            </p>
            <a
              href={session ? '#pricing' : '/auth/register'}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white text-lg hover:opacity-90 transition-opacity"
            >
              {session ? 'Choose Your Plan' : 'Start Free Trial'}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureRow({
  feature,
  basic,
  premium,
  ultimate,
}: {
  feature: string;
  basic: string | boolean;
  premium: string | boolean;
  ultimate: string | boolean;
}) {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <span className="text-gray-500">—</span>
      );
    }
    return <span className="text-white">{value}</span>;
  };

  return (
    <tr className="border-b border-gray-800">
      <td className="py-4 px-4 text-gray-300">{feature}</td>
      <td className="py-4 px-4 text-center">{renderValue(basic)}</td>
      <td className="py-4 px-4 text-center">{renderValue(premium)}</td>
      <td className="py-4 px-4 text-center">{renderValue(ultimate)}</td>
    </tr>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">{question}</h3>
      <p className="text-gray-400">{answer}</p>
    </div>
  );
}
