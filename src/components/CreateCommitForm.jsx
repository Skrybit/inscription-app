import { useState } from 'react';
import axios from 'axios';

function CreateCommitForm({ senderAddress, setError, setSuccess, fetchInscriptions, setCommitResponse }) {
  const [file, setFile] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [commitResponse, setLocalCommitResponse] = useState(null);

  // Bitcoin address validation (permissive)
  const isValidBitcoinAddress = (address) => {
    if (!address || typeof address !== 'string' || address.length < 26 || address.length > 90) return false;
    const regex = /^(bc1q|tb1q|bc1p|tb1p|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/i;
    return regex.test(address.trim());
  };

  // Validate file type
  const isValidFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'text/plain', 'application/pdf'];
    return file && allowedTypes.includes(file.type);
  };

  // Log FormData content for debugging
  const logFormData = (formData) => {
    const entries = {};
    for (const [key, value] of formData.entries()) {
      entries[key] = key === 'file' ? { name: value.name, size: value.size, type: value.type } : value;
    }
    return entries;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!file || !recipientAddress || !feeRate || !senderAddress) {
      setError('Please fill all fields and select a file.');
      return;
    }
    if (file.size > 400 * 1024) {
      setError('File size must be less than 400KB.');
      return;
    }
    if (!isValidFileType(file)) {
      setError('Unsupported file type. Use JPEG, PNG, TXT, or PDF.');
      return;
    }
    if (!isValidBitcoinAddress(recipientAddress)) {
      setError('Invalid recipient Bitcoin address.');
      return;
    }
    if (!isValidBitcoinAddress(senderAddress)) {
      setError('Invalid sender Bitcoin address.');
      return;
    }
    if (isNaN(feeRate) || feeRate < 1) {
      setError('Fee rate must be a positive number (minimum 1 sat/byte).');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipient_address', recipientAddress);
    formData.append('fee_rate', feeRate);
    formData.append('sender_address', senderAddress);

    // Log payload for debugging
    console.log('CreateCommitForm payload:', logFormData(formData));

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/inscriptions/create-commit`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'User-Agent': 'Mozilla/5.0 (compatible; Bruno)',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
      });
      setSuccess(`Commit created successfully! Inscription ID: ${response.data.inscription_id}`);
      setLocalCommitResponse(response.data);
      setCommitResponse(response.data);
      fetchInscriptions();
      setFile(null);
      setRecipientAddress('');
      setFeeRate('');
    } catch (e) {
      const errorMessage = e.response?.data?.error || (typeof e.response?.data === 'string' ? 'Server error (HTML response)' : e.message);
      console.error('CreateCommitForm error:', {
        status: e.response?.status,
        data: e.response?.data,
        message: e.message,
        headers: e.response?.headers,
      });
      setError(`Failed to create commit: ${errorMessage}. Try a different file, fee rate, or check server logs.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!window.unisat) {
      setError('UniSat wallet not detected. Please install the extension.');
      return;
    }
    if (!commitResponse || !commitResponse.payment_address || !commitResponse.required_amount_in_sats) {
      setError('No valid payment details available. Create a commit first.');
      return;
    }

    setPaymentLoading(true);
    try {
      const txid = await window.unisat.sendBitcoin(
        commitResponse.payment_address,
        parseInt(commitResponse.required_amount_in_sats)
      );
      setSuccess(`Payment sent successfully! TXID: ${txid}`);
      console.log('Payment sent, TXID:', txid);
    } catch (e) {
      setError('Failed to send payment: ' + e.message);
      console.error('Payment error:', e.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  console.log('Rendering CreateCommitForm, loading:', loading, 'paymentLoading:', paymentLoading, 'commitResponse:', commitResponse);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Commit Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">File (max 400KB, JPEG/PNG/TXT/PDF)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,text/plain,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="input mt-1"
            placeholder="bc1q..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fee Rate (sats/byte)</label>
          <input
            type="number"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="input mt-1"
            placeholder="Enter fee rate"
            min="1"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Commit'}
        </button>
      </form>
      {commitResponse && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p><strong>Inscription ID:</strong> {commitResponse.inscription_id}</p>
          <p><strong>Payment Address:</strong> <span className="truncate">{commitResponse.payment_address}</span></p>
          <p><strong>Amount to Pay (sats):</strong> {commitResponse.required_amount_in_sats}</p>
          <p><strong>File Size:</strong> {commitResponse.file_size_in_bytes} bytes</p>
          <p><strong>Commit Creation Successful:</strong> {commitResponse.commmit_creation_successful ? 'Yes' : 'No'}</p>
          <button
            onClick={handlePayment}
            className="btn-primary mt-2"
            disabled={paymentLoading || !commitResponse.payment_address || !commitResponse.required_amount_in_sats}
          >
            {paymentLoading ? 'Sending Payment...' : 'Pay Now'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateCommitForm;