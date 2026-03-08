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
- [ ] Appliquer skill-design-system-modern-clean (WhatsApp-inspired)
- [ ] Implémenter Tailwind 4 avec OKLCH colors
- [ ] Créer composants : Buttons (pill-shaped), Cards, Chat bubbles
- [ ] Support RTL complet pour Arabe
- [ ] Icônes filaires + emojis
- [ ] Typographie moderne (sans-serif)

### Refonte UI
- [ ] Refaire page d'accueil (landing page premium)
- [ ] Refaire dashboard avec nouveau design
- [ ] Refaire pages Auth avec design moderne
- [ ] Tester sur mobile (responsive)

---

## PHASE 2 : Monétisation & Onboarding (Semaines 3-4)
- [ ] Intégrer Stripe (International)
- [ ] Intégrer Chargily Pay (Algérie - Edahabia/CIB)
- [ ] Créer tunnel premium (paywall)
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
- [ ] Test utilisateur final
