import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiLocalClient } from '@/src/config';
import { API_CONSTANTS } from '@/src/constants/api';
import { getAuthHeaders } from '@/src/lib/utils';

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletInscriptions, setWalletInscriptions] = useState<any[]>([]);
  const [isLoadingConnect, setIsLoadingConnect] = useState(false);
  const [isLoadingInscriptions, setIsLoadingInscriptions] = useState(false);

  const connectWallet = async () => {
    try {
      setIsLoadingConnect(true);
      if (window.unisat) {
        const accounts = await window.unisat.requestAccounts();
        // console.log('UniSat accounts:', accounts);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        //   console.log('Wallet connected, address:', accounts[0]);
        } else {
          toast.error('Error', {
            description: 'No accounts found in UniSat wallet.',
          });
        }
      } else {
        toast.error('Error', {
          description: 'UniSat wallet not detected. Please install the UniSat extension.',
        });
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      toast.error('Error', {
        description: 'Failed to connect UniSat wallet: ' + err.message,
      });
    } finally {
      setIsLoadingConnect(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setWalletInscriptions([]);
    window.unisat.disconnect()
    console.log('Wallet disconnected');
  };

  const fetchWalletInscriptions = async () => {
    if (!walletAddress) return;
    try {
      setIsLoadingInscriptions(true);
      const res = await apiLocalClient.get(
        API_CONSTANTS.PROXY.INSCRIPTIONS.GET_SENDER(walletAddress),
        {
          headers: getAuthHeaders(),
        }
      );
    //   console.log('Raw get-sender response:', res.data);
      setWalletInscriptions(res.data || []);
    } catch (err: any) {
      console.error('Fetch wallet inscriptions error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Error', {
        description: err.response?.data?.message || 'Error fetching wallet inscriptions.',
      });
    } finally {
      setIsLoadingInscriptions(false);
    }
  };

  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      fetchWalletInscriptions();
    }
  }, [isWalletConnected, walletAddress]);

  return {
    walletAddress,
    isWalletConnected,
    isLoadingConnect,
    connectWallet,
    disconnectWallet,
    walletInscriptions,
    isLoadingInscriptions,
    fetchWalletInscriptions,
  };
}