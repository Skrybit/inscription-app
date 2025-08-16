import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { apiLocalClient } from '../src/config'; // Adjust path
import { API_CONSTANTS } from '../src/constants/api'; // Adjust path

export default function InscribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [feeRate, setFeeRate] = useState('10');
  const [senderAddress, setSenderAddress] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [refreshResult, setRefreshResult] = useState<any>(null);
  const [newTokenResult, setNewTokenResult] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

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
  }, []);

  const getAuthHeaders = () => {
    const token = Cookies.get('authToken');
    return token ? { authorization: `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
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
    const feeRateNum = parseFloat(feeRate);
    if (isNaN(feeRateNum) || feeRateNum <= 0) {
      setError('Fee rate must be a positive number');
      return;
    }

    const formData = new FormData();
    formData.append('recipient_address', recipientAddress);
    formData.append('fee_rate', feeRate);
    if (senderAddress) formData.append('sender_address', senderAddress);
    formData.append('file', file, file.name);

    console.log('FormData sent:', {
      recipient_address: recipientAddress,
      fee_rate: feeRate,
      sender_address: senderAddress,
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

  const refreshToken = async () => {
    try {
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.AUTH.REFRESH_TOKEN, {}, {
        headers: getAuthHeaders(),
      });
      setRefreshResult(res.data);
      setError('');
    } catch (err: any) {
      console.error('Refresh token error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error refreshing token')
      );
    }
  };

  const generateNewToken = async () => {
    try {
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.AUTH.NEW_TOKEN, {}, {
        headers: getAuthHeaders(),
      });
      setNewTokenResult(res.data);
      setError('');
    } catch (err: any) {
      console.error('New token error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
        (err.response?.data?.details ? JSON.stringify(err.response.data.details) : 'Error generating new token')
      );
    }
  };

  const checkPaymentStatus = async () => {
    if (!response) {
      setError('Create an inscription first');
      return;
    }

    try {
      const res = await apiLocalClient.post(API_CONSTANTS.PROXY.INSCRIPTIONS.PAYMENT_STATUS, {
        payment_address: response.payment_address,
        required_amount_in_sats: response.required_amount_in_sats,
        sender_address: response.sender_address,
        id: response.inscription_id,
      }, {
        headers: getAuthHeaders(),
      });
      setPaymentStatus(res.data);
      setError('');
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

  return (
    <div>
      <h1>Create Inscription</h1>
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
        <input
          type="text"
          placeholder="Sender Address (optional, try mainnet: bc1q...)"
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
        />
        <button type="submit">Create Commit</button>
      </form>
      <button onClick={fetchStats}>Fetch Stats</button>
      <button onClick={refreshToken}>Refresh Token</button>
      <button onClick={generateNewToken}>Generate New Token</button>
      <button onClick={checkPaymentStatus}>Check Payment Status</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (
        <div>
          <h2>Response:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
          <p>Send {response.required_amount_in_sats} sats to {response.payment_address}</p>
        </div>
      )}
      {stats && (
        <div>
          <h2>Stats:</h2>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
      {refreshResult && (
        <div>
          <h2>Refresh Token Result:</h2>
          <pre>{JSON.stringify(refreshResult, null, 2)}</pre>
        </div>
      )}
      {newTokenResult && (
        <div>
          <h2>New Token Result:</h2>
          <pre>{JSON.stringify(newTokenResult, null, 2)}</pre>
        </div>
      )}
      {paymentStatus && (
        <div>
          <h2>Payment Status:</h2>
          <pre>{JSON.stringify(paymentStatus, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}