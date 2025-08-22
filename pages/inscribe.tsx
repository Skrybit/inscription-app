import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { apiLocalClient } from '../src/config';
import { API_CONSTANTS } from '../src/constants/api';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Spinner } from '@/src/components/ui/spinner';

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
  const [isLoading, setIsLoading] = useState(false);

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
          setIsLoading(true);
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
        } finally {
          setIsLoading(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
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
      setIsPolling(true);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError('Failed to send payment: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const createReveal = async () => {
    if (!response) {
      setError('Create an inscription first');
      return;
    }

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const broadcastReveal = async () => {
    if (!revealResult) {
      setError('Create a reveal transaction first');
      return;
    }

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const getInscriptionDetails = async () => {
    const id = inscriptionIdInput || (response && response.inscription_id);
    if (!id) {
      setError('Enter an inscription ID or create an inscription first');
      return;
    }

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <header className="w-full max-w-5xl mb-8">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
          Bitcoin Ordinals Inscriber
        </h1>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        {/* Wallet Connection */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Wallet Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Button
                onClick={connectWallet}
                disabled={isWalletConnected || isLoading}
                className={`w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isWalletConnected || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isWalletConnected ? `Connected: ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : isLoading ? 'Connecting...' : 'Connect UniSat Wallet'}
              </Button>
              {isWalletConnected && (
                <Button
                  onClick={disconnectWallet}
                  variant="destructive"
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Disconnect Wallet
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Inscription */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Create Inscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="file" className="text-sm font-medium text-gray-700">Choose File</label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium text-gray-700">Recipient Address</label>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="Enter mainnet address (bc1q...)"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="feeRate" className="text-sm font-medium text-gray-700">Fee Rate (sats/vbyte)</label>
                <Input
                  id="feeRate"
                  type="number"
                  placeholder="e.g., 10"
                  value={feeRate}
                  onChange={(e) => setFeeRate(e.target.value)}
                  className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Creating...' : 'Create Commit'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment */}
        {response && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 break-all">
                Send <span className="font-semibold">{response.required_amount_in_sats}</span> sats to{' '}
                <span className="font-mono text-sm">{response.payment_address}</span>
              </p>
              <Button
                onClick={payNow}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Pay Now'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={fetchStats}
            disabled={isLoading}
            className={`bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Loading...' : 'Fetch Stats'}
          </Button>
          <Button
            onClick={checkPaymentStatus}
            disabled={isLoading}
            className={`bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Checking...' : 'Check Payment Status'}
          </Button>
          <Button
            onClick={createReveal}
            disabled={isLoading}
            className={`bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Reveal'}
          </Button>
          <Button
            onClick={broadcastReveal}
            disabled={isLoading}
            className={`bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Broadcasting...' : 'Broadcast Reveal'}
          </Button>
        </div>

        {/* Get Inscription Details */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Get Inscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Input
                id="inscriptionId"
                type="text"
                placeholder="Enter Inscription ID"
                value={inscriptionIdInput}
                onChange={(e) => setInscriptionIdInput(e.target.value)}
                className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white"
              />
              <Button
                onClick={getInscriptionDetails}
                disabled={isLoading}
                className={`w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Fetching...' : 'Get Details'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 p-4 rounded-lg">
            <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center">
            <Spinner className="h-10 w-10" />
          </div>
        )}

        {/* Results */}
        {response && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Create Commit Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {stats && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {paymentStatus && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
                {JSON.stringify(paymentStatus, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {revealResult && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Create Reveal Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
                {JSON.stringify(revealResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {broadcastRevealResult && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Broadcast Reveal Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
                {JSON.stringify(broadcastRevealResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {inscriptionDetails && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Inscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
                {JSON.stringify(inscriptionDetails, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {walletInscriptions.length > 0 && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Wallet Inscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-teal-50 hover:bg-teal-50">
                    <TableHead className="text-gray-800 font-semibold">ID</TableHead>
                    <TableHead className="text-gray-800 font-semibold">Recipient Address</TableHead>
                    <TableHead className="text-gray-800 font-semibold">Payment Address</TableHead>
                    <TableHead className="text-gray-800 font-semibold">Amount (sats)</TableHead>
                    <TableHead className="text-gray-800 font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletInscriptions.map((inscription, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 transition duration-200">
                      <TableCell>{inscription.inscription_id}</TableCell>
                      <TableCell className="font-mono text-xs break-all">{inscription.recipient_address}</TableCell>
                      <TableCell className="font-mono text-xs break-all">{inscription.payment_address}</TableCell>
                      <TableCell>{inscription.required_amount_in_sats}</TableCell>
                      <TableCell>{inscription.commit_creation_successful ? 'Created' : 'Pending'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}