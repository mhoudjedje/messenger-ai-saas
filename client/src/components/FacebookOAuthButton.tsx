import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Facebook } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface FacebookOAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function FacebookOAuthButton({
  onSuccess,
  onError,
  className = '',
  variant = 'default',
  size = 'default',
}: FacebookOAuthButtonProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    ar: {
      connect: 'ربط صفحة فيسبوك',
      connecting: 'جاري الاتصال...',
      success: 'تم ربط الصفحة بنجاح!',
      successPages: (count: number) => `تم ربط ${count} صفحة بنجاح!`,
      error: 'فشل الاتصال. يرجى المحاولة مرة أخرى.',
      popupBlocked: 'تعذر فتح نافذة الاتصال. تحقق من إعدادات حظر النوافذ المنبثقة.',
    },
    fr: {
      connect: 'Connecter une page Facebook',
      connecting: 'Connexion en cours...',
      success: 'Page connectée avec succès!',
      successPages: (count: number) => `${count} page(s) connectée(s) avec succès!`,
      error: 'La connexion a échoué. Veuillez réessayer.',
      popupBlocked: 'Impossible d\'ouvrir la fenêtre. Vérifiez vos paramètres de popup.',
    },
    en: {
      connect: 'Connect Facebook Page',
      connecting: 'Connecting...',
      success: 'Page connected successfully!',
      successPages: (count: number) => `${count} page(s) connected successfully!`,
      error: 'Connection failed. Please try again.',
      popupBlocked: 'Unable to open window. Check your popup blocker settings.',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Listen for postMessage from the OAuth popup
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'OAUTH_CALLBACK') return;

      setIsLoading(false);

      if (event.data.success) {
        const count = event.data.pagesCount || 0;
        toast.success(count > 0 ? t.successPages(count) : t.success);
        onSuccess?.();
      } else {
        const errorMsg = event.data.error || 'unknown';
        toast.error(t.error);
        onError?.(errorMsg);
      }
    },
    [t, onSuccess, onError]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const handleConnect = () => {
    setIsLoading(true);

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
      setIsLoading(false);
      toast.error(t.popupBlocked);
      onError?.('Popup blocked');
      return;
    }

    // Monitor popup close (in case user closes it manually)
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        // Give a moment for the postMessage to arrive
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    }, 500);
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t.connecting}
        </>
      ) : (
        <>
          <Facebook className="h-4 w-4" />
          {t.connect}
        </>
      )}
    </Button>
  );
}
