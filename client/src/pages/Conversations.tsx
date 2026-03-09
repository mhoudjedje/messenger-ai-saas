import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { arSA, fr, enUS } from 'date-fns/locale';

export default function Conversations() {
  const { t, dir, language } = useLanguage();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: conversations, isLoading } = trpc.messenger.getConversations.useQuery({
    limit: 50,
  });

  const dateLocale = language === 'ar' ? arSA : language === 'fr' ? fr : enUS;

  const filteredConversations = conversations?.filter(
    (conv) =>
      conv.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.psid.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" dir={dir}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <BackArrow className="w-4 h-4 me-2" />
          {t('common.backToDashboard')}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('conversations.title')}</h1>
          <p className="text-slate-600">{t('conversations.noConversations')}</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder={t('conversations.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('conversations.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">{t('common.loading')}</div>
            ) : filteredConversations.length > 0 ? (
              <div className="space-y-4">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/conversations/${conversation.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {conversation.senderName || 'Unknown'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {t('conversations.messageCount')}: {conversation.messageCount}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {t('conversations.lastMessage')}:{' '}
                        {conversation.lastMessageAt
                          ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
                              addSuffix: true,
                              locale: dateLocale,
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {conversation.senderLanguage?.toUpperCase()}
                      </span>
                      <Button variant="outline" size="sm">
                        {t('conversations.view')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">{t('conversations.noConversations')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
