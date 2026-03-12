import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Globe, Settings2, BarChart3, Link2, Sparkles, ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HERO_PHONE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663339762799/CRJ7dbQpAuuzkjiSmNTV9Z/hero-phone-mockup-G2o4RCDamfyq9n4fxUE9M7.webp";
const LOGO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663339762799/CRJ7dbQpAuuzkjiSmNTV9Z/aiteam-logo-XyYJ4JqTuoUA2MQxfVNvRB.webp";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { t, dir } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src={LOGO_IMG} alt="AITeam" className="h-9 w-9" />
              <span className="text-xl font-bold text-foreground">{t('landing.brand')}</span>
            </button>
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/auth/login")}
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    {t('landing.login')}
                  </Button>
                  <Button
                    onClick={() => navigate("/auth/signup")}
                    className="btn-brand text-sm"
                  >
                    {t('landing.signup')}
                  </Button>
                </>
              )}
              {isAuthenticated && (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="btn-brand text-sm"
                >
                  {t('common.dashboard')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Messenger AI Replier</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                {t('landing.heroTitle')}
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                {t('landing.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => isAuthenticated ? navigate("/dashboard") : navigate("/auth/signup")}
                  size="lg"
                  className="btn-brand text-base px-10 py-6"
                >
                  {isAuthenticated ? t('common.dashboard') : t('landing.cta')}
                  <ArrowIcon className="h-5 w-5 ms-2" />
                </Button>
              </div>

              {/* Social Proof Stats */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">{t('landing.businesses')}</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-foreground">50K+</div>
                  <div className="text-sm text-muted-foreground">{t('landing.messagesHandled')}</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-sm text-muted-foreground">{t('landing.uptime')}</div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
                <img
                  src={HERO_PHONE_IMG}
                  alt="AITeam Bot Chat"
                  className="relative w-72 sm:w-80 lg:w-96 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('landing.feature1Title').split(' ')[0]}... {t('landing.feature3Title').split(' ')[0]}...
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.heroSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: t('landing.feature1Title'), desc: t('landing.feature1Desc'), color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Globe, title: t('landing.feature2Title'), desc: t('landing.feature2Desc'), color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Settings2, title: t('landing.feature3Title'), desc: t('landing.feature3Desc'), color: 'text-violet-500', bg: 'bg-violet-50' },
              { icon: BarChart3, title: t('landing.feature4Title'), desc: t('landing.feature4Desc'), color: 'text-blue-500', bg: 'bg-blue-50' },
            ].map((feature, i) => (
              <div key={i} className="card-brand p-6 hover:shadow-lg transition-shadow duration-300 group">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-dark py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('landing.howItWorks')}
            </h2>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">
              {t('landing.heroSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', icon: Link2, title: t('landing.step1Title'), desc: t('landing.step1Desc') },
              { num: '02', icon: Settings2, title: t('landing.step2Title'), desc: t('landing.step2Desc') },
              { num: '03', icon: Sparkles, title: t('landing.step3Title'), desc: t('landing.step3Desc') },
            ].map((step, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-5xl font-extrabold text-primary/30 mb-4">{step.num}</div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 text-primary mb-4">
                  <step.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="opacity-70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card-brand p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="relative">
              <img src={LOGO_IMG} alt="AITeam" className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t('landing.cta')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {t('landing.heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAuthenticated && (
                  <>
                    <Button
                      onClick={() => navigate("/auth/signup")}
                      size="lg"
                      className="btn-brand text-base px-10 py-6"
                    >
                      {t('landing.signup')}
                      <ArrowIcon className="h-5 w-5 ms-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/auth/login")}
                      className="rounded-full px-10 py-6 text-base border-2"
                    >
                      {t('landing.login')}
                    </Button>
                  </>
                )}
                {isAuthenticated && (
                  <Button
                    onClick={() => navigate("/dashboard")}
                    size="lg"
                    className="btn-brand text-base px-10 py-6"
                  >
                    {t('common.dashboard')}
                    <ArrowIcon className="h-5 w-5 ms-2" />
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{t('premium.guarantee')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={LOGO_IMG} alt="AITeam" className="h-6 w-6" />
              <span className="text-sm font-medium text-foreground">{t('landing.brand')}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('landing.footer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
