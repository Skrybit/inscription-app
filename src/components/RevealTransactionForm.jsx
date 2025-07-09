import { useState } from 'react';
import axios from 'axios';

function RevealTransactionForm({ setError, setSuccess, fetchInscriptions }) {
  const [inscriptionId, setInscriptionId] = useState('');
  const [commitTxId, setCommitTxId] = useState('');
  const [vout, setVout] = useState('0');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inscriptionId || !commitTxId || !vout || !amount) {
      setError('Please fill all fields.');
      return;
    }

    setLoading(true);
    const payload = {
      inscription_id: inscriptionId,
      commit_tx_id: commitTxId,
      vout,
      amount,
    };

    console.log('RevealTransactionForm payload:', payload);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/inscriptions/create-reveal`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Bruno)', // Match Bruno's configuration
          // Add API key if required (e.g., 'Authorization': 'Bearer YOUR_API_KEY')
        },
      });
      setSuccess('Reveal transaction created! TX Hex: ' + response.data.reveal_tx_hex);
      fetchInscriptions();
      setInscriptionId('');
      setCommitTxId('');
      setVout('0');
      setAmount('');
      console.log('RevealTransactionForm response:', response.data);
    } catch (e) {
      const errorMessage = e.response?.data?.error || (typeof e.response?.data === 'string' ? 'Server error (HTML response)' : e.message);
      console.error('RevealTransactionForm error:', {
        status: e.response?.status,
        data: e.response?.data,
        message: e.message,
        headers: e.response?.headers,
      });
      setError('Failed to create reveal: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  console.log('Rendering RevealTransactionForm, loading:', loading);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Reveal Transaction</h2>
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
          <label className="block text-sm font-medium text-gray-700">Commit TX ID</label>
          <input
            type="text"
            value={commitTxId}
            onChange={(e) => setCommitTxId(e.target.value)}
            className="input mt-1"
            placeholder="abc123..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vout</label>
          <input
            type="number"
            value={vout}
            onChange={(e) => setVout(e.target.value)}
            className="input mt-1"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (sats)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input mt-1"
            placeholder="10000"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Reveal'}
        </button>
      </form>
    </div>
  );
}

export default RevealTransactionForm;