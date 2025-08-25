import { useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Spinner } from '@/src/components/ui/spinner';
import { CreateInscription } from '@/src/components/inscribe/CreateInscription';
import { CommitResult } from '@/src/components/inscribe/CommitResult';
import { Payment } from '@/src/components/inscribe/Payment';
import { Stats } from '@/src/components/inscribe/Stats';
import { GetInscriptionDetails } from '@/src/components/inscribe/GetInscriptionDetails';
import { WalletInscriptions } from '@/src/components/inscribe/WalletInscriptions';
import { InscriptionDialogs } from '@/src/components/inscribe/InscriptionDialogs';
import { useInscription } from '@/src/hooks/useInscription';
import { useWallet } from '@/src/hooks/useWallet';

// Main page component for Bitcoin Ordinals Inscriber
export default function InscribePage() {
  const {
    file,
    setFile,
    recipientAddress,
    setRecipientAddress,
    feeRate,
    setFeeRate,
    response,
    stats,
    paymentStatus,
    inscriptionDetails,
    inscriptionIdInput,
    setInscriptionIdInput,
    isPolling,
    setIsPolling,
    isLoadingSubmit,
    isLoadingPay,
    isLoadingStats,
    isLoadingPaymentStatus,
    isLoadingDetails,
    showPaymentStatusDialog,
    setShowPaymentStatusDialog,
    showInscriptionDetailsDialog,
    setShowInscriptionDetailsDialog,
    handleSubmit,
    payNow,
    fetchStats,
    checkPaymentStatus,
    getInscriptionDetails,
  } = useInscription();

  const {
    walletAddress,
    isWalletConnected,
    isLoadingConnect,
    connectWallet,
    disconnectWallet,
    walletInscriptions,
    isLoadingInscriptions,
    fetchWalletInscriptions,
  } = useWallet();

  // Log re-renders to debug excessive stats requests
  useEffect(() => {
    // console.log('InscribePage rendered at:', new Date().toISOString());
  });

  // Initialize UniSat SDK on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@unisat/wallet-sdk@latest/lib/unisat.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const isAnyLoading =
    isLoadingConnect ||
    isLoadingInscriptions ||
    isLoadingSubmit ||
    isLoadingPay ||
    isLoadingStats ||
    isLoadingPaymentStatus ||
    isLoadingDetails;

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
            {isLoadingConnect
              ? 'Connecting...'
              : isWalletConnected
              ? `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}`
              : 'Connect Wallet'}
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
          <CreateInscription
            file={file}
            setFile={setFile}
            recipientAddress={recipientAddress}
            setRecipientAddress={setRecipientAddress}
            feeRate={feeRate}
            setFeeRate={setFeeRate}
            isLoadingSubmit={isLoadingSubmit}
            handleSubmit={handleSubmit}
            isWalletConnected={isWalletConnected}
            walletAddress={walletAddress}
          />
          <CommitResult
            response={response}
            isLoadingPaymentStatus={isLoadingPaymentStatus}
            checkPaymentStatus={checkPaymentStatus}
            walletAddress={walletAddress}
          />
        </div>

        {/* Payment */}
        {response && (
          <Payment
            requiredAmount={response.required_amount_in_sats}
            paymentAddress={response.payment_address}
            isLoadingPay={isLoadingPay}
            payNow={payNow}
            isWalletConnected={isWalletConnected}
            walletAddress={walletAddress}
          />
        )}

        {/* Stats and Get Inscription Details */}
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {stats && (
            <Stats stats={stats} isLoadingStats={isLoadingStats} fetchStats={fetchStats} />
          )}
          <GetInscriptionDetails
            inscriptionIdInput={inscriptionIdInput}
            setInscriptionIdInput={setInscriptionIdInput}
            isLoadingDetails={isLoadingDetails}
            getInscriptionDetails={getInscriptionDetails}
            response={response}
          />
        </div>

        {/* Dialogs for Payment Status and Inscription Details */}
        <InscriptionDialogs
          paymentStatus={paymentStatus}
          inscriptionDetails={inscriptionDetails}
          showPaymentStatusDialog={showPaymentStatusDialog}
          setShowPaymentStatusDialog={setShowPaymentStatusDialog}
          showInscriptionDetailsDialog={showInscriptionDetailsDialog}
          setShowInscriptionDetailsDialog={setShowInscriptionDetailsDialog}
        />

        {/* Loading Spinner */}
        {isAnyLoading && (
          <div className="flex justify-center">
            <Spinner className="h-10 w-10" />
          </div>
        )}

        {/* Wallet Inscriptions */}
        {walletInscriptions.length > 0 && (
          <WalletInscriptions inscriptions={walletInscriptions} />
        )}
      </main>
    </div>
  );
}