import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
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

  const getLoginUrlQuery = trpc.oauth.getLoginUrl.useQuery();

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

  const handleConnect = async () => {
    try {
      setStatus('loading');
      
      // Appeler la query pour obtenir l'URL
      const result = getLoginUrlQuery.data;
      
      if (!result?.url) {
        // Refetch si les données ne sont pas disponibles
        await getLoginUrlQuery.refetch();
        return;
      }

      if (result.url) {
        // Ouvrir la page de connexion Facebook dans une nouvelle fenêtre
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          result.url,
          'facebook_oauth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          setStatus('error');
          setMessage('Impossible d\'ouvrir la fenêtre de connexion. Vérifiez vos paramètres de popup.');
          onError?.('Popup blocked');
          return;
        }

        // Vérifier si la fenêtre est fermée
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            // La connexion est terminée, attendre un peu avant de fermer le dialog
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
        }, 500);
      }
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
              disabled={getLoginUrlQuery.isLoading}
              className="w-full"
            >
              {getLoginUrlQuery.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.connecting}
                  </>
                ) : (
                  t.connect
                )}
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
                  disabled={getLoginUrlQuery.isLoading}
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
