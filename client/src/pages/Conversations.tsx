import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Search, MessageSquare, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background p-6 sm:p-8" dir={dir}>
      <div className="max-w-6xl mx-auto">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('conversations.title')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'تتبع جميع المحادثات مع عملائك' :
             language === 'fr' ? 'Suivez toutes les conversations avec vos clients' :
             'Track all conversations with your customers'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute start-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t('conversations.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10 h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
          />
        </div>

        {/* Conversations List */}
        <div className="card-brand overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground">{t('conversations.title')}</h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/conversations/${conversation.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {conversation.senderName || 'Unknown'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('conversations.messageCount')}: {conversation.messageCount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {conversation.lastMessageAt
                            ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                addSuffix: true,
                                locale: dateLocale,
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {conversation.senderLanguage?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <MessageSquare className="h-7 w-7 text-primary" />
                </div>
                <p className="text-muted-foreground">{t('conversations.noConversations')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
