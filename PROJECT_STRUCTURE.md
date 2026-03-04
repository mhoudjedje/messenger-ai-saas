# Messenger AI Automation SaaS - Architecture Complète

## 🎯 Vue d'ensemble du projet

Plateforme SaaS d'automatisation Messenger avec agent IA multilingue (Arabe/Français/Anglais), gestion des abonnements Stripe, et OAuth Meta.

---

## 📊 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND REACT (Client)                      │
│  - Dashboard multilingue RTL (Arabe/Français/Anglais)           │
│  - Tableau de bord, Configuration Agent, Conversations, Analytics│
│  - Intégration OAuth Facebook                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND NODE.JS + tRPC                        │
│  - Webhooks Messenger (réception des messages)                  │
│  - Webhooks Stripe (gestion des paiements)                      │
│  - Endpoints OAuth Meta (connexion des pages)                   │
│  - Procédures tRPC (API typée)                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES EXTERNES                             │
│  - OpenAI GPT-4o (génération de réponses IA)                    │
│  - Meta Messenger API (envoi/réception de messages)             │
│  - Stripe API (gestion des abonnements)                         │
│  - AWS S3 (stockage des fichiers média)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BASE DE DONNÉES MySQL                          │
│  - Users, Messenger Pages, Agent Configs, Conversations         │
│  - Messages, Subscriptions, User Preferences                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Endpoints HTTP

### Webhooks Messenger
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/webhook` | GET | Vérification du webhook Messenger (validation Meta) |
| `/api/webhook` | POST | Réception des messages Messenger en temps réel |

### OAuth Meta
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/oauth/facebook` | GET | Initie le flux OAuth (redirection vers Facebook) |
| `/api/oauth/facebook/callback` | GET | Callback OAuth (reçoit le code, échange les tokens) |
| `/api/oauth/disconnect/:pageId` | GET | Déconnecte une page Facebook |

### Webhooks Stripe
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/stripe/webhook` | POST | Reçoit les événements Stripe (paiements, abonnements) |

### API tRPC
| Route | Type | Description |
|-------|------|-------------|
| `/api/trpc/oauth.getLoginUrl` | Query | Obtient l'URL de connexion OAuth |
| `/api/trpc/oauth.getConnectedPages` | Query | Liste les pages connectées |
| `/api/trpc/oauth.getPageDetails` | Query | Détails d'une page spécifique |
| `/api/trpc/oauth.disconnectPage` | Mutation | Déconnecte une page |
| `/api/trpc/oauth.reconnectPage` | Mutation | Réactive une page |
| `/api/trpc/oauth.getOAuthStatus` | Query | Statut global OAuth |
| `/api/trpc/messenger.getPages` | Query | Pages Messenger de l'utilisateur |
| `/api/trpc/messenger.getConversations` | Query | Conversations récentes |
| `/api/trpc/agent.getConfig` | Query | Configuration de l'agent IA |
| `/api/trpc/agent.updateConfig` | Mutation | Mise à jour de la configuration |
| `/api/trpc/subscription.createCheckout` | Mutation | Crée une session Stripe Checkout |
| `/api/trpc/subscription.getStatus` | Query | Statut de l'abonnement |

---

## 🎨 Pages Frontend

### Accès aux pages

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `/dashboard` | Page d'accueil avec statistiques |
| **Configuration Agent** | `/agent-config` | Configuration de l'agent IA par page |
| **Conversations** | `/conversations` | Historique des conversations |
| **Analytics** | `/analytics` | Graphiques et statistiques |
| **Settings** | `/settings` | Préférences utilisateur (langue, timezone) |

### Liens d'accès complets

```
Frontend: https://3000-iqscq7wm3agmyk6o4dctz-6031a390.us2.manus.computer

Dashboard:          https://3000-iqscq7wm3agmyk6o4dctz-6031a390.us2.manus.computer/dashboard
Agent Config:       https://3000-iqscq7wm3agmyk6o4dctz-6031a390.us2.manus.computer/agent-config
Conversations:      https://3000-iqscq7wm3agmyk6o4dctz-6031a390.us2.manus.computer/conversations
Analytics:          https://3000-iqscq7wm3agmyk6o4dctz-6031a390.us2.manus.computer/analytics
Settings:           https://3000-iqscq7wm3agmyk6o4dctz-6031a390.us2.manus.computer/settings
```

---

## 📁 Structure des fichiers Backend

```
server/
├── _core/
│   ├── index.ts                    # Point d'entrée du serveur
│   ├── context.ts                  # Contexte tRPC (authentification)
│   ├── trpc.ts                     # Configuration tRPC
│   ├── messenger-webhook.ts        # Routes webhook Messenger
│   ├── oauth-routes.ts             # Routes OAuth Meta
│   ├── stripe-webhook.ts           # Routes webhook Stripe
│   ├── llm.ts                      # Intégration OpenAI
│   └── env.ts                      # Variables d'environnement
│
├── routers/
│   ├── messenger.ts                # Procédures tRPC Messenger
│   ├── agent.ts                    # Procédures tRPC Agent
│   ├── subscription.ts             # Procédures tRPC Subscription
│   └── oauth.ts                    # Procédures tRPC OAuth
│
├── db.ts                           # Helpers de base de données
├── messenger.ts                    # Utilitaires Messenger API
├── openai-helper.ts                # Utilitaires OpenAI GPT-4o
├── meta-oauth.ts                   # Utilitaires OAuth Meta
├── automation-engine.ts            # Moteur d'automatisation
├── stripe-products.ts              # Configuration des plans Stripe
└── routers.ts                      # Routeur principal
```

---

## 📁 Structure des fichiers Frontend

```
client/src/
├── pages/
│   ├── Dashboard.tsx               # Page d'accueil
│   ├── AgentConfig.tsx             # Configuration de l'agent
│   ├── Conversations.tsx           # Historique des conversations
│   ├── Analytics.tsx               # Graphiques et statistiques
│   └── Settings.tsx                # Préférences utilisateur
│
├── components/
│   ├── FacebookOAuthButton.tsx      # Bouton de connexion OAuth
│   ├── ConnectedPagesList.tsx       # Liste des pages connectées
│   ├── DashboardLayout.tsx          # Layout principal
│   └── ui/                          # Composants shadcn/ui
│
├── contexts/
│   └── LanguageContext.tsx          # Contexte multilingue (i18n)
│
├── lib/
│   ├── i18n.ts                     # Configuration i18n
│   └── trpc.ts                     # Client tRPC
│
├── App.tsx                         # Routes principales
└── main.tsx                        # Point d'entrée
```

---

## 🗄️ Schéma Base de Données

```
users
├── id (PK)
├── openId (unique)
├── name, email
├── role (user/admin)
└── timestamps

messenger_pages
├── id (PK)
├── userId (FK)
├── pageId (unique)
├── pageName
├── pageAccessToken (encrypted)
├── isActive
└── timestamps

agent_configs
├── id (PK)
├── userId (FK)
├── pageId (FK)
├── agentName
├── personality
├── systemPrompt
├── responseLanguage (ar/fr/en)
├── responseRules (JSON)
├── maxTokens, temperature
└── timestamps

conversations
├── id (PK)
├── userId (FK)
├── pageId (FK)
├── psid (Page-scoped user ID)
├── senderName
├── senderLanguage
├── messageCount
├── avgResponseTime
└── timestamps

messages
├── id (PK)
├── conversationId (FK)
├── userId (FK)
├── pageId (FK)
├── psid (FK)
├── messageId (unique)
├── senderType (user/agent)
├── content
├── contentType (text/image/video/file)
├── mediaUrl
├── language
├── responseTime
└── timestamps

subscriptions
├── id (PK)
├── userId (FK)
├── stripeCustomerId
├── stripeSubscriptionId
├── planType (free/pro/enterprise)
├── status (active/trialing/canceled)
├── messagesUsed, messagesLimit
└── timestamps

user_preferences
├── id (PK)
├── userId (FK, unique)
├── preferredLanguage (ar/fr/en)
├── timezone
├── emailNotifications
└── timestamps
```

---

## 🔄 Flux d'Automatisation Messenger

```
1. Message reçu sur Messenger
   ↓
2. Webhook Messenger reçoit le message (/api/webhook POST)
   ↓
3. Vérification de la signature (validation Meta)
   ↓
4. Vérification de l'abonnement utilisateur (actif/limites)
   ↓
5. Détection automatique de la langue (Arabe/Français/Anglais)
   ↓
6. Appel à OpenAI GPT-4o avec contexte personnalisé
   ↓
7. Stockage du message et de la réponse en base de données
   ↓
8. Envoi de la réponse via Messenger Send API
   ↓
9. Mise à jour des statistiques (temps de réponse, compteur messages)
```

---

## 💳 Flux de Paiement Stripe

```
1. Utilisateur clique sur "S'abonner"
   ↓
2. Création d'une session Stripe Checkout (tRPC)
   ↓
3. Redirection vers Stripe Checkout
   ↓
4. Utilisateur entre ses informations de paiement
   ↓
5. Paiement traité par Stripe
   ↓
6. Webhook Stripe reçoit l'événement (checkout.session.completed)
   ↓
7. Création/mise à jour de l'abonnement en base de données
   ↓
8. Activation de l'accès utilisateur
   ↓
9. Redirection vers le dashboard
```

---

## 🔐 Flux OAuth Meta

```
1. Utilisateur clique sur "Connecter une page Facebook"
   ↓
2. Génération d'une URL OAuth avec state aléatoire
   ↓
3. Redirection vers Facebook (fenêtre popup)
   ↓
4. Utilisateur autorise l'application
   ↓
5. Facebook redirige vers /api/oauth/facebook/callback avec code
   ↓
6. Échange du code pour un access token
   ↓
7. Récupération de la liste des pages Facebook
   ↓
8. Stockage des pages et tokens en base de données
   ↓
9. Redirection vers le dashboard avec confirmation
```

---

## 🌐 Langues Supportées

| Langue | Code | Support |
|--------|------|---------|
| Arabe algérien/Darija | `ar` | ✅ RTL, prioritaire |
| Français | `fr` | ✅ LTR |
| Anglais | `en` | ✅ LTR |

Chaque page et composant supporte les 3 langues avec traductions complètes.

---

## 🔑 Variables d'Environnement Requises

```env
# OpenAI
OPENAI_API_KEY=sk_...

# Meta
META_APP_ID=...
META_APP_SECRET=...
META_VERIFY_TOKEN=...
META_OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/facebook/callback

# Stripe
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base de données
DATABASE_URL=mysql://...

# OAuth Manus
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=...
```

---

## 📊 Flux de Données Complet

```
User Login
    ↓
Dashboard (statistiques en temps réel)
    ├── Pages Messenger connectées
    ├── Nombre de messages traités
    ├── Temps de réponse moyen
    └── Statut d'abonnement
    ↓
Configuration Agent
    ├── Personnalité de l'agent
    ├── Instructions système
    ├── Langue de réponse
    └── Règles de réponse
    ↓
Connexion de Pages (OAuth)
    ├── Autorisation Facebook
    ├── Stockage des tokens
    └── Activation de la page
    ↓
Réception de Messages
    ├── Webhook Messenger
    ├── Vérification d'abonnement
    ├── Appel OpenAI
    └── Envoi de réponse
    ↓
Historique & Analytics
    ├── Conversations passées
    ├── Graphiques de performance
    └── Distribution des langues
```

---

## 🚀 Déploiement & Publication

Pour publier votre application :

1. **Créer un checkpoint** (déjà fait)
2. **Cliquer sur le bouton "Publish"** dans l'interface Manus
3. **Configurer votre domaine personnalisé** (optionnel)
4. **L'application sera accessible publiquement**

---

## 📞 Support & Prochaines Étapes

### Fonctionnalités Implémentées ✅
- ✅ Webhook Messenger avec automatisation IA
- ✅ Intégration OpenAI GPT-4o multilingue
- ✅ Gestion des abonnements Stripe
- ✅ OAuth Meta pour connexion de pages
- ✅ Tableau de bord multilingue RTL
- ✅ Base de données complète
- ✅ Tests unitaires et end-to-end

### Fonctionnalités Recommandées 🔄
- [ ] Notifications email propriétaire
- [ ] Page de gestion avancée des pages
- [ ] Renouvellement automatique des tokens
- [ ] Intégration WhatsApp (optionnel)
- [ ] Analytics avancées par page
- [ ] Système de templates de réponse

---

## 📝 Notes Importantes

1. **Sécurité** : Tous les tokens sont stockés de manière sécurisée
2. **Scalabilité** : Architecture prête pour des milliers d'utilisateurs
3. **Multilingue** : Support complet Arabe/Français/Anglais
4. **RTL** : Interface entièrement compatible right-to-left pour l'Arabe
5. **Webhooks** : Tous les webhooks sont validés et sécurisés

---

Dernière mise à jour : 2026-03-04
Version du projet : 22242fff
