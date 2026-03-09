import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LOGO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663339762799/CRJ7dbQpAuuzkjiSmNTV9Z/aiteam-logo-XyYJ4JqTuoUA2MQxfVNvRB.webp";

export function VerifyOTPPage() {
  const { t, language, dir } = useLanguage();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify OTP');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }

      setResendTimer(60);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <a href="/auth/login" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 transition-colors">
          <BackArrow className="w-4 h-4" />
          {t('common.back')}
        </a>

        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === 'ar' ? 'التحقق من البريد الإلكتروني' : language === 'fr' ? 'Vérification email' : 'Email Verification'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'أدخل رمز التحقق المرسل إلى بريدك' : language === 'fr' ? 'Entrez le code envoyé à votre email' : 'Enter the code sent to your email'}
          </p>
          <p className="text-sm text-primary font-medium mt-2" dir="ltr">{email}</p>
        </div>

        {/* Card */}
        <div className="card-brand p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {language === 'ar' ? 'تم التحقق بنجاح' : language === 'fr' ? 'Vérifié avec succès' : 'Verified Successfully'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === 'ar' ? 'جاري إعادة التوجيه...' : language === 'fr' ? 'Redirection...' : 'Redirecting...'}
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                {/* OTP Code Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'ar' ? 'رمز التحقق' : language === 'fr' ? 'Code de vérification' : 'Verification Code'}
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-bold h-14 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
                    required
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'ar' ? 'أدخل الرمز المكون من 6 أرقام' : language === 'fr' ? 'Entrez le code à 6 chiffres' : 'Enter the 6-digit code'}
                  </p>
                </div>

                {/* Name Input (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'ar' ? 'الاسم (اختياري)' : language === 'fr' ? 'Nom (optionnel)' : 'Name (optional)'}
                  </label>
                  <Input
                    type="text"
                    placeholder={language === 'ar' ? 'أدخل اسمك' : language === 'fr' ? 'Votre nom' : 'Your name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full h-12 rounded-full font-semibold text-base btn-brand"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    language === 'ar' ? 'التحقق' : language === 'fr' ? 'Vérifier' : 'Verify'
                  )}
                </Button>
              </form>

              {/* Resend OTP */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  {language === 'ar' ? 'لم تستقبل الرمز؟' : language === 'fr' ? 'Pas reçu le code ?' : "Didn't receive the code?"}
                </p>
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="text-primary font-semibold hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed disabled:no-underline"
                >
                  {resendTimer > 0
                    ? `${language === 'ar' ? 'إعادة الإرسال في' : language === 'fr' ? 'Renvoyer dans' : 'Resend in'} ${resendTimer}s`
                    : language === 'ar' ? 'إعادة إرسال' : language === 'fr' ? 'Renvoyer' : 'Resend'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
