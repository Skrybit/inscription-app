import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

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
    try {
      const response = await axios.post(`${API_BASE_URL}/inscriptions/create-reveal`, {
        inscription_id: inscriptionId,
        commit_tx_id: commitTxId,
        vout,
        amount,
      }, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      setSuccess('Reveal transaction created! TX Hex: ' + response.data.reveal_tx_hex);
      fetchInscriptions();
      setInscriptionId('');
      setCommitTxId('');
      setVout('0');
      setAmount('');
    } catch (e) {
      setError('Failed to create reveal: ' + (e.response?.data?.error || e.message));
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