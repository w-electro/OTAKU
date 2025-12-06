'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/i18n';

export function LoginForm() {
  const router = useRouter();
  const { language } = useAppStore();
  const { t, isRTL, dir } = useTranslation(language);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('auth.errors.invalidCredentials'));
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch {
      setError(t('common.error'));
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
            {t('auth.loginTitle')}
          </h1>
          <p className="text-gray-400">{t('auth.loginSubtitle')}</p>
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
            required
          />

          <div className={cn(
            'flex items-center justify-between',
            isRTL ? 'flex-row-reverse' : ''
          )}>
            <label className={cn(
              'flex items-center gap-2 cursor-pointer',
              isRTL ? 'flex-row-reverse' : ''
            )}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-400">{t('auth.rememberMe')}</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary/80"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            variant="gradient"
            fullWidth
            size="lg"
            isLoading={isLoading}
          >
            {t('auth.login')}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-800 text-gray-400">
              {t('auth.orContinueWith')}
            </span>
          </div>
        </div>

        {/* Social Login */}
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="lg"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          leftIcon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          {t('auth.google')}
        </Button>

        {/* Register Link */}
        <p className={cn(
          'mt-8 text-center text-gray-400',
          isRTL && 'text-right'
        )}>
          {t('auth.noAccount')}{' '}
          <Link href="/auth/register" className="text-primary hover:text-primary/80">
            {t('auth.register')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
