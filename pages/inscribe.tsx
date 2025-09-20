'use client';

import { useEffect, useState } from 'react';
import { initializeAuthToken } from '@/src/services/auth';
import { useInscription } from '@/src/hooks/useInscription';
import { useWallet } from '@/src/hooks/useWallet';
import { useBrc20 } from '@/src/hooks/useBrc20';
import { CreateInscription } from '@/src/components/inscribe/CreateInscription';
import { CommitResult } from '@/src/components/inscribe/CommitResult';
import { Payment } from '@/src/components/inscribe/Payment';
import { Stats } from '@/src/components/inscribe/Stats';
import { GetInscriptionDetails } from '@/src/components/inscribe/GetInscriptionDetails';
import { WalletInscriptions } from '@/src/components/inscribe/WalletInscriptions';
import { InscriptionDialogs } from '@/src/components/inscribe/InscriptionDialogs';
import { DeployToken } from '@/src/components/brc20/DeployToken';
import { CheckTicker } from '@/src/components/brc20/CheckTicker';
import { MintToken } from '@/src/components/brc20/MintToken';
import { Brc20Result } from '@/src/components/brc20/Brc20Result';
import { Spinner } from '@/src/components/ui/spinner';
import { Button } from '@/src/components/ui/button';

export default function InscribePage() {
  const [activeTab, setActiveTab] = useState<'inscription' | 'brc20'>('inscription');

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

  const {
    deployTicker,
    setDeployTicker,
    maxSupply,
    setMaxSupply,
    amountPerMint,
    setAmountPerMint,
    destinationAddress,
    setDestinationAddress,
    deployFeeRate,
    setDeployFeeRate,
    deployResponse,
    checkTicker,
    setCheckTicker,
    checkTickerResponse,
    mintTicker,
    setMintTicker,
    mintAmount,
    setMintAmount,
    numberOfMints,
    setNumberOfMints,
    mintFeeRate,
    setMintFeeRate,
    mintResponse,
    isLoadingDeploy,
    isLoadingCheckTicker,
    isLoadingMint,
    isLoadingBrc20Pay,
    brc20PaymentStatus,
    deployToken,
    checkTickerExists,
    mintToken,
    payBrc20,
  } = useBrc20();

  // Initialize auth token and UniSat SDK on mount
  useEffect(() => {
    initializeAuthToken();
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@unisat/wallet-sdk@latest/lib/unisat.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const isAnyLoading =
    isLoadingSubmit ||
    isLoadingPay ||
    isLoadingStats ||
    isLoadingPaymentStatus ||
    isLoadingDetails ||
    isLoadingConnect ||
    isLoadingInscriptions ||
    isLoadingDeploy ||
    isLoadingCheckTicker ||
    isLoadingMint ||
    isLoadingBrc20Pay;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <header className="w-full max-w-5xl mb-8 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
          Bitcoin Ordinals Inscriber
        </h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
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
      <nav className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <Button
          onClick={() => setActiveTab('inscription')}
          className={`w-full sm:w-auto bg-gradient-to-r ${
            activeTab === 'inscription'
              ? 'from-teal-600 to-blue-600 border-b-4 border-teal-800 shadow-lg scale-105'
              : 'from-teal-400 to-blue-400 hover:from-teal-500 hover:to-blue-500 border-b-2 border-teal-600'
          } text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50`}
        >
          Create Inscription
        </Button>
        <Button
          onClick={() => setActiveTab('brc20')}
          className={`w-full sm:w-auto bg-gradient-to-r ${
            activeTab === 'brc20'
              ? 'from-teal-600 to-blue-600 border-b-4 border-teal-800 shadow-lg scale-105'
              : 'from-teal-400 to-blue-400 hover:from-teal-500 hover:to-blue-500 border-b-2 border-teal-600'
          } text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50`}
        >
          BRC20
        </Button>
      </nav>
      <main className="w-full max-w-5xl space-y-6">
        {activeTab === 'inscription' && (
          <>
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
            {walletInscriptions.length > 0 && (
              <WalletInscriptions inscriptions={walletInscriptions} />
            )}
          </>
        )}
        {activeTab === 'brc20' && (
          <>
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
              <DeployToken
                deployTicker={deployTicker}
                setDeployTicker={setDeployTicker}
                maxSupply={maxSupply}
                setMaxSupply={setMaxSupply}
                amountPerMint={amountPerMint}
                setAmountPerMint={setAmountPerMint}
                destinationAddress={destinationAddress}
                setDestinationAddress={setDestinationAddress}
                deployFeeRate={deployFeeRate}
                setDeployFeeRate={setDeployFeeRate}
                isLoadingDeploy={isLoadingDeploy}
                deployToken={deployToken}
                isWalletConnected={isWalletConnected}
                walletAddress={walletAddress}
              />
              <Brc20Result
                deployResponse={deployResponse}
                mintResponse={mintResponse}
                isLoadingBrc20Pay={isLoadingBrc20Pay}
                brc20PaymentStatus={brc20PaymentStatus}
                payBrc20={payBrc20}
                isWalletConnected={isWalletConnected}
                walletAddress={walletAddress}
              />
            </div>
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
              <CheckTicker
                checkTicker={checkTicker}
                setCheckTicker={setCheckTicker}
                checkTickerResponse={checkTickerResponse}
                isLoadingCheckTicker={isLoadingCheckTicker}
                checkTickerExists={checkTickerExists}
              />
              <MintToken
                mintTicker={mintTicker}
                setMintTicker={setMintTicker}
                mintAmount={mintAmount}
                setMintAmount={setMintAmount}
                numberOfMints={numberOfMints}
                setNumberOfMints={setNumberOfMints}
                mintFeeRate={mintFeeRate}
                setMintFeeRate={setMintFeeRate}
                isLoadingMint={isLoadingMint}
                mintToken={mintToken}
                isWalletConnected={isWalletConnected}
                walletAddress={walletAddress}
              />
            </div>
          </>
        )}
        {isAnyLoading && (
          <div className="flex justify-center mt-6">
            <Spinner className="h-10 w-10" />
          </div>
        )}
        <InscriptionDialogs
          paymentStatus={paymentStatus}
          inscriptionDetails={inscriptionDetails}
          showPaymentStatusDialog={showPaymentStatusDialog}
          setShowPaymentStatusDialog={setShowPaymentStatusDialog}
          showInscriptionDetailsDialog={showInscriptionDetailsDialog}
          setShowInscriptionDetailsDialog={setShowInscriptionDetailsDialog}
        />
      </main>
    </div>
  );
}