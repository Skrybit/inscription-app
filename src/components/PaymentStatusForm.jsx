import { useState, useEffect } from 'react';
import axios from 'axios';

function PaymentStatusForm({ senderAddress, setError, setSuccess, commitResponse }) {
  const [inscriptionId, setInscriptionId] = useState('');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [requiredAmount, setRequiredAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-populate inputs from commitResponse
  useEffect(() => {
    if (commitResponse) {
      setInscriptionId(commitResponse.inscription_id?.toString() || '');
      setPaymentAddress(commitResponse.payment_address || '');
      setRequiredAmount(commitResponse.required_amount_in_sats?.toString() || '');
    }
  }, [commitResponse]);

  // Bitcoin address validation (permissive)
  const isValidBitcoinAddress = (address) => {
    if (!address || typeof address !== 'string' || address.length < 26 || address.length > 90) return false;
    const regex = /^(bc1q|tb1q|bc1p|tb1p|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/i;
    return regex.test(address.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!inscriptionId || !paymentAddress || !requiredAmount) {
      setError('Please fill all fields.');
      return;
    }
    if (!/^\d+$/.test(inscriptionId)) {
      setError('Inscription ID must be a number.');
      return;
    }
    if (!isValidBitcoinAddress(paymentAddress)) {
      setError(`Invalid payment address: ${paymentAddress}`);
      console.log('Invalid payment address:', paymentAddress);
      return;
    }
    if (isNaN(requiredAmount) || parseInt(requiredAmount) <= 0) {
      setError('Required amount must be a positive number.');
      return;
    }

    setLoading(true);
    const payload = {
      id: inscriptionId,
      payment_address: paymentAddress,
      required_amount_in_sats: requiredAmount,
      sender_address: senderAddress,
    };

    // Log payload for debugging
    console.log('PaymentStatusForm payload:', payload);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payments/status`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Bruno)',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
      });
      setStatus({ ...payload, ...response.data });
      setSuccess('Payment status retrieved successfully!');
      setError(null);
      console.log('PaymentStatusForm response:', response.data);
    } catch (e) {
      const errorMessage = e.response?.data?.error || (typeof e.response?.data === 'string' ? 'Server error (HTML response)' : e.message);
      console.error('PaymentStatusForm error:', {
        status: e.response?.status,
        data: e.response?.data,
        message: e.message,
        headers: e.response?.headers,
      });
      setError(`Failed to check payment status: ${errorMessage}. Ensure payment is sent to the address and check server logs.`);
      setStatus({ ...payload, is_paid: false, error_details: e.response?.data?.error_details || {} });
    } finally {
      setLoading(false);
    }
  };

  console.log('Rendering PaymentStatusForm, loading:', loading, 'status:', status, 'commitResponse:', commitResponse);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Check Payment Status</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Inscription ID</label>
          <input
            type="text"
            value={inscriptionId}
            onChange={(e) => setInscriptionId(e.target.value)}
            className="input mt-1"
            placeholder="123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Address</label>
          <input
            type="text"
            value={paymentAddress}
            onChange={(e) => setPaymentAddress(e.target.value)}
            className="input mt-1"
            placeholder="bc1q..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Required Amount (sats)</label>
          <input
            type="number"
            value={requiredAmount}
            onChange={(e) => setRequiredAmount(e.target.value)}
            className="input mt-1"
            placeholder="10000"
            min="1"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>
      <p className="mt-2 text-sm text-gray-600">Note: Ensure you have sent the required payment to the payment address using your wallet.</p>
      {status && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p><strong>Paid:</strong> {status.is_paid ? 'Yes' : 'No'}</p>
          <p><strong>Status:</strong> {status.status || 'Not available'}</p>
          <p><strong>Payment Address:</strong> <span className="truncate">{status.payment_address}</span></p>
          <p><strong>Inscription ID:</strong> {status.id}</p>
          <p><strong>Sender Address:</strong> <span className="truncate">{status.sender_address}</span></p>
          <p><strong>Required Amount (sats):</strong> {status.required_amount_in_sats}</p>
          {status.payment_utxo && (
            <>
              <p><strong>Payment TXID:</strong> <span className="truncate">{status.payment_utxo.txid}</span></p>
              <p><strong>Confirmations:</strong> {status.payment_utxo.confirmations}</p>
            </>
          )}
          {status.error_details && Object.keys(status.error_details).length > 0 && (
            <p><strong>Error Details:</strong> {JSON.stringify(status.error_details)}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default PaymentStatusForm;