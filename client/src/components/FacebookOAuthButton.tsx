import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FacebookOAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function FacebookOAuthButton({ onSuccess, onError }: FacebookOAuthButtonProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const translations = {
    ar: {
      button: 'ربط صفحة فيسبوك',
      title: 'ربط صفحة Messenger',
      description: 'اضغط على الزر أدناه للاتصال بحسابك على فيسبوك وتحديد الصفحات التي تريد ربطها',
      connect: 'الاتصال بفيسبوك',
      connecting: 'جاري الاتصال...',
      success: 'تم الاتصال بنجاح!',
      successMessage: 'تم ربط صفحتك بنجاح. يمكنك الآن استخدام الخدمة.',
      error: 'حدث خطأ',
      errorMessage: 'فشل الاتصال. يرجى المحاولة مرة أخرى.',
      close: 'إغلاق',
    },
    fr: {
      button: 'Connecter une page Facebook',
      title: 'Connecter une page Messenger',
      description: 'Cliquez sur le bouton ci-dessous pour vous connecter à votre compte Facebook et sélectionner les pages à connecter',
      connect: 'Se connecter à Facebook',
      connecting: 'Connexion en cours...',
      success: 'Connexion réussie!',
      successMessage: 'Votre page a été connectée avec succès. Vous pouvez maintenant utiliser le service.',
      error: 'Une erreur est survenue',
      errorMessage: 'La connexion a échoué. Veuillez réessayer.',
      close: 'Fermer',
    },
    en: {
      button: 'Connect Facebook Page',
      title: 'Connect Messenger Page',
      description: 'Click the button below to connect your Facebook account and select pages to connect',
      connect: 'Connect to Facebook',
      connecting: 'Connecting...',
      success: 'Connection successful!',
      successMessage: 'Your page has been connected successfully. You can now use the service.',
      error: 'An error occurred',
      errorMessage: 'Connection failed. Please try again.',
      close: 'Close',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleConnect = () => {
    try {
      setStatus('loading');

      // Open the Express OAuth route directly - this sets the state cookie
      // and redirects to Facebook properly with the correct redirect_uri
      const oauthUrl = `${window.location.origin}/api/oauth/facebook`;

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        oauthUrl,
        'facebook_oauth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) {
        setStatus('error');
        setMessage(language === 'ar' 
          ? 'تعذر فتح نافذة الاتصال. تحقق من إعدادات حظر النوافذ المنبثقة.'
          : 'Unable to open connection window. Check your popup blocker settings.');
        onError?.('Popup blocked');
        return;
      }

      // Monitor the popup window
      const checkPopup = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            // Give a moment for the callback to process
            setTimeout(() => {
              setStatus('success');
              setMessage(t.successMessage);
              onSuccess?.();
              setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
              }, 2000);
            }, 1000);
          }
        } catch (e) {
          // Cross-origin access error - popup is still on Facebook domain
        }
      }, 500);
    } catch (error) {
      console.error('OAuth error:', error);
      setStatus('error');
      setMessage(t.errorMessage);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        className={language === 'ar' ? 'rtl' : ''}
      >
        {t.button}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={language === 'ar' ? 'rtl' : ''}>
          <DialogHeader>
            <DialogTitle>{t.title}</DialogTitle>
            <DialogDescription>{t.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {status === 'idle' && (
              <Button
                onClick={handleConnect}
                className="w-full"
              >
                {t.connect}
              </Button>
            )}

            {status === 'loading' && (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.connecting}
              </Button>
            )}

            {status === 'success' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{t.success}</span>
                </div>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{t.error}</span>
                </div>
                <p className="text-sm text-gray-600">{message}</p>
                <Button
                  onClick={handleConnect}
                  variant="outline"
                  className="w-full"
                >
                  {t.connect}
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
            >
              {t.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
