import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ConnectPageManualProps {
  onSuccess?: () => void;
}

export function ConnectPageManual({ onSuccess }: ConnectPageManualProps) {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const connectMutation = trpc.messenger.connectPageWithToken.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      setSuccessMessage(`✓ ${data.pageInfo.name} connected successfully!`);
      setToken('');
      
      // Success - page connected

      setTimeout(() => {
        setSuccessMessage(null);
        onSuccess?.();
      }, 2000);
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Connection error:', error);
    },
  });

  const handleConnect = async () => {
    if (!token.trim()) {
      return;
    }

    setIsLoading(true);
    connectMutation.mutate({ pageAccessToken: token.trim() });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">{t('pages.connectManually')}</CardTitle>
        <CardDescription>
          {t('pages.manualTokenDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        {connectMutation.isError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{connectMutation.error?.message || 'Connection failed'}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('pages.pageAccessToken')}</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your Facebook page access token here..."
            className="w-full h-24 p-3 border border-border rounded-lg font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            {t('pages.tokenHint')}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">{t('pages.howToGetToken')}</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:opacity-80">Graph API Explorer</a></li>
              <li>Select your app and page</li>
              <li>Generate a page access token</li>
              <li>Copy and paste it here</li>
            </ol>
          </div>
        </div>

        <Button
          onClick={handleConnect}
          disabled={isLoading || !token.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Page'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
