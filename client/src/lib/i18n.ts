export type Language = 'ar' | 'fr' | 'en';

export const LANGUAGES: Record<Language, { name: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
};

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.pages': 'الصفحات',
    'nav.conversations': 'المحادثات',
    'nav.analytics': 'الإحصائيات',
    'nav.settings': 'الإعدادات',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',

    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'أهلا وسهلا',
    'dashboard.activePages': 'الصفحات النشطة',
    'dashboard.totalMessages': 'إجمالي الرسائل',
    'dashboard.avgResponseTime': 'متوسط وقت الرد',
    'dashboard.subscriptionStatus': 'حالة الاشتراك',

    // Pages
    'pages.title': 'صفحات Messenger',
    'pages.connected': 'الصفحات المتصلة',
    'pages.connectNew': 'ربط صفحة جديدة',
    'pages.noPages': 'لم تقم بربط أي صفحات حتى الآن',
    'pages.pageName': 'اسم الصفحة',
    'pages.pageId': 'معرف الصفحة',
    'pages.status': 'الحالة',
    'pages.active': 'نشط',
    'pages.inactive': 'غير نشط',
    'pages.actions': 'الإجراءات',
    'pages.configure': 'تكوين',
    'pages.disconnect': 'قطع الاتصال',

    // Agent Configuration
    'agent.title': 'تكوين الوكيل الذكي',
    'agent.agentName': 'اسم الوكيل',
    'agent.personality': 'الشخصية والسلوك',
    'agent.personalityPlaceholder': 'صف شخصية الوكيل وكيف يجب أن يتفاعل...',
    'agent.systemPrompt': 'التعليمات النظامية',
    'agent.systemPromptPlaceholder': 'أدخل التعليمات المفصلة للوكيل...',
    'agent.responseLanguage': 'لغة الرد',
    'agent.maxTokens': 'الحد الأقصى للرموز',
    'agent.temperature': 'درجة الإبداع',
    'agent.temperatureHint': 'من 0 (دقيق) إلى 1 (إبداعي)',
    'agent.preview': 'معاينة',
    'agent.testMessage': 'اختبر الوكيل برسالة',
    'agent.save': 'حفظ التكوين',
    'agent.saved': 'تم حفظ التكوين بنجاح',

    // Conversations
    'conversations.title': 'المحادثات',
    'conversations.noConversations': 'لا توجد محادثات حتى الآن',
    'conversations.senderName': 'اسم المرسل',
    'conversations.messageCount': 'عدد الرسائل',
    'conversations.lastMessage': 'آخر رسالة',
    'conversations.language': 'اللغة',
    'conversations.view': 'عرض',
    'conversations.search': 'ابحث عن محادثة...',

    // Analytics
    'analytics.title': 'الإحصائيات',
    'analytics.messagesPerDay': 'الرسائل يوميا',
    'analytics.responseTime': 'وقت الرد',
    'analytics.topLanguages': 'أكثر اللغات استخداما',
    'analytics.period': 'الفترة الزمنية',
    'analytics.last7Days': 'آخر 7 أيام',
    'analytics.last30Days': 'آخر 30 يوم',
    'analytics.allTime': 'كل الوقت',

    // Subscription
    'subscription.title': 'الاشتراك',
    'subscription.plan': 'الخطة الحالية',
    'subscription.status': 'الحالة',
    'subscription.active': 'نشط',
    'subscription.trialing': 'فترة تجريبية',
    'subscription.canceled': 'ملغى',
    'subscription.messagesUsed': 'الرسائل المستخدمة',
    'subscription.messagesLimit': 'حد الرسائل الشهري',
    'subscription.upgrade': 'ترقية',
    'subscription.manage': 'إدارة الاشتراك',

    // Settings
    'settings.title': 'الإعدادات',
    'settings.language': 'اللغة',
    'settings.timezone': 'المنطقة الزمنية',
    'settings.notifications': 'الإشعارات',
    'settings.emailNotifications': 'إشعارات البريد الإلكتروني',
    'settings.save': 'حفظ الإعدادات',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.close': 'إغلاق',
    'common.back': 'رجوع',
    'common.backToDashboard': 'العودة إلى لوحة التحكم',
    'dashboard.quickActions': 'إجراءات سريعة',
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.pages': 'Pages',
    'nav.conversations': 'Conversations',
    'nav.analytics': 'Statistiques',
    'nav.settings': 'Paramètres',
    'nav.profile': 'Profil',
    'nav.logout': 'Déconnexion',

    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue',
    'dashboard.activePages': 'Pages actives',
    'dashboard.totalMessages': 'Messages totaux',
    'dashboard.avgResponseTime': 'Temps de réponse moyen',
    'dashboard.subscriptionStatus': 'Statut d\'abonnement',

    // Pages
    'pages.title': 'Pages Messenger',
    'pages.connected': 'Pages connectées',
    'pages.connectNew': 'Connecter une nouvelle page',
    'pages.noPages': 'Vous n\'avez pas encore connecté de pages',
    'pages.pageName': 'Nom de la page',
    'pages.pageId': 'ID de la page',
    'pages.status': 'Statut',
    'pages.active': 'Actif',
    'pages.inactive': 'Inactif',
    'pages.actions': 'Actions',
    'pages.configure': 'Configurer',
    'pages.disconnect': 'Déconnecter',

    // Agent Configuration
    'agent.title': 'Configuration de l\'agent IA',
    'agent.agentName': 'Nom de l\'agent',
    'agent.personality': 'Personnalité et comportement',
    'agent.personalityPlaceholder': 'Décrivez la personnalité de l\'agent et comment il doit interagir...',
    'agent.systemPrompt': 'Instructions système',
    'agent.systemPromptPlaceholder': 'Entrez les instructions détaillées pour l\'agent...',
    'agent.responseLanguage': 'Langue de réponse',
    'agent.maxTokens': 'Nombre maximum de jetons',
    'agent.temperature': 'Degré de créativité',
    'agent.temperatureHint': 'De 0 (précis) à 1 (créatif)',
    'agent.preview': 'Aperçu',
    'agent.testMessage': 'Testez l\'agent avec un message',
    'agent.save': 'Enregistrer la configuration',
    'agent.saved': 'Configuration enregistrée avec succès',

    // Conversations
    'conversations.title': 'Conversations',
    'conversations.noConversations': 'Pas de conversations pour le moment',
    'conversations.senderName': 'Nom de l\'expéditeur',
    'conversations.messageCount': 'Nombre de messages',
    'conversations.lastMessage': 'Dernier message',
    'conversations.language': 'Langue',
    'conversations.view': 'Afficher',
    'conversations.search': 'Rechercher une conversation...',

    // Analytics
    'analytics.title': 'Statistiques',
    'analytics.messagesPerDay': 'Messages par jour',
    'analytics.responseTime': 'Temps de réponse',
    'analytics.topLanguages': 'Langues les plus utilisées',
    'analytics.period': 'Période',
    'analytics.last7Days': '7 derniers jours',
    'analytics.last30Days': '30 derniers jours',
    'analytics.allTime': 'Tout le temps',

    // Subscription
    'subscription.title': 'Abonnement',
    'subscription.plan': 'Plan actuel',
    'subscription.status': 'Statut',
    'subscription.active': 'Actif',
    'subscription.trialing': 'Période d\'essai',
    'subscription.canceled': 'Annulé',
    'subscription.messagesUsed': 'Messages utilisés',
    'subscription.messagesLimit': 'Limite mensuelle de messages',
    'subscription.upgrade': 'Mettre à niveau',
    'subscription.manage': 'Gérer l\'abonnement',

    // Settings
    'settings.title': 'Paramètres',
    'settings.language': 'Langue',
    'settings.timezone': 'Fuseau horaire',
    'settings.notifications': 'Notifications',
    'settings.emailNotifications': 'Notifications par email',
    'settings.save': 'Enregistrer les paramètres',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.backToDashboard': 'Retour au tableau de bord',
    'dashboard.quickActions': 'Actions rapides',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.pages': 'Pages',
    'nav.conversations': 'Conversations',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.activePages': 'Active Pages',
    'dashboard.totalMessages': 'Total Messages',
    'dashboard.avgResponseTime': 'Average Response Time',
    'dashboard.subscriptionStatus': 'Subscription Status',

    // Pages
    'pages.title': 'Messenger Pages',
    'pages.connected': 'Connected Pages',
    'pages.connectNew': 'Connect New Page',
    'pages.noPages': 'You haven\'t connected any pages yet',
    'pages.pageName': 'Page Name',
    'pages.pageId': 'Page ID',
    'pages.status': 'Status',
    'pages.active': 'Active',
    'pages.inactive': 'Inactive',
    'pages.actions': 'Actions',
    'pages.configure': 'Configure',
    'pages.disconnect': 'Disconnect',

    // Agent Configuration
    'agent.title': 'AI Agent Configuration',
    'agent.agentName': 'Agent Name',
    'agent.personality': 'Personality and Behavior',
    'agent.personalityPlaceholder': 'Describe the agent\'s personality and how it should interact...',
    'agent.systemPrompt': 'System Instructions',
    'agent.systemPromptPlaceholder': 'Enter detailed instructions for the agent...',
    'agent.responseLanguage': 'Response Language',
    'agent.maxTokens': 'Maximum Tokens',
    'agent.temperature': 'Creativity Level',
    'agent.temperatureHint': 'From 0 (precise) to 1 (creative)',
    'agent.preview': 'Preview',
    'agent.testMessage': 'Test the agent with a message',
    'agent.save': 'Save Configuration',
    'agent.saved': 'Configuration saved successfully',

    // Conversations
    'conversations.title': 'Conversations',
    'conversations.noConversations': 'No conversations yet',
    'conversations.senderName': 'Sender Name',
    'conversations.messageCount': 'Message Count',
    'conversations.lastMessage': 'Last Message',
    'conversations.language': 'Language',
    'conversations.view': 'View',
    'conversations.search': 'Search conversation...',

    // Analytics
    'analytics.title': 'Analytics',
    'analytics.messagesPerDay': 'Messages Per Day',
    'analytics.responseTime': 'Response Time',
    'analytics.topLanguages': 'Top Languages',
    'analytics.period': 'Period',
    'analytics.last7Days': 'Last 7 Days',
    'analytics.last30Days': 'Last 30 Days',
    'analytics.allTime': 'All Time',

    // Subscription
    'subscription.title': 'Subscription',
    'subscription.plan': 'Current Plan',
    'subscription.status': 'Status',
    'subscription.active': 'Active',
    'subscription.trialing': 'Trial Period',
    'subscription.canceled': 'Canceled',
    'subscription.messagesUsed': 'Messages Used',
    'subscription.messagesLimit': 'Monthly Message Limit',
    'subscription.upgrade': 'Upgrade',
    'subscription.manage': 'Manage Subscription',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.timezone': 'Timezone',
    'settings.notifications': 'Notifications',
    'settings.emailNotifications': 'Email Notifications',
    'settings.save': 'Save Settings',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.backToDashboard': 'Back to Dashboard',
    'dashboard.quickActions': 'Quick Actions',
  },
};

export function t(key: string, language: Language): string {
  return translations[language]?.[key] || key;
}
