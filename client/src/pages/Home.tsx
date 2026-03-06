import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Zap, Globe } from "lucide-react";
import { getLoginUrl } from "@/const";

/**
 * Page d'accueil - Affiche la page de connexion ou redirige vers le dashboard
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Si l'utilisateur est authentifié, rediriger vers le dashboard
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  // Si en cours de chargement, afficher un spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">Messenger AI</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-slate-900 mb-4">
                  Automatisez vos réponses Messenger avec l'IA
                </h1>
                <p className="text-xl text-slate-600">
                  Répondez instantanément à vos clients avec un agent IA intelligent, multilingue et disponible 24/7.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                      <Zap className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">Réponses Instantanées</h3>
                    <p className="text-slate-600">Répondez aux messages en moins d'une seconde</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                      <Globe className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">Multilingue</h3>
                    <p className="text-slate-600">Support Arabe, Français, Anglais et plus</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">Personnalisable</h3>
                    <p className="text-slate-600">Configurez la personnalité et les règles de votre agent</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Bienvenue</h2>
                  <p className="text-slate-600">Connectez-vous pour commencer</p>
                </div>

                <Button
                  onClick={() => window.location.href = getLoginUrl()}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Se connecter avec Manus
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">ou</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    <strong>Pas encore de compte ?</strong> Créez-en un gratuitement sur Manus.
                  </p>
                  <p className="text-xs">
                    En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">1000+</div>
                    <div className="text-xs text-slate-600">Utilisateurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">99%</div>
                    <div className="text-xs text-slate-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">24/7</div>
                    <div className="text-xs text-slate-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-600">
            <p>© 2026 Messenger AI. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    );
  }

  // Si authentifié mais pas encore redirigé
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600">Redirection vers le dashboard...</p>
      </div>
    </div>
  );
}
