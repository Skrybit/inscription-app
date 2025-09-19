import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { apiLocalClient } from '@/src/config';
import { API_CONSTANTS } from '@/src/constants/api';
import { getAuthHeaders } from '@/src/lib/utils';

export function useBrc20() {
  const [deployTicker, setDeployTicker] = useState('');
  const [maxSupply, setMaxSupply] = useState('');
  const [amountPerMint, setAmountPerMint] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [deployFeeRate, setDeployFeeRate] = useState('');
  const [deployResponse, setDeployResponse] = useState<any>(null);
  const [checkTicker, setCheckTicker] = useState('');
  const [checkTickerResponse, setCheckTickerResponse] = useState<any>(null);
  const [mintTicker, setMintTicker] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [numberOfMints, setNumberOfMints] = useState('');
  const [mintFeeRate, setMintFeeRate] = useState('');
  const [mintResponse, setMintResponse] = useState<any>(null);
  const [isLoadingDeploy, setIsLoadingDeploy] = useState(false);
  const [isLoadingCheckTicker, setIsLoadingCheckTicker] = useState(false);
  const [isLoadingMint, setIsLoadingMint] = useState(false);
  const [isLoadingBrc20Pay, setIsLoadingBrc20Pay] = useState(false);
  const [brc20PaymentStatus, setBrc20PaymentStatus] = useState<any>(null);

  // Reset payment status when new deploy or mint response is received
  useEffect(() => {
    if (deployResponse || mintResponse) {
      setBrc20PaymentStatus(null);
    }
  }, [deployResponse, mintResponse]);

  const deployToken = async (walletAddress: string | null) => {
    console.log('deployToken called with:', { walletAddress, deployTicker, maxSupply, amountPerMint, destinationAddress, deployFeeRate });
    if (!deployTicker || !maxSupply || !amountPerMint || !destinationAddress || !deployFeeRate) {
      toast.error('Error', {
        description: 'All required fields must be filled.',
      });
      return;
    }
    if (!walletAddress) {
      toast.error('Error', {
        description: 'Please connect your UniSat wallet.',
      });
      return;
    }
    const feeRateNum = parseFloat(deployFeeRate);
    if (isNaN(feeRateNum) || feeRateNum < 1) {
      toast.error('Error', {
        description: 'Fee rate must be a number greater than or equal to 1.',
      });
      return;
    }
    if (deployTicker.length !== 4 || !/^[A-Z]+$/.test(deployTicker)) {
      toast.error('Error', {
        description: 'Ticker must be 4 uppercase letters.',
      });
      return;
    }

    const body = {
      ticker: deployTicker,
      max_supply: maxSupply,
      amount_per_mint: amountPerMint,
      destination_address: destinationAddress,
      sender_address: walletAddress,
      fee_rate: deployFeeRate,
    };

    console.log('Deploy request body:', body);

    try {
      setIsLoadingDeploy(true);
      const res = await apiLocalClient.post(
        API_CONSTANTS.PROXY.BRC20.DEPLOY,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );
      setDeployResponse({ ...res.data, fee_rate: deployFeeRate });
      console.log('Deploy response:', res.data);
      console.log('Stored deployResponse.fee_rate:', deployFeeRate);
      toast.success('Success', {
        description: 'BRC-20 token deployed successfully.',
      });
    } catch (err: any) {
      console.error('Deploy error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Error', {
        description: err.response?.data?.error || 'Error deploying BRC-20 token.',
      });
    } finally {
      setIsLoadingDeploy(false);
    }
  };

  const checkTickerExists = async () => {
    console.log('checkTickerExists called with:', { checkTicker });
    if (!checkTicker) {
      toast.error('Error', {
        description: 'Ticker is required.',
      });
      return;
    }
    if (checkTicker.length !== 4 || !/^[A-Z]+$/.test(checkTicker)) {
      toast.error('Error', {
        description: 'Ticker must be 4 uppercase letters.',
      });
      return;
    }

    try {
      setIsLoadingCheckTicker(true);
      const res = await apiLocalClient.get(
        API_CONSTANTS.PROXY.BRC20.CHECK_TICKER(checkTicker),
        { headers: getAuthHeaders() }
      );
      setCheckTickerResponse(res.data);
      console.log('Check ticker response:', res.data);
      toast.success('Success', {
        description: res.data.exists ? `Ticker ${checkTicker} exists.` : `Ticker ${checkTicker} is available.`,
      });
    } catch (err: any) {
      console.error('Check ticker error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Error', {
        description: err.response?.data?.error || 'Error checking ticker.',
      });
    } finally {
      setIsLoadingCheckTicker(false);
    }
  };

  const mintToken = async (walletAddress: string | null) => {
    console.log('mintToken called with:', { walletAddress, mintTicker, mintAmount, numberOfMints, mintFeeRate });
    if (!mintTicker || !mintAmount || !numberOfMints || !mintFeeRate) {
      toast.error('Error', {
        description: 'All required fields must be filled.',
      });
      return;
    }
    if (!walletAddress) {
      toast.error('Error', {
        description: 'Please connect your UniSat wallet.',
      });
      return;
    }
    const feeRateNum = parseFloat(mintFeeRate);
    if (isNaN(feeRateNum) || feeRateNum < 1) {
      toast.error('Error', {
        description: 'Fee rate must be a number greater than or equal to 1.',
      });
      return;
    }
    if (mintTicker.length !== 4 || !/^[A-Z]+$/.test(mintTicker)) {
      toast.error('Error', {
        description: 'Ticker must be 4 uppercase letters.',
      });
      return;
    }

    const body = {
      ticker: mintTicker,
      amount: mintAmount,
      number_of_mints: numberOfMints,
      sender_address: walletAddress,
      fee_rate: mintFeeRate,
    };

    console.log('Mint request body:', body);

    try {
      setIsLoadingMint(true);
      const res = await apiLocalClient.post(
        API_CONSTANTS.PROXY.BRC20.MINT,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );
      setMintResponse({ ...res.data, fee_rate: mintFeeRate });
      console.log('Mint response:', res.data);
      console.log('Stored mintResponse.fee_rate:', mintFeeRate);
      toast.success('Success', {
        description: 'BRC-20 tokens minted successfully.',
      });
    } catch (err: any) {
      console.error('Mint error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Error', {
        description: err.response?.data?.error || 'Error minting BRC-20 tokens.',
      });
    } finally {
      setIsLoadingMint(false);
    }
  };

  const payBrc20 = async (walletAddress: string | null, paymentAddress: string, amount: string, feeRate: string) => {
    console.log('payBrc20 called with:', { walletAddress, paymentAddress, amount, feeRate });
    if (!paymentAddress || !amount || !feeRate) {
      toast.error('Error', {
        description: 'Payment details are missing.',
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

    const feeRateNum = parseFloat(feeRate);
    console.log('Fee rate for transaction:', feeRateNum);
    if (isNaN(feeRateNum) || feeRateNum < 1) {
      toast.error('Error', {
        description: 'Invalid fee rate. Please use a fee rate >= 1.',
      });
      return;
    }

    try {
      setIsLoadingBrc20Pay(true);
      const amountNum = parseInt(amount);
      if (!window.unisat) {
        toast.error('Error', {
          description: 'UniSat wallet not detected.',
        });
        return;
      }

      console.log('Attempting Bitcoin transaction with feeRate:', feeRateNum);
      const txid = await window.unisat.sendBitcoin(paymentAddress, amountNum, { feeRate: feeRateNum });
      console.log('Payment sent successfully, txid:', txid, 'with feeRate:', feeRateNum);
      setBrc20PaymentStatus({ txid, is_paid: true });
      toast.success('Success', {
        description: `Payment sent successfully with fee rate ${feeRateNum} sats/vbyte. TXID: ${txid}`,
      });
      try {
        const txDetails = await window.unisat.getTransaction?.(txid);
        console.log('Transaction details:', txDetails || 'No transaction details available');
      } catch (err: any) {
        console.warn('Could not fetch transaction details for txid:', txid, 'Error:', err.message);
      }
    } catch (err: any) {
      console.error('Payment failed with feeRate:', feeRateNum, 'Error:', err.message);
      toast.error('Error', {
        description: `Failed to send payment with fee rate ${feeRateNum} sats/vbyte: ${err.message}. The fee rate may be too low for current network conditions. Try a higher fee rate.`,
      });
    } finally {
      setIsLoadingBrc20Pay(false);
    }
  };

  return {
    deployTicker,
    setDeployTicker,
    maxSupply,
    setMaxSupply,
    amountPerMint,
    setAmountPerMint,
    destinationAddress,
    setDestinationAddress,
    deployFeeRate,
    setDeployFeeRate,
    deployResponse,
    checkTicker,
    setCheckTicker,
    checkTickerResponse,
    mintTicker,
    setMintTicker,
    mintAmount,
    setMintAmount,
    numberOfMints,
    setNumberOfMints,
    mintFeeRate,
    setMintFeeRate,
    mintResponse,
    isLoadingDeploy,
    isLoadingCheckTicker,
    isLoadingMint,
    isLoadingBrc20Pay,
    brc20PaymentStatus,
    deployToken,
    checkTickerExists,
    mintToken,
    payBrc20,
  };
}