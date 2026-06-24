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
  const { publicKey, isConnected, isAdmin } = useFreighterWallet();

  useEffect(() => {
    if (!isConnected || !publicKey) {
      return;
    }

    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/user');
    }
  }, [publicKey, isConnected, isAdmin, router]);

  return {
    publicKey,
    isConnected,
    isAdmin,
  };
}
