import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

export default function Analytics() {
  const { t, dir } = useLanguage();
  const [period, setPeriod] = useState('7days');

  const { data: conversations } = trpc.messenger.getConversations.useQuery({ limit: 100 });

  // Préparer les données pour les graphiques
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
    { time: '500-1000ms', count: 45 },
    { time: '1000+ms', count: 20 },
  ];

  const languageData = [
    { name: 'العربية', value: 65, color: '#3b82f6' },
    { name: 'Français', value: 20, color: '#10b981' },
    { name: 'English', value: 15, color: '#f59e0b' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" dir={dir}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('analytics.title')}</h1>
          <p className="text-slate-600">{t('analytics.title')}</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t('analytics.last7Days')}</SelectItem>
              <SelectItem value="30days">{t('analytics.last30Days')}</SelectItem>
              <SelectItem value="all">{t('analytics.allTime')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages Per Day */}
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.messagesPerDay')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={messagesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Response Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.responseTime')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Languages Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.topLanguages')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-slate-600">Total Messages</span>
                <span className="text-2xl font-bold text-slate-900">270</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-slate-600">Average Response Time</span>
                <span className="text-2xl font-bold text-slate-900">245ms</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-slate-600">Total Conversations</span>
                <span className="text-2xl font-bold text-slate-900">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Success Rate</span>
                <span className="text-2xl font-bold text-green-600">98%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
