import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Hook to check if the current user has an active subscription.
 * Returns subscription data and a boolean `hasAccess`.
 */
export function useSubscription() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: subscription, isLoading: subLoading } = trpc.payments.getSubscription.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const hasAccess = (() => {
    if (!subscription) return false;
    if (subscription.status === 'free') return false;
    if (!subscription.expiresAt) return false;
    const expiresAt = new Date(subscription.expiresAt);
    return expiresAt > new Date();
  })();

  return {
    subscription,
    hasAccess,
    loading: authLoading || subLoading,
    plan: subscription?.plan,
    status: subscription?.status,
    expiresAt: subscription?.expiresAt,
  };
}
