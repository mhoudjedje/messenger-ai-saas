# Messenger AI Automation SaaS - TODO

## Phase 1 : Configuration et Schéma de Base
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
