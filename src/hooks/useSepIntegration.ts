'use client';

import { useState, useEffect } from 'react';
import { 
  authenticateWithAnchor,
  initiateDeposit,
  initiateWithdraw,
  getSep24TransactionStatus,
  initiateCrossBorderPayment,
  calculateCrossBorderFee,
  SUPPORTED_CURRENCIES,
  Sep24Transaction,
  Sep31Transaction
} from '@/lib/sep-integration';

interface UseSepIntegrationReturn {
  // Auth
  anchorToken: string | null;
  authenticateAnchor: () => Promise<void>;
  
  // SEP-24 Deposit/Withdraw
  initiateDepositFlow: (assetCode: string, amount: string) => Promise<string>;
  initiateWithdrawFlow: (assetCode: string, amount: string, dest: string) => Promise<string>;
  getTransactionStatus: (txId: string) => Promise<Sep24Transaction>;
  
  // SEP-31 Cross-Border
  sendCrossBorder: (params: CrossBorderParams) => Promise<Sep31Transaction>;
  calculateFees: (amount: number, from: string, to: string) => ReturnType<typeof calculateCrossBorderFee>;
  
  // State
  loading: boolean;
  error: string | null;
  supportedCurrencies: typeof SUPPORTED_CURRENCIES;
}

interface CrossBorderParams {
  amount: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  receiverCountry: string;
  receiverBankAccount?: string;
}

export function useSepIntegration(
  publicKey: string | null,
  signTransaction: (xdr: string) => Promise<string>
): UseSepIntegrationReturn {
  const [anchorToken, setAnchorToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticate with anchor
  const authenticateAnchor = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = await authenticateWithAnchor(publicKey, signTransaction);
      setAnchorToken(token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Initiate deposit (fiat -> crypto)
  const initiateDepositFlow = async (assetCode: string, amount: string): Promise<string> => {
    if (!anchorToken || !publicKey) {
      throw new Error('Not authenticated with anchor');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { url, id } = await initiateDeposit(anchorToken, {
        asset_code: assetCode,
        account: publicKey,
        amount,
      });
      
      // Open interactive deposit URL in new window
      window.open(url, '_blank', 'width=600,height=800');
      
      return id;
    } catch (err: any) {
      setError(err.message || 'Deposit initiation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initiate withdraw (crypto -> fiat)
  const initiateWithdrawFlow = async (
    assetCode: string, 
    amount: string, 
    dest: string
  ): Promise<string> => {
    if (!anchorToken || !publicKey) {
      throw new Error('Not authenticated with anchor');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { url, id } = await initiateWithdraw(anchorToken, {
        asset_code: assetCode,
        account: publicKey,
        amount,
        dest,
      });
      
      // Open interactive withdraw URL in new window
      window.open(url, '_blank', 'width=600,height=800');
      
      return id;
    } catch (err: any) {
      setError(err.message || 'Withdrawal initiation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get transaction status
  const getTransactionStatus = async (txId: string): Promise<Sep24Transaction> => {
    if (!anchorToken) {
      throw new Error('Not authenticated with anchor');
    }
    
    return getSep24TransactionStatus(anchorToken, txId);
  };

  // Send cross-border payment (SEP-31)
  const sendCrossBorder = async (params: CrossBorderParams): Promise<Sep31Transaction> => {
    if (!anchorToken) {
      throw new Error('Not authenticated with anchor');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await initiateCrossBorderPayment(anchorToken, {
        amount: params.amount,
        asset_code: 'USD',
        asset_issuer: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3SDWRGK37GZB',
        sender_id: 'sender-1',
        receiver_id: 'receiver-1',
        fields: {
          transaction: {
            receiver_routing_number: '123456789',
            receiver_account_number: params.receiverBankAccount || '',
            type: 'SWIFT',
          },
          sender: {
            first_name: params.senderName.split(' ')[0],
            last_name: params.senderName.split(' ')[1] || '',
            email: params.senderEmail,
          },
          receiver: {
            first_name: params.receiverName.split(' ')[0],
            last_name: params.receiverName.split(' ')[1] || '',
            email: params.receiverEmail,
          },
        },
      });
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Cross-border payment failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calculate fees helper
  const calculateFees = (amount: number, from: string, to: string) => {
    return calculateCrossBorderFee(amount, from, to);
  };

  return {
    anchorToken,
    authenticateAnchor,
    initiateDepositFlow,
    initiateWithdrawFlow,
    getTransactionStatus,
    sendCrossBorder,
    calculateFees,
    loading,
    error,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
}
