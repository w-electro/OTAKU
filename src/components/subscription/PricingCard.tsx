'use client';

import React from 'react';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { SubscriptionTier } from '@/types';

interface PricingCardProps {
  tier: SubscriptionTier;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  language?: 'en' | 'ar';
  onSelect?: () => void;
  isLoading?: boolean;
}

export function PricingCard({
  tier,
  isCurrentPlan = false,
  isPopular = false,
  language = 'en',
  onSelect,
  isLoading = false,
}: PricingCardProps) {
  const isRTL = language === 'ar';

  const tierIcons: Record<string, React.ReactNode> = {
    basic: <Star className="w-8 h-8" />,
    premium: <Zap className="w-8 h-8" />,
    ultimate: <Crown className="w-8 h-8" />,
  };

  const tierColors: Record<string, string> = {
    basic: 'from-blue-500 to-cyan-500',
    premium: 'from-purple-500 to-pink-500',
    ultimate: 'from-yellow-500 to-orange-500',
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isPopular && 'ring-2 ring-primary scale-105',
        isRTL && 'text-right'
      )}
      padding="lg"
      hover
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-0 right-0">
          <Badge
            variant="primary"
            className={cn(
              'rounded-none rounded-bl-lg',
              isRTL ? 'right-auto left-0 rounded-bl-none rounded-br-lg' : ''
            )}
          >
            {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className={cn(
        'flex items-center gap-4 mb-6',
        isRTL ? 'flex-row-reverse' : ''
      )}>
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br text-white',
          tierColors[tier.id]
        )}>
          {tierIcons[tier.id]}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
          <p className="text-gray-400 text-sm">
            {language === 'ar'
              ? tier.id === 'basic'
                ? 'مثالية للمشاهدين العاديين'
                : tier.id === 'premium'
                ? 'لعشاق الأنمي المتفانين'
                : 'تجربة المشاهدة المثالية'
              : tier.id === 'basic'
              ? 'Perfect for casual viewers'
              : tier.id === 'premium'
              ? 'For dedicated anime fans'
              : 'The ultimate viewing experience'
            }
          </p>
        </div>
      </div>

      {/* Price */}
      <div className={cn('mb-6', isRTL ? 'text-right' : '')}>
        <div className={cn(
          'flex items-baseline gap-1',
          isRTL ? 'flex-row-reverse justify-end' : ''
        )}>
          <span className="text-4xl font-bold text-white">${tier.price}</span>
          <span className="text-gray-400">
            /{language === 'ar' ? 'شهر' : 'month'}
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, index) => (
          <li
            key={index}
            className={cn(
              'flex items-center gap-3 text-gray-300',
              isRTL ? 'flex-row-reverse' : ''
            )}
          >
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        variant={isPopular ? 'gradient' : 'secondary'}
        fullWidth
        size="lg"
        onClick={onSelect}
        disabled={isCurrentPlan || isLoading}
        isLoading={isLoading}
      >
        {isCurrentPlan
          ? language === 'ar'
            ? 'الخطة الحالية'
            : 'Current Plan'
          : language === 'ar'
          ? 'اختر هذه الخطة'
          : 'Choose Plan'
        }
      </Button>

      {/* Current Plan Indicator */}
      {isCurrentPlan && (
        <p className="mt-4 text-center text-sm text-primary">
          {language === 'ar'
            ? 'أنت مشترك حالياً في هذه الخطة'
            : "You're currently subscribed to this plan"
          }
        </p>
      )}
    </Card>
  );
}

// Pricing Section Component
interface PricingSectionProps {
  currentTier?: string;
  language?: 'en' | 'ar';
  onSelectTier?: (tierId: string) => void;
  isLoading?: boolean;
}

export function PricingSection({
  currentTier,
  language = 'en',
  onSelectTier,
  isLoading = false,
}: PricingSectionProps) {
  const isRTL = language === 'ar';

  const tiers: SubscriptionTier[] = [
    {
      id: 'basic',
      name: language === 'ar' ? 'الأساسية' : 'Basic',
      price: 9.99,
      currency: 'USD',
      downloadLimit: 10,
      quality: ['1080p'],
      concurrentStreams: 1,
      features: language === 'ar'
        ? [
            'بث بجودة 1080p',
            '10 تحميلات شهرياً',
            'بث على جهاز واحد',
            'دعم قياسي',
          ]
        : [
            '1080p streaming quality',
            '10 downloads per month',
            'Stream on 1 device',
            'Standard support',
          ],
    },
    {
      id: 'premium',
      name: language === 'ar' ? 'المميزة' : 'Premium',
      price: 19.99,
      currency: 'USD',
      downloadLimit: 50,
      quality: ['1080p', '4K'],
      concurrentStreams: 2,
      features: language === 'ar'
        ? [
            'بث بجودة 4K',
            '50 تحميل شهرياً',
            'بث على جهازين',
            'دعم ذو أولوية',
            'الوصول المبكر للإصدارات',
          ]
        : [
            '4K streaming quality',
            '50 downloads per month',
            'Stream on 2 devices',
            'Priority support',
            'Early access to releases',
          ],
    },
    {
      id: 'ultimate',
      name: language === 'ar' ? 'النهائية' : 'Ultimate',
      price: 29.99,
      currency: 'USD',
      downloadLimit: -1,
      quality: ['1080p', '4K', '4K240'],
      concurrentStreams: 4,
      features: language === 'ar'
        ? [
            'بث بجودة 4K 240fps',
            'تحميلات غير محدودة',
            'بث على 4 أجهزة',
            'دعم VIP',
            'محتوى حصري',
            'بدون إعلانات',
          ]
        : [
            '4K 240fps streaming',
            'Unlimited downloads',
            'Stream on 4 devices',
            'VIP support',
            'Exclusive content',
            'No advertisements',
          ],
    },
  ];

  return (
    <section className="py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'ar' ? 'اختر خطتك' : 'Choose Your Plan'}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {language === 'ar'
              ? 'افتح محتوى الأنمي المميز بجودة 4K و 240fps'
              : 'Unlock premium 4K 240fps anime content'
            }
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isCurrentPlan={currentTier === tier.id.toUpperCase()}
              isPopular={tier.id === 'premium'}
              language={language}
              onSelect={() => onSelectTier?.(tier.id)}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Trial Notice */}
        <p className="text-center mt-8 text-gray-400">
          {language === 'ar'
            ? 'جميع الخطط تتضمن تجربة مجانية لمدة 7 أيام'
            : 'All plans include a 7-day free trial'
          }
        </p>
      </div>
    </section>
  );
}
