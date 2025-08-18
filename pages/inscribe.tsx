import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { apiLocalClient } from '../src/config'; // Adjust path
import { API_CONSTANTS } from '../src/constants/api'; // Adjust path

declare global {
  interface Window {
    unisat?: {
      requestAccounts: () => Promise<string[]>;
      getAccounts: () => Promise<string[]>;
      sendBitcoin: (toAddress: string, amount: number, options?: { feeRate: number }) => Promise<string>;
    };
  }
}

export default function InscribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [feeRate, setFeeRate] = useState('10');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [revealResult, setRevealResult] = useState<any>(null);
  const [broadcastRevealResult, setBroadcastRevealResult] = useState<any>(null);
  const [inscriptionDetails, setInscriptionDetails] = useState<any>(null);
  const [inscriptionIdInput, setInscriptionIdInput] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [walletInscriptions, setWalletInscriptions] = useState<any[]>([]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    if (token) {
      Cookies.set('authToken', token, {
        sameSite: 'strict',
        secure: false, // Set to true in production with HTTPS
      });
    } else {
      console.error('No AUTH_TOKEN found in environment variables');
      setError('No AUTH_TOKEN found in environment variables');
    }

    // Load UniSat SDK
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@unisat/wallet-sdk@latest/lib/unisat.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPolling && response && walletAddress) {
      interval = setInterval(async () => {
        try {
          const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.PAYMENT_STATUS, {
            payment_address: response.payment_address,
            required_amount_in_sats: response.required_amount_in_sats,
            sender_address: walletAddress,
            id: response.inscription_id,
          }, {
            headers: getAuthHeaders(),
          });
          setPaymentStatus(res.data);
          if (res.data.is_paid && res.data.status === 'confirmed') {
            setIsPolling(false);
            setError('');
          }
        } catch (err: any) {
          console.error('Polling payment status error:', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
          });
          setError('Error polling payment status: ' + err.message);
          setIsPolling(false);
        }
      }, 30000); // Poll every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, response, walletAddress]);

  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      fetchWalletInscriptions();
    }
  }, [isWalletConnected, walletAddress]);

  const getAuthHeaders = () => {
    const token = Cookies.get('authToken');
    return token ? { authorization: `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
  };

  const connectWallet = async () => {
    try {
      if (window.unisat) {
        const accounts = await window.unisat.requestAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          setError('');
        } else {
          setError('No accounts found in UniSat wallet');
        }
      } else {
        setError('UniSat wallet not detected. Please install the UniSat extension.');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect UniSat wallet: ' + err.message);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setWalletInscriptions([]);
    setError('');
  };

  const fetchWalletInscriptions = async () => {
    if (!walletAddress) return;
    try {
      const res = await apiLocalClient.get(API_CONSTANTS.PROXY.INSCRIPTIONS.GET_SENDER(walletAddress), {
        headers: getAuthHeaders(),
      });
      setWalletInscriptions(res.data || []);
      setError('');
    } catch (err: any) {
      console.error('Fetch wallet inscriptions error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error fetching wallet inscriptions')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !recipientAddress || !feeRate) {
      setError('All required fields must be filled');
      return;
    }
    if (file.size === 0) {
      setError('Uploaded file is empty');
      return;
    }
    if (!isWalletConnected || !walletAddress) {
      setError('Please connect your UniSat wallet');
      return;
    }
    const feeRateNum = parseFloat(feeRate);
    if (isNaN(feeRateNum) || feeRateNum <= 0) {
      setError('Fee rate must be a positive number');
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
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.CREATE_COMMIT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders(),
        },
      });
      setResponse(res.data);
      setError('');
    } catch (err: any) {
      console.error('Frontend error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error creating inscription commit')
      );
    }
  };

  const payNow = async () => {
    if (!response) {
      setError('Create an inscription first');
      return;
    }
    if (!isWalletConnected || !walletAddress) {
      setError('Please connect your UniSat wallet');
      return;
    }

    try {
      const amount = parseInt(response.required_amount_in_sats);
      const toAddress = response.payment_address;
      const feeRateNum = parseFloat(feeRate);

      if (!window.unisat) {
        setError('UniSat wallet not detected');
        return;
      }

      const txid = await window.unisat.sendBitcoin(toAddress, amount, { feeRate: feeRateNum });
      console.log('Payment sent, txid:', txid);
      setError('');
      setPaymentStatus({ txid, is_paid: false });
      setIsPolling(true); // Start polling
    } catch (err: any) {
      console.error('Payment error:', err);
      setError('Failed to send payment: ' + err.message);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiLocalClient.get(API_CONSTANTS.PROXY.INSCRIPTIONS.STATS, {
        headers: getAuthHeaders(),
      });
      setStats(res.data);
      setError('');
    } catch (err: any) {
      console.error('Stats error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error fetching stats')
      );
    }
  };

  const checkPaymentStatus = async () => {
    if (!response) {
      setError('Create an inscription first');
      return;
    }
    if (!isWalletConnected || !walletAddress) {
      setError('Please connect your UniSat wallet');
      return;
    }

    try {
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.PAYMENT_STATUS, {
        payment_address: response.payment_address,
        required_amount_in_sats: response.required_amount_in_sats,
        sender_address: walletAddress,
        id: response.inscription_id,
      }, {
        headers: getAuthHeaders(),
      });
      setPaymentStatus(res.data);
      setError('');
      if (res.data.is_paid && res.data.status === 'confirmed') {
        setIsPolling(false);
      }
    } catch (err: any) {
      console.error('Payment status error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error checking payment status')
      );
    }
  };

  const createReveal = async () => {
    if (!response) {
      setError('Create an inscription first');
      return;
    }

    try {
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.CREATE_REVEAL, {
        inscription_id: response.inscription_id,
      }, {
        headers: getAuthHeaders(),
      });
      setRevealResult(res.data);
      setError('');
    } catch (err: any) {
      console.error('Create reveal error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error creating reveal transaction')
      );
    }
  };

  const broadcastReveal = async () => {
    if (!revealResult) {
      setError('Create a reveal transaction first');
      return;
    }

    try {
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.BROADCAST_REVEAL, {
        reveal_transaction: revealResult.reveal_transaction,
      }, {
        headers: getAuthHeaders(),
      });
      setBroadcastRevealResult(res.data);
      setError('');
    } catch (err: any) {
      console.error('Broadcast reveal error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error broadcasting reveal transaction')
      );
    }
  };

  const getInscriptionDetails = async () => {
    const id = inscriptionIdInput || (response && response.inscription_id);
    if (!id) {
      setError('Enter an inscription ID or create an inscription first');
      return;
    }

    try {
      const res = await apiLocalClient.get(API_CONSTANTS.PROXY.INSCRIPTIONS.GET_BY_ID(id), {
        headers: getAuthHeaders(),
      });
      setInscriptionDetails(res.data);
      setError('');
    } catch (err: any) {
      console.error('Get inscription error:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error fetching inscription details: ' + err.message)
      );
    }
  };

  return (
    <div>
      <h1>Create Inscription</h1>
      <div>
        <button onClick={connectWallet} disabled={isWalletConnected}>
          {isWalletConnected ? `Wallet Connected: ${walletAddress}` : 'Connect UniSat Wallet'}
        </button>
        {isWalletConnected && (
          <button onClick={disconnectWallet} style={{ marginLeft: '10px' }}>
            Disconnect Wallet
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <input
          type="text"
          placeholder="Recipient Address (try mainnet: bc1q...)"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Fee Rate (sats/vbyte, e.g., 10)"
          value={feeRate}
          onChange={(e) => setFeeRate(e.target.value)}
          required
        />
        <button type="submit">Create Commit</button>
      </form>
      {response && (
        <div>
          <h2>Payment</h2>
          <p>Send {response.required_amount_in_sats} sats to {response.payment_address}</p>
          <button onClick={payNow}>Pay Now</button>
        </div>
      )}
      <button onClick={fetchStats}>Fetch Stats</button>
      <button onClick={checkPaymentStatus}>Check Payment Status</button>
      <button onClick={createReveal}>Create Reveal</button>
      <button onClick={broadcastReveal}>Broadcast Reveal</button>
      <div>
        <h2>Get Inscription Details</h2>
        <input
          type="text"
          placeholder="Enter Inscription ID"
          value={inscriptionIdInput}
          onChange={(e) => setInscriptionIdInput(e.target.value)}
        />
        <button onClick={getInscriptionDetails}>Get Inscription Details</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (
        <div>
          <h2>Response:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {stats && (
        <div>
          <h2>Stats:</h2>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
      {paymentStatus && (
        <div>
          <h2>Payment Status:</h2>
          <pre>{JSON.stringify(paymentStatus, null, 2)}</pre>
        </div>
      )}
      {revealResult && (
        <div>
          <h2>Create Reveal Result:</h2>
          <pre>{JSON.stringify(revealResult, null, 2)}</pre>
        </div>
      )}
      {broadcastRevealResult && (
        <div>
          <h2>Broadcast Reveal Result:</h2>
          <pre>{JSON.stringify(broadcastRevealResult, null, 2)}</pre>
        </div>
      )}
      {inscriptionDetails && (
        <div>
          <h2>Inscription Details:</h2>
          <pre>{JSON.stringify(inscriptionDetails, null, 2)}</pre>
        </div>
      )}
      {walletInscriptions.length > 0 && (
        <div>
          <h2>Wallet Inscriptions</h2>
          <pre>{JSON.stringify(walletInscriptions, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}