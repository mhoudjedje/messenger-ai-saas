# Aiteam - Plateforme SaaS d'Automatisation IA Premium - TODO

## PHASE 1 : Fondations, Auth & Design (Transformation en Aiteam)

### Authentification Custom
- [x] Mettre à jour schéma DB : table users avec phone, email, password_hash, provider
- [x] Migration DB appliquée (otp_verifications table)
- [x] Implémenter OTP Email (signup/login) - helpers créés
- [x] Implémenter Google OAuth Login - helpers créés
- [x] Créer routes d'authentification Aiteam - /api/auth/email/*, /api/auth/google/*
- [x] Créer pages Auth : Login, Signup, OTP Verification (UI React) - design moderne RTL
- [x] Routes de navigation intégrées dans App.tsx
- [x] Tests unitaires pour authentification (9 tests, tous passants)
- [ ] Implémenter Meta Cloud API OTP WhatsApp (Algérie)
- [ ] Supprimer Manus Auth, utiliser Aiteam Auth custom (en production)

### Correction OAuth Facebook
- [x] Vérifier enregistrement registerMetaOAuthRoutes dans backend/index.ts - OK
- [x] Configurer proxy Vite pour /api/* - FAIT
- [x] Créer page /pages manquante (cause racine du 404)
- [x] Rendre redirect_uri dynamique (origin au lieu de localhost)
- [x] Installer et configurer cookie-parser pour lire les cookies OAuth
- [x] Passer origin dynamique au tRPC oauth.getLoginUrl
- [ ] Tester endpoint /api/oauth/facebook en production (nécessite configuration Meta App Console)
- [ ] Valider redirect URI dans Meta App Console

### Design System Moderne & Épuré
- [x] Appliquer skill-design-system-modern-clean (WhatsApp-inspired)
- [x] Implémenter Tailwind 4 avec OKLCH colors
- [x] Créer composants : Buttons (pill-shaped), Cards, Chat bubbles
- [x] Support RTL complet pour Arabe
- [x] Icônes filaires + emojis
- [x] Typographie moderne (sans-serif)

### Refonte UI
- [x] Refaire page d'accueil (landing page premium)
- [x] Refaire dashboard avec nouveau design
- [x] Refaire pages Auth avec design moderne
- [ ] Tester sur mobile (responsive)

---

## PHASE 2 : Monétisation & Onboarding (Semaines 3-4)

### Intégration Chargily Pay (Algérie)
- [x] Schéma DB : table payments + champs abonnement users
- [x] Helpers Chargily Pay (checkout, webhooks, pricing)
- [x] Routes Express Chargily (/api/payments/chargily/*)
- [x] tRPC procedures pour paiements
- [x] Tests unitaires (36 tests passants)
- [ ] Pages UI pour tunnel premium
- [ ] Intégration avec dashboard

### Intégration Stripe (International)
- [ ] Helpers Stripe (checkout, webhooks, pricing)
- [ ] Routes Express Stripe (/api/payments/stripe/*)
- [ ] tRPC procedures pour Stripe
- [ ] Tests unitaires

### Tunnel Premium & Onboarding
- [ ] Page de sélection de plan (Pro/Enterprise)
- [ ] Page de sélection de durée (Monthly/Yearly)
- [ ] Redirection vers Chargily (Algérie) ou Stripe (International)
- [ ] Wizard d'onboarding post-paiement
- [ ] Gestion des abonnements

---

## PHASE 3 : Admin & Analytics (Semaines 5-6)
- [ ] Dashboard Admin (/admin)
- [ ] Gestion des utilisateurs
- [ ] Monitoring des coûts OpenAI
- [ ] Analytics clients

---

## PHASE 4 : Scale & Multi-Produits (Futur)
- [ ] WhatsApp AI
- [ ] Instagram AI
- [ ] White Label

---

## ANCIEN : Messenger AI Automation SaaS - TODO

## [ARCHIVED] Phase 1 : Configuration et Schéma de Base
- [x] Configuration des secrets Stripe API key et OpenAI API key
- [x] Extension du schéma Drizzle avec tables pour Messenger, abonnements et conversations
- [x] Migration de la base de données

## Phase 2 : Backend - Webhook Messenger
- [x] Créer endpoint GET `/api/webhook` pour vérification du token Meta
- [x] Créer endpoint POST `/api/webhook` pour recevoir les messages
- [x] Implémenter validation de signature SHA256 des payloads
- [x] Parser les événements Messenger (messages, attachments, etc.)
- [x] Créer fonction pour envoyer des messages via Messenger Send API

## Phase 3 : Intégration OpenAI
- [x] Créer procédure tRPC pour appeler OpenAI GPT-4o
- [x] Implémenter support multilingue (Arabe algérien/Darija, Français, Anglais)
- [x] Créer système de prompts personnalisables par agent
- [x] Gérer les erreurs et timeouts OpenAI
- [ ] Implémenter rate limiting sur les appels OpenAI

## Phase 4 : Gestion des Abonnements Stripe
- [x] Configurer les plans d'abonnement dans Stripe (Free, Pro, Enterprise)
- [x] Créer endpoint POST `/api/stripe/webhook` pour les événements Stripe
- [x] Implémenter logique de vérification du statut d'abonnement
- [x] Créer procédure tRPC pour créer une session Stripe Checkout
- [x] Gérer les événements : subscription.created, subscription.deleted, payment_failed
- [ ] Implémenter essai gratuit (trial period)

## Phase 5 : Logique d'Automatisation Complète
- [x] Intégrer webhook Messenger + vérification abonnement + OpenAI + Messenger Send API
- [x] Implémenter gestion des conversations (contexte multi-messages)
- [x] Créer système de stockage des conversations en base de données
- [x] Gérer les erreurs et retry logic
- [x] Implémenter logging et monitoring

## Phase 6 : Tableau de Bord - Interface Utilisateur
- [x] Créer layout principal avec support RTL pour l'Arabe
- [x] Implémenter système multilingue (i18n) : Arabe/Français/Anglais
- [x] Créer page d'accueil/dashboard
- [x] Créer page de configuration de l'agent IA
  - [x] Champ pour la personnalité/instructions système
  - [x] Sélection de la langue de réponse
  - [x] Configuration des règles de réponse
  - [x] Préview des réponses

## Phase 7 : Connexion Facebook Messenger OAuth
- [ ] Implémenter OAuth Meta pour connecter les pages Facebook
- [ ] Créer interface pour sélectionner/connecter une page
- [ ] Stocker les tokens d'accès de manière sécurisée
- [ ] Gérer le renouvellement des tokens
- [ ] Afficher les pages connectées et leur statut

## Phase 8 : Historique des Conversations et Analytics
- [ ] Créer page d'historique des conversations
- [ ] Implémenter pagination et recherche
- [ ] Afficher les statistiques : nombre de messages, temps de réponse moyen
- [ ] Créer graphiques d'analytics (messages par jour, langues utilisées)
- [ ] Support RTL pour l'affichage en Arabe

## Phase 9 : Gestion des Utilisateurs et Profil
- [ ] Créer page de profil utilisateur
- [ ] Implémenter gestion des préférences (langue, timezone)
- [ ] Créer page de gestion des abonnements
- [ ] Afficher le statut d'abonnement actuel
- [ ] Créer bouton pour upgrade/downgrade d'abonnement
- [ ] Implémenter gestion de la facturation

## Phase 10 : Stockage S3 pour Fichiers Média
- [ ] Configurer intégration S3
- [ ] Implémenter upload de fichiers depuis Messenger
- [ ] Créer système de stockage des URLs de fichiers
- [ ] Afficher les fichiers média dans l'historique des conversations
- [ ] Gérer les permissions d'accès aux fichiers

## Phase 11 : Notifications Email Propriétaire
- [ ] Configurer SendGrid ou Nodemailer
- [ ] Créer template d'email pour nouveaux abonnements
- [ ] Créer template d'email pour annulations d'abonnement
- [ ] Créer template d'email pour erreurs critiques du système
- [ ] Implémenter envoi automatique des notifications
- [ ] Créer page de configuration des notifications pour le propriétaire

## Phase 12 : Tests et Qualité
- [ ] Écrire tests unitaires pour les procédures tRPC
- [ ] Écrire tests d'intégration pour le webhook Messenger
- [ ] Écrire tests pour la logique d'abonnement Stripe
- [ ] Tester le multilingue (Arabe/Français/Anglais)
- [ ] Tester le support RTL
- [ ] Vérifier la sécurité (validation des signatures, etc.)

## Phase 13 : Déploiement et Exposition Publique
- [ ] Configurer les variables d'environnement pour production
- [ ] Créer checkpoint de la version finale
- [ ] Tester le webhook Messenger en production
- [ ] Tester les paiements Stripe en production
- [ ] Exposer le service publiquement
- [ ] Créer documentation pour les utilisateurs

## Phase 14 : Documentation et Livraison
- [ ] Rédiger documentation technique complète
- [ ] Créer guide d'utilisation pour les utilisateurs
- [ ] Documenter l'API et les endpoints
- [ ] Créer guide de dépannage
- [ ] Préparer le PoC pour la démonstration


## Phase 7.1 : OAuth Meta - Connexion de Pages Facebook
- [ ] Créer endpoint GET `/api/oauth/facebook` pour initier le flux OAuth
- [ ] Créer endpoint GET `/api/oauth/facebook/callback` pour traiter le callback
- [ ] Implémenter échange du code OAuth pour les tokens d'accès
- [ ] Récupérer la liste des pages Facebook de l'utilisateur
- [ ] Stocker les pages et tokens de manière sécurisée en base de données
- [ ] Implémenter renouvellement automatique des tokens d'accès
- [ ] Créer procédure tRPC pour lister les pages connectées
- [ ] Créer procédure tRPC pour déconnecter une page
- [ ] Créer interface React pour initier la connexion OAuth
- [ ] Afficher la liste des pages connectées avec statut
- [ ] Tester le flux OAuth complet avec une vraie page Facebook

## BUG (RÉSOLU) : Erreur 404 persistante sur Connect Page
- [x] Diagnostic approfondi du flux OAuth Facebook (frontend → backend → Meta)
- [x] Cause racine 1 : Route /pages manquante dans App.tsx - CORRIGÉ
- [x] Cause racine 2 : redirect_uri hardcodé à localhost - CORRIGÉ (dynamique)
- [x] Cause racine 3 : cookie-parser manquant - CORRIGÉ (installé + configuré)

## BUG (RÉSOLU) : Invalid Scope pages_manage_messaging dans OAuth Facebook
- [x] Rechercher les scopes valides pour Meta Graph API v18.0
- [x] Corriger les scopes dans meta-oauth.ts : pages_manage_messaging → pages_messaging
- [x] Tester le flux OAuth avec les nouveaux scopes

## BUG (RÉSOLU) : "Can't load URL" - Domain not in app's domains
- [x] Diagnostic : FacebookOAuthButton ouvrait l'URL Facebook directement au lieu de /api/oauth/facebook
- [x] Correction : Le bouton ouvre maintenant /api/oauth/facebook (route Express) qui set les cookies et redirige
- [x] Correction : Ajout de trust proxy + HTTPS forcé en production pour redirect_uri correct
- [x] Correction : Authorize callback URL ajouté dans Meta App Console Advanced Settings
- [x] Correction : META_OAUTH_REDIRECT_URI env var utilisée pour redirect_uri fixe (pas localhost)
- [x] Tests unitaires pour valider la redirect_uri (28 tests passants)
- [ ] Test utilisateur final avec un vrai compte Facebook


## PHASE 2 : Monétisation & Onboarding (EN COURS)

### Chargily Pay (Algérie)
- [ ] Intégrer SDK Chargily Pay
- [ ] Créer route POST /api/payments/chargily/checkout
- [ ] Implémenter webhook Chargily pour payment.success
- [ ] Créer route POST /api/payments/chargily/webhook
- [ ] Activer l'abonnement après confirmation du paiement
- [ ] Afficher le formulaire de paiement Chargily dans le tunnel premium

### Stripe (International)
- [ ] Intégrer SDK Stripe
- [ ] Créer route POST /api/payments/stripe/checkout
- [ ] Implémenter webhook Stripe pour payment_intent.succeeded
- [ ] Créer route POST /api/payments/stripe/webhook
- [ ] Activer l'abonnement après confirmation du paiement
- [ ] Afficher le formulaire de paiement Stripe dans le tunnel premium

### Tunnel Premium & Paywall
- [x] Créer page /premium avec les plans d'abonnement
- [x] Implémenter logique : utilisateurs non payants → redirect vers /premium
- [x] Créer composant de sélection de plan (Algérie vs International)
- [x] Créer bouton "Passer au Premium" pour chaque plan
- [x] Afficher le statut d'abonnement dans le dashboard

### Wizard d'Onboarding Post-Paiement
- [ ] Créer page /onboarding après paiement réussi
- [ ] Étape 1 : Sélection de la langue (Arabe, Français, Anglais)
- [ ] Étape 2 : Configuration de la personnalité de l'agent IA
- [ ] Étape 3 : Connexion de la première page Facebook
- [ ] Étape 4 : Aperçu et activation de l'agent

### Gestion des Abonnements
- [ ] Ajouter champs subscription_status, subscription_plan, subscription_expires_at à la table users
- [ ] Créer procédure tRPC pour vérifier le statut d'abonnement
- [ ] Créer procédure tRPC pour obtenir les détails d'abonnement
- [ ] Implémenter vérification d'abonnement dans les procédures protégées

## BUG (EN COURS) : "Can't load URL" persiste après corrections
- [ ] Diagnostic approfondi : vérifier redirect_uri exacte envoyée par le serveur
- [ ] Vérifier configuration Meta App Console (App Domains, Valid OAuth Redirect URIs)
- [ ] Comparer redirect_uri serveur vs Meta App Console
- [ ] Corriger la cause racine

## UX : Amélioration du flux de connexion Facebook
- [x] Corriger le callback OAuth pour fermer le popup proprement (pas rediriger vers dashboard)
- [x] Simplifier le flux : 1 seul bouton pour connecter une page (pas popup dialog + bouton)
- [x] Ajouter des boutons retour dans toutes les pages du dashboard (Conversations, Analytics, Settings, Pages, AgentConfig)
- [x] Corriger le titre Quick Actions dans le Dashboard (était 'common.close' au lieu de 'dashboard.quickActions')

## PHASE 1 (Suite) : Design System & Refonte UI

### Design System Modern & Clean (skill-design-system-modern-clean)
- [x] Configurer Google Fonts (Inter + Noto Sans Arabic) dans index.html
- [x] Mettre à jour index.css avec nouvelles variables OKLCH (couleurs de marque AITeam)
- [x] Définir palette : fond clair, sections sombres #111B21, accent teal/vert
- [x] Appliquer border-radius généreux (pill-shaped buttons, 16-24px cards)
- [x] Support RTL natif complet

### Refonte Landing Page
- [x] Redesign Home.tsx avec style premium WhatsApp-inspired
- [x] Section Hero asymétrique avec mockup téléphone
- [x] Section features avec icônes filaires
- [x] CTA vers inscription/connexion
- [x] Branding AITeam (pas "Messenger AI")

### Refonte Pages Auth
- [x] Redesign Login.tsx avec nouveau design system
- [x] Redesign Signup.tsx avec nouveau design system
- [x] Redesign VerifyOTP.tsx avec nouveau design system

## PHASE 2 (Suite) : Tunnel Premium & Paywall

### Page Premium (/premium)
- [x] Créer page de sélection de plan avec pricing cards
- [x] Plans : Pro (2999 DZD/mois) et Enterprise (9999 DZD/mois)
- [ ] Détection automatique Algérie vs International (à implémenter - géolocalisation)
- [x] Bouton paiement Chargily (Edahabia/CIB) pour Algérie
- [x] Bouton paiement Stripe pour International
- [x] Support RTL complet

### Paywall Logic
- [x] Implémenter redirection non-payants vers /premium
- [x] Vérifier subscription status dans Dashboard
- [x] Afficher statut abonnement dans le dashboard
- [x] Créer hook useSubscription pour vérification centralisée

### Redesign Dashboard
- [x] Appliquer nouveau design system au Dashboard
- [x] Navigation top nav cohérente avec branding AITeam
- [x] Stats cards avec nouveau style
- [x] Redesign Conversations, Analytics, Settings, Pages avec nouveau design system


## PHASE 3 (Suite) : Navigation & UX Improvements

### Landing Page & Logo Navigation
- [x] Fix landing page display issue (landing page works correctly - redirects to /premium for unauthenticated users)
- [x] Add clickable logo navigation to all pages (Auth, Dashboard, Premium, Conversations, Analytics, Settings, Pages)
- [x] Logo on landing page should be clickable (scrolls to top on landing page)
- [x] Logo on all other pages should redirect to landing page (/)
