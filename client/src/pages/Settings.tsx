import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Globe, Clock, Bell, Save } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Language, LANGUAGES } from '@/lib/i18n';

export default function Settings() {
  const { t, dir, language, setLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const [timezone, setTimezone] = useState('Africa/Algiers');
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('');

  const handleSaveSettings = () => {
    toast.success(t('settings.save'));
  };

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8" dir={dir}>
      <div className="max-w-3xl mx-auto">
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
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة تفضيلاتك' : language === 'fr' ? 'Gérez vos préférences' : 'Manage your preferences'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Language Settings */}
          <div className="card-brand p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t('settings.language')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('settings.language')}
                </label>
                <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                  <SelectTrigger className="max-w-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LANGUAGES).map(([code, lang]) => (
                      <SelectItem key={code} value={code}>
                        {lang.nativeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'اللغة المختارة ستطبق على كامل الواجهة' :
                 language === 'fr' ? 'La langue sélectionnée s\'appliquera à toute l\'interface' :
                 'The selected language will apply to the entire interface'}
              </p>
            </div>
          </div>

          {/* Timezone Settings */}
          <div className="card-brand p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t('settings.timezone')}</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('settings.timezone')}
              </label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="max-w-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Algiers">Africa/Algiers (GMT+1)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card-brand p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t('settings.notifications')}</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    {t('settings.emailNotifications')}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' ? 'استقبل إشعارات بالبريد الإلكتروني' :
                     language === 'fr' ? 'Recevez des notifications par email' :
                     'Receive email notifications'}
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              {emailNotifications && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'ar' ? 'بريد الإشعارات' : language === 'fr' ? 'Email de notification' : 'Notification Email'}
                  </label>
                  <Input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="max-w-md h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
                    dir="ltr"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <Button
            size="lg"
            className="btn-brand px-8"
            onClick={handleSaveSettings}
          >
            <Save className="w-4 h-4 me-2" />
            {t('settings.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
