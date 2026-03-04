import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export function ConnectedPagesList() {
  const { language } = useLanguage();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const pagesQuery = trpc.oauth.getConnectedPages.useQuery();
  const disconnectMutation = trpc.oauth.disconnectPage.useMutation();
  const reconnectMutation = trpc.oauth.reconnectPage.useMutation();

  const translations = {
    ar: {
      title: 'الصفحات المتصلة',
      description: 'إدارة صفحات فيسبوك المتصلة بحسابك',
      noPages: 'لا توجد صفحات متصلة',
      noDescription: 'لم تقم بربط أي صفحة فيسبوك حتى الآن',
      active: 'نشطة',
      inactive: 'غير نشطة',
      connected: 'متصلة في',
      disconnect: 'قطع الاتصال',
      reconnect: 'إعادة الاتصال',
      deleteTitle: 'قطع اتصال الصفحة',
      deleteDescription: 'هل أنت متأكد من رغبتك في قطع اتصال هذه الصفحة؟ لن تتمكن من استقبال الرسائل من هذه الصفحة.',
      cancel: 'إلغاء',
      confirm: 'نعم، قطع الاتصال',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
    },
    fr: {
      title: 'Pages connectées',
      description: 'Gérez vos pages Facebook connectées',
      noPages: 'Aucune page connectée',
      noDescription: 'Vous n\'avez pas encore connecté de page Facebook',
      active: 'Active',
      inactive: 'Inactive',
      connected: 'Connectée le',
      disconnect: 'Déconnecter',
      reconnect: 'Reconnecter',
      deleteTitle: 'Déconnecter la page',
      deleteDescription: 'Êtes-vous sûr de vouloir déconnecter cette page? Vous ne pourrez plus recevoir de messages de cette page.',
      cancel: 'Annuler',
      confirm: 'Oui, déconnecter',
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
    },
    en: {
      title: 'Connected Pages',
      description: 'Manage your connected Facebook pages',
      noPages: 'No connected pages',
      noDescription: 'You haven\'t connected any Facebook pages yet',
      active: 'Active',
      inactive: 'Inactive',
      connected: 'Connected on',
      disconnect: 'Disconnect',
      reconnect: 'Reconnect',
      deleteTitle: 'Disconnect Page',
      deleteDescription: 'Are you sure you want to disconnect this page? You will no longer receive messages from this page.',
      cancel: 'Cancel',
      confirm: 'Yes, disconnect',
      loading: 'Loading...',
      error: 'An error occurred',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleDisconnect = async (pageId: string) => {
    try {
      await disconnectMutation.mutateAsync({ pageId });
      await pagesQuery.refetch();
      setIsDeleteDialogOpen(false);
      setSelectedPageId(null);
      toast.success('Page disconnected successfully');
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleReconnect = async (pageId: string) => {
    try {
      await reconnectMutation.mutateAsync({ pageId });
      await pagesQuery.refetch();
      toast.success('Page reconnected successfully');
    } catch (error) {
      toast.error(t.error);
    }
  };

  if (pagesQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const pages = pagesQuery.data?.pages || [];

  if (pages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-900">{t.noPages}</h3>
          <p className="text-sm text-gray-500 mt-1">{t.noDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map(page => (
            <div
              key={page.pageId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={page.isActive ? 'text-green-600' : 'text-gray-400'}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{page.pageName}</h4>
                  <p className="text-sm text-gray-500">
                    {t.connected} {new Date(page.connectedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US')}
                  </p>
                </div>
                <Badge variant={page.isActive ? 'default' : 'secondary'}>
                  {page.isActive ? t.active : t.inactive}
                </Badge>
              </div>
              <div className="flex gap-2">
                {page.isActive ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPageId(page.pageId);
                      setIsDeleteDialogOpen(true);
                    }}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t.disconnect}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReconnect(page.pageId)}
                    disabled={reconnectMutation.isPending}
                  >
                    {reconnectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t.reconnect
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className={language === 'ar' ? 'rtl' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPageId && handleDisconnect(selectedPageId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.confirm}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
