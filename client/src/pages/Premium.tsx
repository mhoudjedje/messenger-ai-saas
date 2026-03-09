import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Loader2, Check, Crown, Zap, Shield, ArrowLeft, ArrowRight,
  MessageSquare, Globe, BarChart3, Headphones, Sparkles
} from 'lucide-react';

const LOGO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663339762799/CRJ7dbQpAuuzkjiSmNTV9Z/aiteam-logo-XyYJ4JqTuoUA2MQxfVNvRB.webp";

type PlanType = 'pro' | 'enterprise';

export default function Premium() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { t, language, dir } = useLanguage();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  // Check if user already has active subscription
  const { data: subscription, isLoading: subLoading } = trpc.payments.getSubscription.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // If user already has active subscription, redirect to dashboard
  useEffect(() => {
    if (subscription && subscription.status !== 'free' && subscription.expiresAt) {
      const expiresAt = new Date(subscription.expiresAt);
      if (expiresAt > new Date()) {
        navigate('/dashboard');
      }
    }
  }, [subscription, navigate]);

  const handleChargilyPayment = async (plan: PlanType) => {
    setPaymentLoading(true);
    try {
      const response = await fetch('/api/payments/chargily/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planType: plan,
          planDuration: 'monthly',
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout');
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        toast.success(
          language === 'ar' ? 'تم فتح صفحة الدفع' :
          language === 'fr' ? 'Page de paiement ouverte' :
          'Payment page opened'
        );
      }
    } catch (error) {
      toast.error(
        language === 'ar' ? 'فشل في إنشاء جلسة الدفع' :
        language === 'fr' ? 'Échec de la création du paiement' :
        'Failed to create payment session'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleStripePayment = async (plan: PlanType) => {
    setPaymentLoading(true);
    try {
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planType: plan,
          planDuration: 'monthly',
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout');
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        toast.success(
          language === 'ar' ? 'تم فتح صفحة الدفع' :
          language === 'fr' ? 'Page de paiement ouverte' :
          'Payment page opened'
        );
      }
    } catch (error) {
      toast.error(
        language === 'ar' ? 'فشل في إنشاء جلسة الدفع' :
        language === 'fr' ? 'Échec de la création du paiement' :
        'Failed to create payment session'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const plans = [
    {
      id: 'pro' as PlanType,
      name: t('premium.pro'),
      price: t('premium.proPrice'),
      icon: Zap,
      popular: true,
      features: [
        { icon: MessageSquare, text: t('premium.proFeature1') },
        { icon: Globe, text: t('premium.proFeature2') },
        { icon: Globe, text: t('premium.proFeature3') },
        { icon: BarChart3, text: t('premium.proFeature4') },
      ],
    },
    {
      id: 'enterprise' as PlanType,
      name: t('premium.enterprise'),
      price: t('premium.enterprisePrice'),
      icon: Crown,
      popular: false,
      features: [
        { icon: MessageSquare, text: t('premium.enterpriseFeature1') },
        { icon: Globe, text: t('premium.enterpriseFeature2') },
        { icon: Globe, text: t('premium.enterpriseFeature3') },
        { icon: BarChart3, text: t('premium.enterpriseFeature4') },
        { icon: Headphones, text: t('premium.enterpriseFeature5') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={LOGO_IMG} alt="AITeam" className="h-9 w-9" />
              <span className="text-xl font-bold text-foreground">{t('landing.brand')}</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              <BackArrow className="h-4 w-4 me-2" />
              {t('common.back')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>{language === 'ar' ? 'اشتراك مميز' : language === 'fr' ? 'Abonnement Premium' : 'Premium Subscription'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
            {t('premium.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('premium.subtitle')}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative card-brand p-8 transition-all duration-300 cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 start-6 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {t('premium.popular')}
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${
                    plan.popular ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <plan.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-lg text-muted-foreground">{t('premium.currency')}</span>
                  <span className="text-muted-foreground">{t('premium.month')}</span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-foreground text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Payment Buttons */}
                <div className="space-y-3">
                  {/* Chargily (Algeria) */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChargilyPayment(plan.id);
                    }}
                    disabled={paymentLoading}
                    className="w-full h-12 rounded-full font-semibold btn-brand"
                  >
                    {paymentLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="h-5 w-5 me-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        {t('premium.payWithCard')}
                      </>
                    )}
                  </Button>

                  {/* Stripe (International) */}
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStripePayment(plan.id);
                    }}
                    disabled={paymentLoading}
                    className="w-full h-12 rounded-full font-semibold border-2"
                  >
                    {paymentLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="h-5 w-5 me-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        {t('premium.payInternational')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span className="text-sm">{t('premium.guarantee')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
