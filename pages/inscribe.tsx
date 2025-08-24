import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { apiLocalClient } from '../src/config';
import { API_CONSTANTS } from '../src/constants/api';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/src/components/ui/alert-dialog';
import { Spinner } from '@/src/components/ui/spinner';
import { toast } from 'sonner';

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
  const [stats, setStats] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [inscriptionDetails, setInscriptionDetails] = useState<any>(null);
  const [inscriptionIdInput, setInscriptionIdInput] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [walletInscriptions, setWalletInscriptions] = useState<any[]>([]);
  const [isLoadingConnect, setIsLoadingConnect] = useState(false);
  const [isLoadingInscriptions, setIsLoadingInscriptions] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPay, setIsLoadingPay] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showPaymentStatusDialog, setShowPaymentStatusDialog] = useState(false);
  const [showInscriptionDetailsDialog, setShowInscriptionDetailsDialog] = useState(false);

  const isAnyLoading = isLoadingConnect || isLoadingInscriptions || isLoadingSubmit || isLoadingPay || isLoadingStats || isLoadingPaymentStatus || isLoadingDetails;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    if (token) {
      Cookies.set('authToken', token, {
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    } else {
      console.error('No NEXT_PUBLIC_AUTH_TOKEN found in environment variables');
      toast.error('Error', {
        description: 'No authentication token found in environment variables.',
      });
    }

    // Load UniSat SDK
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@unisat/wallet-sdk@latest/lib/unisat.min.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch stats on mount
    fetchStats();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPolling && response && walletAddress) {
      interval = setInterval(async () => {
        try {
          setIsLoadingPaymentStatus(true);
          const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.PAYMENT_STATUS, {
            payment_address: response.payment_address,
            required_amount_in_sats: response.required_amount_in_sats,
            sender_address: walletAddress,
            id: response.inscription_id,
          }, {
            headers: getAuthHeaders(),
          });
          setPaymentStatus(res.data);
          setShowPaymentStatusDialog(true);
          if (res.data.is_paid && res.data.status === 'confirmed') {
            setIsPolling(false);
          }
        } catch (err: any) {
          console.error('Polling payment status error:', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
          });
          toast.error('Error', {
            description: err.response?.data?.message || 'Error polling payment status.',
          });
          setIsPolling(false);
        } finally {
          setIsLoadingPaymentStatus(false);
        }
      }, 30000); // Poll every 30 seconds
      return () => {
        if (interval) clearInterval(interval);
      };
    }
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
      setIsLoadingConnect(true);
      if (window.unisat) {
        const accounts = await window.unisat.requestAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
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
  };

  const fetchWalletInscriptions = async () => {
    if (!walletAddress) return;
    try {
      setIsLoadingInscriptions(true);
      const res = await apiLocalClient.get(API_CONSTANTS.PROXY.INSCRIPTIONS.GET_SENDER(walletAddress), {
        headers: getAuthHeaders(),
      });
      console.log('Raw get-sender response:', res.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!isWalletConnected || !walletAddress) {
      toast.error('Error', {
        description: 'Please connect your UniSat wallet.',
      });
      return;
    }
    const feeRateNum = parseFloat(feeRate);
    if (isNaN(feeRateNum) || feeRateNum <= 0) {
      toast.error('Error', {
        description: 'Fee rate must be a positive number.',
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
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.CREATE_COMMIT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders(),
        },
      });
      setResponse(res.data);
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

  const payNow = async () => {
    if (!response) {
      toast.error('Error', {
        description: 'Create an inscription first.',
      });
      return;
    }
    if (!isWalletConnected || !walletAddress) {
      toast.error('Error', {
        description: 'Please connect your UniSat wallet.',
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

      const txid = await window.unisat.sendBitcoin(toAddress, amount, { feeRate: 30 });
      console.log('Payment sent, txid:', txid);
      setPaymentStatus({ txid, is_paid: false });
      setIsPolling(true);
      setShowPaymentStatusDialog(true);
      toast.success('Success', {
        description: 'Payment sent successfully. TXID: ' + txid,
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error('Error', {
        description: 'Failed to send payment: ' + err.message,
      });
    } finally {
      setIsLoadingPay(false);
    }
  };

  const fetchStats = async () => {
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
  };

  const checkPaymentStatus = async () => {
    if (!response) {
      toast.error('Error', {
        description: 'Create an inscription first.',
      });
      return;
    }
    if (!isWalletConnected || !walletAddress) {
      toast.error('Error', {
        description: 'Please connect your UniSat wallet.',
      });
      return;
    }

    try {
      setIsLoadingPaymentStatus(true);
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.PAYMENT_STATUS, {
        payment_address: response.payment_address,
        required_amount_in_sats: response.required_amount_in_sats,
        sender_address: walletAddress,
        id: response.inscription_id,
      }, {
        headers: getAuthHeaders(),
      });
      setPaymentStatus(res.data);
      setShowPaymentStatusDialog(true);
      if (res.data.is_paid && res.data.status === 'confirmed') {
        setIsPolling(false);
      }
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

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <header className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
          Bitcoin Ordinals Inscriber
        </h1>
        <div className="flex space-x-2">
          <Button
            onClick={connectWallet}
            disabled={isWalletConnected || isLoadingConnect}
            className={`text-sm bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isWalletConnected || isLoadingConnect ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoadingConnect ? 'Connecting...' : isWalletConnected ? `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}` : 'Connect Wallet'}
          </Button>
          {isWalletConnected && (
            <Button
              onClick={disconnectWallet}
              variant="destructive"
              className="text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Disconnect
            </Button>
          )}
        </div>
      </header>

      <main className="w-full max-w-5xl space-y-6">
        {/* Create Inscription and Commit Result */}
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 md:w-1/2">
            <CardHeader className="p-2">
              <CardTitle className="text-xl font-bold text-gray-800">Create Inscription</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={isLoadingSubmit}
                  className={`w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isLoadingSubmit ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoadingSubmit ? 'Creating...' : 'Create Commit'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 md:w-1/2">
            <CardHeader className="p-2">
              <CardTitle className="text-xl font-bold text-gray-800">Create Commit Result</CardTitle>
            </CardHeader>
            <CardContent className="p-2 text-sm text-gray-700">
              {response ? (
                <>
                  <span><strong>Inscription ID:</strong> {response.inscription_id}</span><br />
                  <span><strong>File Size:</strong> {response.file_size_in_bytes} bytes</span><br />
                  <span><strong>Payment Address:</strong> {response.payment_address}</span><br />
                  <span><strong>Recipient Address:</strong> {response.recipient_address}</span><br />
                  <span><strong>Sender Address:</strong> {response.sender_address}</span><br />
                  <span><strong>Amount (sats):</strong> {response.required_amount_in_sats}</span><br />
                  <span><strong>Status:</strong> {response.commmit_creation_successful ? 'Created' : 'Pending'}</span><br />
                  <Button
                    onClick={checkPaymentStatus}
                    disabled={isLoadingPaymentStatus}
                    className={`mt-4 w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      isLoadingPaymentStatus ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoadingPaymentStatus ? 'Checking...' : 'Check Payment Status'}
                  </Button>
                </>
              ) : (
                <span>No commit result yet.</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment */}
        {response && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="p-2">
              <CardTitle className="text-xl font-bold text-gray-800">Payment</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <p className="text-gray-600 mb-4 break-all text-sm">
                Send <span className="font-semibold">{response.required_amount_in_sats}</span> sats to{' '}
                <span className="font-mono text-sm">{response.payment_address}</span>
              </p>
              <Button
                onClick={payNow}
                disabled={isLoadingPay}
                className={`w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isLoadingPay ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoadingPay ? 'Processing...' : 'Pay Now'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats and Get Inscription Details */}
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {stats && (
            <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 md:w-1/2">
              <CardHeader className="p-2 flex justify-between items-center">
                <CardTitle className="text-lg font-bold text-gray-800">Stats</CardTitle>
                <Button
                  onClick={fetchStats}
                  disabled={isLoadingStats}
                  className={`text-sm bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 ${
                    isLoadingStats ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoadingStats ? 'Loading...' : 'Refresh'}
                </Button>
              </CardHeader>
              <CardContent className="p-2 text-sm text-gray-700">
                <span><strong>Total Inscriptions:</strong> {stats.total_inscriptions}</span><br />
                <span><strong>Total Pending:</strong> {stats.total_pending}</span><br />
                <span><strong>Total Broadcasted:</strong> {stats.total_broadcasted}</span><br />
                <span><strong>Total Confirmed:</strong> {stats.total_confirmed}</span>
              </CardContent>
            </Card>
          )}

          <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 md:w-1/2">
            <CardHeader className="p-2">
              <CardTitle className="text-lg font-bold text-gray-800">Get Inscription Details</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <Input
                  id="inscriptionId"
                  type="text"
                  placeholder="Enter Inscription ID"
                  value={inscriptionIdInput}
                  onChange={(e) => setInscriptionIdInput(e.target.value)}
                  className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white text-sm"
                />
                <Button
                  onClick={getInscriptionDetails}
                  disabled={isLoadingDetails}
                  className={`w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isLoadingDetails ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoadingDetails ? 'Fetching...' : 'Get Details'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status Dialog */}
        {paymentStatus && (
          <AlertDialog open={showPaymentStatusDialog} onOpenChange={setShowPaymentStatusDialog}>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-800">Payment Status</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription className="text-sm text-gray-800">
                <span><strong>Paid:</strong> {paymentStatus.is_paid ? 'Yes' : 'No'}</span><br />
                {paymentStatus.payment_utxo ? (
                  <>
                    <span><strong>Transaction ID:</strong> {paymentStatus.payment_utxo.txid}</span><br />
                    <span><strong>Confirmations:</strong> {paymentStatus.payment_utxo.confirmations}</span><br />
                    <span><strong>Amount:</strong> {paymentStatus.payment_utxo.amount} BTC</span>
                  </>
                ) : (
                  <span><strong>Error:</strong> {paymentStatus.error_details?.errMsg || 'No payment UTXO found'}</span>
                )}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogAction className="bg-teal-500 hover:bg-teal-600 text-white">Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Inscription Details Dialog */}
        {inscriptionDetails && (
          <AlertDialog open={showInscriptionDetailsDialog} onOpenChange={setShowInscriptionDetailsDialog}>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-800">Inscription Details</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription className="text-sm text-gray-800">
                <span><strong>ID:</strong> {inscriptionDetails.id}</span><br />
                <span><strong>Payment Address:</strong> {inscriptionDetails.payment_address}</span><br />
                <span><strong>Amount (sats):</strong> {inscriptionDetails.required_amount_in_sats}</span><br />
                <span><strong>File Size:</strong> {inscriptionDetails.file_size_in_bytes} bytes</span><br />
                <span><strong>Status:</strong> {inscriptionDetails.status}</span><br />
                <span><strong>Commit TX ID:</strong> {inscriptionDetails.commit_tx_id}</span><br />
                <span><strong>Reveal TX ID:</strong> {inscriptionDetails.reveal_tx_id}</span><br />
                <span><strong>Sender Address:</strong> {inscriptionDetails.sender_address}</span><br />
                <span><strong>Recipient Address:</strong> {inscriptionDetails.recipient_address}</span><br />
                <span><strong>Created At:</strong> {new Date(inscriptionDetails.created_at).toLocaleString()}</span>
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogAction className="bg-teal-500 hover:bg-teal-600 text-white">Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Loading Spinner */}
        {isAnyLoading && (
          <div className="flex justify-center">
            <Spinner className="h-10 w-10" />
          </div>
        )}

        {/* Wallet Inscriptions */}
        {walletInscriptions.length > 0 && (
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="p-2">
              <CardTitle className="text-xl font-bold text-gray-800">Wallet Inscriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="max-h-[400px] overflow-y-auto">
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
                        <TableCell>{inscription.id}</TableCell>
                        <TableCell className="font-mono text-xs break-all">{inscription.recipient_address}</TableCell>
                        <TableCell className="font-mono text-xs break-all">{inscription.payment_address}</TableCell>
                        <TableCell>{inscription.required_amount_in_sats}</TableCell>
                        <TableCell>{inscription.commit_creation_successful ? 'Created' : 'Pending'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}