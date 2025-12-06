'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/i18n';

export function RegisterForm() {
  const router = useRouter();
  const { language } = useAppStore();
  const { t, isRTL, dir } = useTranslation(language);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (password.length < 8) {
      setError(t('auth.errors.weakPassword'));
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('common.error'));
      } else {
        router.push('/auth/login?registered=true');
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"
    >
      <Card className="w-full max-w-md" padding="lg">
        {/* Header */}
        <div className={cn('text-center mb-8', isRTL && 'text-right')}>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-gray-400">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('auth.name')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'ar' ? 'أحمد محمد' : 'John Doe'}
            leftIcon={<User className="w-5 h-5" />}
            required
          />

          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            leftIcon={<Mail className="w-5 h-5" />}
            required
          />

          <Input
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
            helperText={language === 'ar' ? 'على الأقل 8 أحرف' : 'At least 8 characters'}
            required
          />

          <Input
            label={t('auth.confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-5 h-5" />}
            required
          />

          <label className={cn(
            'flex items-start gap-3 cursor-pointer',
            isRTL ? 'flex-row-reverse' : ''
          )}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
              required
            />
            <span className="text-sm text-gray-400">
              {language === 'ar' ? (
                <>
                  بالتسجيل، فإنك توافق على{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    شروط الخدمة
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    سياسة الخصوصية
                  </Link>
                </>
              ) : (
                <>
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </>
              )}
            </span>
          </label>

          <Button
            type="submit"
            variant="gradient"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={!agreedToTerms}
          >
            {t('auth.register')}
          </Button>
        </form>

        {/* Login Link */}
        <p className={cn(
          'mt-8 text-center text-gray-400',
          isRTL && 'text-right'
        )}>
          {t('auth.hasAccount')}{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary/80">
            {t('auth.login')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
