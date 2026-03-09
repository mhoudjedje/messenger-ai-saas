import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Clock, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  const [, navigate] = useLocation();

  // Obtenir les pages Messenger
  const { data: pages, isLoading: pagesLoading } = trpc.messenger.getPages.useQuery();

  // Obtenir les conversations
  const { data: conversations } = trpc.messenger.getConversations.useQuery({ limit: 5 });

  if (!user) {
    return null;
  }

  const stats = [
    {
      title: t('dashboard.activePages'),
      value: pages?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: t('dashboard.totalMessages'),
      value: conversations?.reduce((sum, conv) => sum + conv.messageCount, 0) || 0,
      icon: MessageSquare,
      color: 'bg-green-500',
    },
    {
      title: t('dashboard.avgResponseTime'),
      value: conversations?.length
        ? `${Math.round(conversations.reduce((sum, conv) => sum + conv.avgResponseTime, 0) / conversations.length)}ms`
        : '0ms',
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      title: t('dashboard.subscriptionStatus'),
      value: 'Active',
      icon: CreditCard,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" dir={dir}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {t('dashboard.welcome')}, {user.name}
          </h1>
          <p className="text-slate-600">{t('dashboard.title')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('pages.title')}</CardTitle>
              <CardDescription>{t('pages.connected')}</CardDescription>
            </CardHeader>
            <CardContent>
              {pagesLoading ? (
                <div className="text-center py-8">{t('common.loading')}</div>
              ) : pages && pages.length > 0 ? (
                <div className="space-y-4">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{page.pageName}</h3>
                        <p className="text-sm text-slate-500">{page.pageId}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            page.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {page.isActive ? t('pages.active') : t('pages.inactive')}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/pages/${page.pageId}`)}
                        >
                          {t('pages.configure')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-4">{t('pages.noPages')}</p>
                  <Button onClick={() => navigate('/pages')}>{t('pages.connectNew')}</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => navigate('/pages')}
              >
                {t('pages.connectNew')}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/conversations')}
              >
                {t('conversations.title')}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/analytics')}
              >
                {t('analytics.title')}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/settings')}
              >
                {t('settings.title')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
