import { useState, useEffect } from 'react';
import axios from 'axios';
import WalletConnect from './components/WalletConnect.jsx';
import CreateCommitForm from './components/CreateCommitForm.jsx';
import InscriptionsList from './components/InscriptionsList.jsx';
import RevealTransactionForm from './components/RevealTransactionForm.jsx';
import PaymentStatusForm from './components/PaymentStatusForm.jsx';
import StatsDisplay from './components/StatsDisplay.jsx';
import Toast from './components/Toast.jsx';

function App() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commitResponse, setCommitResponse] = useState(null);

  const connectWallet = async () => {
    if (window.unisat) {
      try {
        const accounts = await window.unisat.requestAccounts();
        setAccount(accounts[0]);
        setError(null);
        setSuccess('Wallet connected successfully!');
      } catch (e) {
        setError('Failed to connect UniSat wallet: ' + e.message);
      }
    } else {
      setError('UniSat wallet not detected. Please install the extension.');
    }
  };

  const disconnectWallet = () => {
    // Clear local state
    setAccount(null);
    setInscriptions([]);
    setCommitResponse(null);
    setSuccess('Wallet disconnected successfully! If reconnecting without approval persists, clear UniSat permissions in the wallet settings or use incognito mode.');
    // Clear all browser storage to reset UniSat session
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      console.log('Cleared localStorage, sessionStorage, and cookies');
      // Force page reload to reset UniSat session
      window.location.reload();
    } catch (e) {
      console.error('Error clearing browser storage:', e.message);
      setError('Failed to clear wallet session: ' + e.message);
    }
  };

  const fetchInscriptions = async () => {
    if (!account) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/inscriptions/sender/${account}`);
      setInscriptions(response.data);
      setError(null);
    } catch (e) {
      setError('Failed to fetch inscriptions: ' + (e.response?.data?.error || e.message));
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/inscriptions/stats`);
      setStats(response.data);
      setError(null);
    } catch (e) {
      setError('Failed to fetch stats: ' + (e.response?.data?.error || e.message));
    }
  };

  useEffect(() => {
    fetchStats();
    if (account) {
      fetchInscriptions();
    }
  }, [account]);

  console.log('Rendering App, account:', account, 'sidebarOpen:', sidebarOpen, 'commitResponse:', commitResponse);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Tailwind Test */}
      <div className="fixed top-0 left-0 p-2 bg-blue-500 text-white text-xs">
        Tailwind Test
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out z-30`}>
        <div className="p-4">
          <h2 className="text-2xl font-bold">Ordinals App</h2>
        </div>
        <nav className="mt-4">
          <a href="#wallet" className="block px-4 py-2 hover:bg-gray-700">Wallet</a>
          <a href="#create" className="block px-4 py-2 hover:bg-gray-700">Create Commit</a>
          <a href="#inscriptions" className="block px-4 py-2 hover:bg-gray-700">Inscriptions</a>
          <a href="#reveal" className="block px-4 py-2 hover:bg-gray-700">Reveal Transaction</a>
          <a href="#payment" className="block px-4 py-2 hover:bg-gray-700">Payment Status</a>
          <a href="#stats" className="block px-4 py-2 hover:bg-gray-700">Stats</a>
        </nav>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-teal-600 text-white rounded-lg font-medium"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? 'Close' : 'Menu'}
      </button>

      {/* Main Content */}
      <div className="md:ml-64 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Ordinals Inscription Dashboard</h1>

        {/* Toast Notifications */}
        {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
        {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

        {/* Wallet Connection */}
        <div id="wallet" className="mb-8">
          <WalletConnect account={account} connectWallet={connectWallet} disconnectWallet={disconnectWallet} />
        </div>

        {account && (
          <div className="space-y-8">
            <div id="create">
              <CreateCommitForm
                senderAddress={account}
                setError={setError}
                setSuccess={setSuccess}
                fetchInscriptions={fetchInscriptions}
                setCommitResponse={setCommitResponse}
              />
            </div>
            <div id="inscriptions">
              <InscriptionsList inscriptions={inscriptions} />
            </div>
            <div id="reveal">
              <RevealTransactionForm
                setError={setError}
                setSuccess={setSuccess}
                fetchInscriptions={fetchInscriptions}
              />
            </div>
            <div id="payment">
              <PaymentStatusForm
                senderAddress={account}
                setError={setError}
                setSuccess={setSuccess}
                commitResponse={commitResponse}
              />
            </div>
            <div id="stats">
              <StatsDisplay stats={stats} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;