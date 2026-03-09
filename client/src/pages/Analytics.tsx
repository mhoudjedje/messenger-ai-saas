import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BarChart3, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Analytics() {
  const { t, dir, language } = useLanguage();
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState('7days');
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  const { data: conversations } = trpc.messenger.getConversations.useQuery({ limit: 100 });

  const totalMessages = conversations?.reduce((sum, conv) => sum + conv.messageCount, 0) || 0;
  const avgResponseTime = conversations?.length
    ? Math.round(conversations.reduce((sum, conv) => sum + conv.avgResponseTime, 0) / conversations.length)
    : 0;

  // Sample chart data
  const messagesPerDay = [
    { day: 'Mon', messages: 45 },
    { day: 'Tue', messages: 52 },
    { day: 'Wed', messages: 48 },
    { day: 'Thu', messages: 61 },
    { day: 'Fri', messages: 55 },
    { day: 'Sat', messages: 42 },
    { day: 'Sun', messages: 38 },
  ];

  const responseTimeData = [
    { time: '0-100ms', count: 120 },
    { time: '100-500ms', count: 85 },
    { time: '500-1s', count: 45 },
    { time: '1s+', count: 20 },
  ];

  const languageData = [
    { name: 'العربية', value: 65 },
    { name: 'Français', value: 20 },
    { name: 'English', value: 15 },
  ];

  const COLORS = ['oklch(0.696 0.17 162.48)', '#8b5cf6', '#f59e0b'];

  const summaryStats = [
    { label: language === 'ar' ? 'إجمالي الرسائل' : language === 'fr' ? 'Total messages' : 'Total Messages', value: totalMessages || 270, icon: MessageSquare },
    { label: language === 'ar' ? 'متوسط وقت الرد' : language === 'fr' ? 'Temps de réponse' : 'Avg Response', value: `${avgResponseTime || 245}ms`, icon: Clock },
    { label: language === 'ar' ? 'إجمالي المحادثات' : language === 'fr' ? 'Total conversations' : 'Total Conversations', value: conversations?.length || 42, icon: BarChart3 },
    { label: language === 'ar' ? 'نسبة النجاح' : language === 'fr' ? 'Taux de succès' : 'Success Rate', value: '98%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8" dir={dir}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-primary hover:text-primary/80"
          onClick={() => navigate('/dashboard')}
        >
          <BackArrow className="w-4 h-4 me-2" />
          {t('common.backToDashboard')}
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('analytics.title')}</h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'تتبع أداء الوكيل الذكي' :
               language === 'fr' ? 'Suivez les performances de votre agent IA' :
               'Track your AI agent performance'}
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t('analytics.last7Days')}</SelectItem>
              <SelectItem value="30days">{t('analytics.last30Days')}</SelectItem>
              <SelectItem value="all">{t('analytics.allTime')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card-brand p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages Per Day */}
          <div className="card-brand p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">{t('analytics.messagesPerDay')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messagesPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="messages" fill="oklch(0.696 0.17 162.48)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Response Time Distribution */}
          <div className="card-brand p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">{t('analytics.responseTime')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Languages Distribution */}
          <div className="card-brand p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">{t('analytics.topLanguages')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={4}
                >
                  {languageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Card */}
          <div className="card-brand p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {language === 'ar' ? 'ملخص الأداء' : language === 'fr' ? 'Résumé des performances' : 'Performance Summary'}
            </h3>
            <div className="space-y-5">
              {summaryStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-secondary">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
