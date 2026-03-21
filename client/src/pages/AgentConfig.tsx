import { useParams, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Language, LANGUAGES } from '@/lib/i18n';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function AgentConfig() {
  const { pageId } = useParams<{ pageId: string }>();
  const { t, dir } = useLanguage();
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    agentName: 'AI Agent',
    personality: '',
    systemPrompt: '',
    responseLanguage: 'ar' as Language,
    maxTokens: 500,
    temperature: 0.7,
  });

  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Récupérer la configuration existante
  const { data: agentConfig, isLoading, refetch } = trpc.agent.getConfig.useQuery(
    { pageId: pageId || '' },
    { enabled: !!pageId }
  );

  // Mutation pour sauvegarder la configuration
  const saveConfigMutation = trpc.agent.saveConfig.useMutation({
    onSuccess: () => {
      toast.success(t('agent.saved'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  useEffect(() => {
    // Charger la configuration existante
    if (agentConfig) {
      setFormData({
        agentName: agentConfig.agentName || 'AI Agent',
        personality: agentConfig.personality || '',
        systemPrompt: agentConfig.systemPrompt || '',
        responseLanguage: (agentConfig.responseLanguage as Language) || 'ar',
        maxTokens: agentConfig.maxTokens || 500,
        temperature: agentConfig.temperature ? parseFloat(agentConfig.temperature as any) : 0.7,
      });
    }
  }, [agentConfig]);

  const handleSave = async () => {
    if (!pageId) {
      toast.error('Page ID is missing');
      return;
    }

    saveConfigMutation.mutate({
      pageId,
      agentName: formData.agentName,
      personality: formData.personality,
      systemPrompt: formData.systemPrompt,
      responseLanguage: formData.responseLanguage,
      maxTokens: formData.maxTokens,
      temperature: formData.temperature,
    });
  };

  const handleTest = async () => {
    if (!testMessage.trim()) {
      toast.error('Veuillez entrer un message de test');
      return;
    }

    setIsTesting(true);
    try {
      // Call the OpenAI API through the backend
      const response = await fetch('/api/trpc/agent.testMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            message: testMessage,
            systemPrompt: formData.systemPrompt,
            personality: formData.personality,
            language: formData.responseLanguage,
            maxTokens: formData.maxTokens,
            temperature: formData.temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setTestResponse(data.result?.response || 'No response received');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.error'));
      setTestResponse('');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" dir={dir}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:text-primary/80"
          >
            {dir === 'rtl' ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
            {t('common.back')}
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">{t('agent.title')}</h1>
        </div>

        {/* Configuration Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('agent.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('agent.agentName')}
              </label>
              <Input
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                placeholder="Mon Agent IA"
              />
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('agent.personality')}
              </label>
              <Textarea
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                placeholder={t('agent.personalityPlaceholder')}
                rows={4}
              />
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('agent.systemPrompt')}
              </label>
              <Textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder={t('agent.systemPromptPlaceholder')}
                rows={5}
              />
            </div>

            {/* Response Language */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('agent.responseLanguage')}
              </label>
              <Select value={formData.responseLanguage} onValueChange={(value) => setFormData({ ...formData, responseLanguage: value as Language })}>
                <SelectTrigger>
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

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('agent.maxTokens')}: {formData.maxTokens}
              </label>
              <Slider
                value={[formData.maxTokens]}
                onValueChange={(value) => setFormData({ ...formData, maxTokens: value[0] })}
                min={100}
                max={2000}
                step={100}
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('agent.temperature')}: {formData.temperature.toFixed(2)}
              </label>
              <Slider
                value={[formData.temperature]}
                onValueChange={(value) => setFormData({ ...formData, temperature: value[0] })}
                min={0}
                max={1}
                step={0.1}
              />
              <p className="text-xs text-slate-500 mt-2">{t('agent.temperatureHint')}</p>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              className="w-full" 
              size="lg"
              disabled={saveConfigMutation.isPending}
            >
              {saveConfigMutation.isPending ? t('common.loading') : t('agent.save')}
            </Button>
          </CardContent>
        </Card>

        {/* Test Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('agent.preview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('agent.testMessage')}
              </label>
              <Textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Entrez un message de test..."
                rows={3}
              />
            </div>

            <Button onClick={handleTest} disabled={isTesting || !pageId} className="w-full">
              {isTesting ? t('common.loading') : 'Tester'}
            </Button>

            {testResponse && (
              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">Réponse:</p>
                <p className="text-slate-900">{testResponse}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
