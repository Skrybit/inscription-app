import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiLocalClient } from '@/src/config';
import { API_CONSTANTS } from '@/src/constants/api';
import { getAuthHeaders } from '@/src/lib/utils';

export function useInscription() {
  const [file, setFile] = useState<File | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [inscriptionDetails, setInscriptionDetails] = useState<any>(null);
  const [inscriptionIdInput, setInscriptionIdInput] = useState('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPay, setIsLoadingPay] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showPaymentStatusDialog, setShowPaymentStatusDialog] = useState(false);
  const [showInscriptionDetailsDialog, setShowInscriptionDetailsDialog] = useState(false);
  const [isPolling, setIsPolling] = useState(false); // Added for compatibility

  const fetchStats = useCallback(async () => {
    console.log('Fetching stats at:', new Date().toISOString());
    try {
      setIsLoadingStats(true);
      const res = await apiLocalClient.get(API_CONSTANTS.PROXY.INSCRIPTIONS.STATS, {
        headers: getAuthHeaders(),
      });
      setStats(res.data);
    } catch (err: any) {
      console.error('Stats error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Error', {
        description: err.response?.data?.message || 'Error fetching stats.',
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSubmit = async (e: React.FormEvent, walletAddress: string | null) => {
    e.preventDefault();
    console.log('handleSubmit called with:', { walletAddress, isWalletConnected: !!walletAddress, feeRate });
    if (!file || !recipientAddress || !feeRate) {
      toast.error('Error', {
        description: 'All required fields must be filled.',
      });
      return;
    }
    if (file.size === 0) {
      toast.error('Error', {
        description: 'Uploaded file is empty.',
      });
      return;
    }
    if (!walletAddress) {
      toast.error('Error', {
        description: 'Please connect your UniSat wallet.',
      });
      return;
    }
    const feeRateNum = parseFloat(feeRate);
    if (isNaN(feeRateNum) || feeRateNum < 1) {
      toast.error('Error', {
        description: 'Fee rate must be a number greater than or equal to 1.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('recipient_address', recipientAddress);
    formData.append('fee_rate', feeRate);
    formData.append('sender_address', walletAddress);
    formData.append('file', file, file.name);

    console.log('FormData sent:', {
      recipient_address: recipientAddress,
      fee_rate: feeRate,
      sender_address: walletAddress,
      file: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      setIsLoadingSubmit(true);
      const res = await apiLocalClient.post(
        API_CONSTANTS.PROXY.INSCRIPTIONS.CREATE_COMMIT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders(),
          },
        }
      );
      console.log('Create commit response:', res.data);
      const newResponse = { ...res.data, fee_rate: feeRate };
      setResponse(newResponse);
      console.log('Stored response.fee_rate:', newResponse.fee_rate);
      toast.success('Success', {
        description: 'Inscription commit created successfully.',
      });
    } catch (err: any) {
      console.error('Frontend error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Error', {
        description: err.response?.data?.message || 'Error creating inscription commit.',
      });
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const payNow = async (walletAddress: string | null) => {
    console.log('payNow called with:', { walletAddress, response, userFeeRate: response?.fee_rate });
    if (!response) {
      toast.error('Error', {
        description: 'Create an inscription first.',
      });
      return;
    }
    if (!walletAddress || typeof walletAddress !== 'string') {
      console.error('Invalid walletAddress:', walletAddress);
      toast.error('Error', {
        description: 'Invalid wallet address. Please connect your UniSat wallet.',
      });
      return;
    }

    const feeRateNum = parseFloat(response.fee_rate);
    console.log('Fee rate for transaction:', feeRateNum);
    if (isNaN(feeRateNum) || feeRateNum < 1) {
      toast.error('Error', {
        description: 'Invalid fee rate. Please create a new inscription with a fee rate >= 1.',
      });
      return;
    }

    try {
      setIsLoadingPay(true);
      const amount = parseInt(response.required_amount_in_sats);
      const toAddress = response.payment_address;

      if (!window.unisat) {
        toast.error('Error', {
          description: 'UniSat wallet not detected.',
        });
        return;
      }

      console.log('Attempting Bitcoin transaction with feeRate:', feeRateNum);
      const txid = await window.unisat.sendBitcoin(toAddress, amount, { feeRate: feeRateNum });
      console.log('Payment sent successfully, txid:', txid, 'with feeRate:', feeRateNum);
      setPaymentStatus({ txid, is_paid: false });
      toast.success('Success', {
        description: `Payment sent successfully with fee rate ${feeRateNum} sats/vbyte. TXID: ${txid}`,
      });
      try {
        const txDetails = await window.unisat.getTransaction?.(txid);
        // console.log('Transaction details:', txDetails || 'No transaction details available');
      } catch (err: any) {
        console.warn('Could not fetch transaction details for txid:', txid, 'Error:', err.message);
      }
    } catch (err: any) {
      console.error('Payment failed with feeRate:', feeRateNum, 'Error:', err.message);
      toast.error('Error', {
        description: `Failed to send payment with fee rate ${feeRateNum} sats/vbyte: ${err.message}. The fee rate may be too low for current network conditions. Try a higher fee rate.`,
      });
    } finally {
      setIsLoadingPay(false);
    }
  };

  const checkPaymentStatus = async (walletAddress: string | null) => {
    console.log('checkPaymentStatus called with:', { walletAddress });
    if (!response) {
      toast.error('Error', {
        description: 'Create an inscription first.',
      });
      return;
    }
    if (!walletAddress) {
      toast.error('Error', {
        description: 'Please connect your UniSat wallet.',
      });
      return;
    }

    try {
      setIsLoadingPaymentStatus(true);
      const res = await apiLocalClient.post(
        API_CONSTANTS.PROXY.INSCRIPTIONS.PAYMENT_STATUS,
        {
          payment_address: response.payment_address,
          required_amount_in_sats: response.required_amount_in_sats,
          sender_address: walletAddress,
          id: response.inscription_id,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      setPaymentStatus(res.data);
      setShowPaymentStatusDialog(true);
    } catch (err: any) {
      console.error('Payment status error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Error', {
        description: err.response?.data?.message || 'Error checking payment status.',
      });
    } finally {
      setIsLoadingPaymentStatus(false);
    }
  };

  const getInscriptionDetails = async () => {
    const id = inscriptionIdInput || (response && response.inscription_id);
    if (!id) {
      toast.error('Error', {
        description: 'Enter an inscription ID or create an inscription first.',
      });
      return;
    }

    try {
      setIsLoadingDetails(true);
      const res = await apiLocalClient.get(API_CONSTANTS.PROXY.INSCRIPTIONS.GET_BY_ID(id), {
        headers: getAuthHeaders(),
      });
      setInscriptionDetails(res.data);
      setShowInscriptionDetailsDialog(true);
    } catch (err: any) {
      console.error('Get inscription error:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
        message: err.message,
      });
      toast.error('Error', {
        description: err.response?.data?.message || 'Inscription not found.',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return {
    file,
    setFile,
    recipientAddress,
    setRecipientAddress,
    feeRate,
    setFeeRate,
    response,
    stats,
    paymentStatus,
    inscriptionDetails,
    inscriptionIdInput,
    setInscriptionIdInput,
    isPolling,
    setIsPolling,
    isLoadingSubmit,
    isLoadingPay,
    isLoadingStats,
    isLoadingPaymentStatus,
    isLoadingDetails,
    showPaymentStatusDialog,
    setShowPaymentStatusDialog,
    showInscriptionDetailsDialog,
    setShowInscriptionDetailsDialog,
    handleSubmit,
    payNow,
    fetchStats,
    checkPaymentStatus,
    getInscriptionDetails,
  };
}