function WalletConnect({ account, connectWallet, disconnectWallet }) {
  console.log('Rendering WalletConnect, account:', account);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Connect Wallet</h2>
      {account ? (
        <div className="flex items-center space-x-2">
          <span className="text-green-600 font-medium">Connected:</span>
          <span className="text-gray-600 truncate">{account}</span>
          <button onClick={disconnectWallet} className="btn-primary ml-2">
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <button onClick={connectWallet} className="btn-primary">
          Connect UniSat Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnect;