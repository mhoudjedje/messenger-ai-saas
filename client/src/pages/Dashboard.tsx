import { useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare, Users, Clock, CreditCard, ArrowLeft, ArrowRight,
  Settings, BarChart3, FileText, Loader2, Zap, LogOut
} from 'lucide-react';
import { useLocation } from 'wouter';

const LOGO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663339762799/CRJ7dbQpAuuzkjiSmNTV9Z/aiteam-logo-XyYJ4JqTuoUA2MQxfVNvRB.webp";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t, language, dir } = useLanguage();
  const { hasAccess, loading: subLoading, status: subStatus } = useSubscription();
  const [, navigate] = useLocation();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  // Redirect to premium if no active subscription
  useEffect(() => {
    if (!authLoading && !subLoading && user && !hasAccess) {
      navigate('/premium');
    }
  }, [authLoading, subLoading, user, hasAccess, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
    }
  }, [authLoading, user, navigate]);

  // Fetch data
  const { data: pages, isLoading: pagesLoading } = trpc.messenger.getPages.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: conversations } = trpc.messenger.getConversations.useQuery(
    { limit: 5 },
    { enabled: !!user }
  );

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const totalMessages = conversations?.reduce((sum, conv) => sum + conv.messageCount, 0) || 0;
  const avgResponseTime = conversations?.length
    ? Math.round(conversations.reduce((sum, conv) => sum + conv.avgResponseTime, 0) / conversations.length)
    : 0;

  const stats = [
    {
      title: t('dashboard.activePages'),
      value: pages?.length || 0,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: t('dashboard.totalMessages'),
      value: totalMessages,
      icon: MessageSquare,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: t('dashboard.avgResponseTime'),
      value: `${avgResponseTime}ms`,
      icon: Clock,
      color: 'bg-violet-500/10 text-violet-600',
    },
    {
      title: t('dashboard.subscriptionStatus'),
      value: subStatus === 'free' ? 'Free' : subStatus === 'pro' ? 'Pro' : 'Enterprise',
      icon: CreditCard,
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  const quickActions = [
    { label: t('pages.connectNew'), icon: Zap, path: '/pages', primary: true },
    { label: t('conversations.title'), icon: MessageSquare, path: '/conversations' },
    { label: t('analytics.title'), icon: BarChart3, path: '/analytics' },
    { label: t('settings.title'), icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                // If user has subscription, go to dashboard, otherwise go to home
                if (user && hasAccess) {
                  window.location.href = '/dashboard';
                } else {
                  window.location.href = '/';
                }
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src={LOGO_IMG} alt="AITeam" className="h-8 w-8" />
              <span className="text-lg font-bold text-foreground">{t('landing.brand')}</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.name || user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.welcome')}, {user.name || user.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.title')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card-brand p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                  <div className={`p-2 rounded-xl ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages Section */}
          <div className="lg:col-span-2">
            <div className="card-brand overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{t('pages.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('pages.connected')}</p>
                  </div>
                  <Button
                    size="sm"
                    className="btn-brand"
                    onClick={() => navigate('/pages')}
                  >
                    {t('pages.connectNew')}
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {pagesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  </div>
                ) : pages && pages.length > 0 ? (
                  <div className="space-y-3">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{page.pageName}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{page.pageId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              page.isActive
                                ? 'bg-primary/10 text-primary'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {page.isActive ? t('pages.active') : t('pages.inactive')}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => navigate(`/pages/${page.pageId}`)}
                          >
                            {t('pages.configure')}
                            <ArrowIcon className="h-3 w-3 ms-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-4">{t('pages.noPages')}</p>
                    <Button className="btn-brand" onClick={() => navigate('/pages')}>
                      {t('pages.connectNew')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-brand p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h2>
            <div className="space-y-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={i}
                    variant={action.primary ? 'default' : 'outline'}
                    className={`w-full justify-start h-12 rounded-xl ${action.primary ? 'btn-brand' : ''}`}
                    onClick={() => navigate(action.path)}
                  >
                    <Icon className="h-4 w-4 me-3" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
