import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock, ArrowLeft } from 'lucide-react';

type Language = 'ar' | 'fr' | 'en';

export function VerifyOTPPage() {
  const language: Language = (localStorage.getItem('language') || 'ar') as Language;
  const isRTL = language === 'ar';
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // Get email from URL params
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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <a href="/auth/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة
        </a>

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">التحقق من البريد الإلكتروني</h1>
          <p className="text-gray-600">أدخل رمز التحقق المرسل إلى بريدك الإلكتروني</p>
          <p className="text-sm text-gray-500 mt-2">{email}</p>
        </div>

        {/* Main Card */}
        <Card className="p-8 shadow-lg">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">تم التحقق بنجاح</h3>
              <p className="text-gray-600 text-sm">جاري إعادة التوجيه إلى لوحة التحكم...</p>
            </div>
          ) : (
            <>
              {/* OTP Verification Form */}
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {/* OTP Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز التحقق
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-bold"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">أدخل الرمز المكون من 6 أرقام</p>
                </div>

                {/* Name Input (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم (اختياري)
                  </label>
                  <Input
                    type="text"
                    placeholder="أدخل اسمك (اختياري)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full h-11 rounded-full font-semibold"
                >
                  {loading ? 'جاري التحقق...' : 'التحقق'}
                </Button>
              </form>

              {/* Resend OTP */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">لم تستقبل الرمز؟</p>
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="text-blue-600 font-semibold hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `إعادة الإرسال في ${resendTimer}s` : 'إعادة إرسال'}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
