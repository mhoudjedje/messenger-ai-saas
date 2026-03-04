import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Page d'accueil - Redirige vers le dashboard si authentifié
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

  // Si pas authentifié, afficher un message de bienvenue
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Messenger AI Automation
          </h1>
          <p className="text-slate-600 mb-8">
            Automatisez vos réponses Messenger avec l'IA
          </p>
          <p className="text-sm text-slate-500">
            Veuillez vous connecter pour continuer
          </p>
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
