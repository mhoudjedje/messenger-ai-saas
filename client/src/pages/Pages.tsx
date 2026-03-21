import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { FacebookOAuthButton } from '@/components/FacebookOAuthButton';
import { ConnectedPagesList } from '@/components/ConnectedPagesList';
import { ConnectPageManual } from '@/components/ConnectPageManual';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Pages() {
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const [, navigate] = useLocation();
  const [showManualEntry, setShowManualEntry] = useState(false);

  const translations = {
    ar: {
      title: 'صفحات Messenger',
      subtitle: 'قم بربط صفحات فيسبوك الخاصة بك لتفعيل الرد الآلي بالذكاء الاصطناعي',
      backToDashboard: 'العودة إلى لوحة التحكم',
      connectWithToken: 'ربط باستخدام Token',
      connectWithOAuth: 'ربط باستخدام OAuth',
    },
    fr: {
      title: 'Pages Messenger',
      subtitle: 'Connectez vos pages Facebook pour activer la réponse automatique par IA',
      backToDashboard: 'Retour au tableau de bord',
      connectWithToken: 'Connecter avec Token',
      connectWithOAuth: 'Connecter avec OAuth',
    },
    en: {
      title: 'Messenger Pages',
      subtitle: 'Connect your Facebook pages to enable AI-powered auto-reply',
      backToDashboard: 'Back to Dashboard',
      connectWithToken: 'Connect with Token',
      connectWithOAuth: 'Connect with OAuth',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
  const isRTL = language === 'ar';

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8" dir={dir}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-primary hover:text-primary/80"
          onClick={() => navigate('/dashboard')}
        >
          <BackArrow className="w-4 h-4 me-2" />
          {t.backToDashboard}
        </Button>

        {/* Header + Connect Buttons inline */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <FacebookOAuthButton
              onSuccess={() => {
                window.location.reload();
              }}
              onError={(error) => {
                console.error('OAuth error:', error);
              }}
            />
            <Button
              onClick={() => setShowManualEntry(!showManualEntry)}
              variant="outline"
              className={isRTL ? 'flex-row-reverse' : ''}
            >
              {showManualEntry ? t.connectWithOAuth : t.connectWithToken}
            </Button>
          </div>
        </div>

        {/* Manual Token Entry Form */}
        {showManualEntry && (
          <div className="mb-8">
            <ConnectPageManual
              onSuccess={() => {
                setShowManualEntry(false);
                window.location.reload();
              }}
            />
          </div>
        )}

        {/* Connected Pages List */}
        <ConnectedPagesList />
      </div>
    </div>
  );
}
