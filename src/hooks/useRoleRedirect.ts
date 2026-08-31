'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFreighterWallet } from './useStellar';
import { CONTRACT_CONFIG } from '../../config/stellarConfig';

/**
 * Custom hook to redirect users based on their role
 * - Admin users are redirected to /admin
 * - Regular users are redirected to /user
 * - Runs automatically on wallet connection
 * 
 * @example
 * ```tsx
 * function HomePage() {
 *   useRoleRedirect();
 *   return <div>Redirecting...</div>;
 * }
 * ```
 */
export function useRoleRedirect() {
  const router = useRouter();
  const { publicKey, isConnected, isAdmin, isAdminLoading } = useFreighterWallet();

  useEffect(() => {
    // isAdmin resolves asynchronously (it checks the admin account's live
    // signer set on Horizon — see src/lib/horizon.ts). Redirecting before
    // that check resolves would send every wallet, admin included, to
    // /user first and then bounce to /admin once isAdmin flips true.
    if (!isConnected || !publicKey || isAdminLoading) {
      return;
    }

    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/user');
    }
  }, [publicKey, isConnected, isAdmin, isAdminLoading, router]);

  return {
    publicKey,
    isConnected,
    isAdmin,
  };
}
