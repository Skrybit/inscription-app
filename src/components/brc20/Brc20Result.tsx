import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

interface Brc20ResultProps {
  deployResponse: any;
  mintResponse: any;
  isLoadingBrc20Pay: boolean;
  brc20PaymentStatus: any;
  payBrc20: (walletAddress: string | null, paymentAddress: string, amount: string, feeRate: string) => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

export function Brc20Result({
  deployResponse,
  mintResponse,
  isLoadingBrc20Pay,
  brc20PaymentStatus,
  payBrc20,
  isWalletConnected,
  walletAddress,
}: Brc20ResultProps) {
  const hasValidResponse =
    (deployResponse?.inscription_results?.[0]?.commit_response?.payment_address &&
      deployResponse?.inscription_results?.[0]?.commit_response?.required_amount_in_sats) ||
    (mintResponse?.inscription_results?.[0]?.commit_response?.payment_address &&
      mintResponse?.inscription_results?.[0]?.commit_response?.required_amount_in_sats);

  if (!deployResponse && !mintResponse) {
    return (
      <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 w-full">
        <CardHeader className="p-2">
          <CardTitle className="text-xl font-bold text-gray-800">BRC-20 Result</CardTitle>
        </CardHeader>
        <CardContent className="p-2 text-sm text-gray-700">
          <p>No result yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-gray-800">BRC-20 Result</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-sm text-gray-700 space-y-2">
        {deployResponse && (
          <>
            <p><strong>Success:</strong> {deployResponse.success ? 'Yes' : 'No'}</p>
            <p><strong>Ticker:</strong> {deployResponse.inscription_data?.ticker || 'N/A'}</p>
            <p><strong>Fee Rate:</strong> {deployResponse.fee_rate || 'N/A'} sats/vbyte</p>
            <p><strong>Max Supply:</strong> {deployResponse.inscription_data?.max_supply || 'N/A'}</p>
            <p><strong>Amount Per Mint:</strong> {deployResponse.inscription_data?.amount_per_mint || 'N/A'}</p>
            <p><strong>Destination Address:</strong> {deployResponse.inscription_data?.destination_address || 'N/A'}</p>
            <p><strong>Sender Address:</strong> {deployResponse.inscription_data?.sender_address || 'N/A'}</p>
            <p><strong>Timestamp:</strong> {deployResponse.inscription_data?.timestamp || 'N/A'}</p>
          </>
        )}
        {mintResponse && (
          <>
            <p><strong>Success:</strong> {mintResponse.success ? 'Yes' : 'No'}</p>
            <p><strong>Ticker:</strong> {mintResponse.inscription_data?.ticker || 'N/A'}</p>
            <p><strong>Fee Rate:</strong> {mintResponse.fee_rate || 'N/A'} sats/vbyte</p>
            <p><strong>Amount:</strong> {mintResponse.inscription_data?.amount || 'N/A'}</p>
            <p><strong>Number of Mints:</strong> {mintResponse.inscription_data?.number_of_mints || 'N/A'}</p>
            <p><strong>Sender Address:</strong> {mintResponse.inscription_data?.sender_address || 'N/A'}</p>
            <p><strong>Timestamp:</strong> {mintResponse.inscription_data?.timestamp || 'N/A'}</p>
          </>
        )}
        {brc20PaymentStatus?.txid && (
          <p><strong>Payment TXID:</strong> {brc20PaymentStatus.txid}</p>
        )}
        {hasValidResponse && !brc20PaymentStatus?.is_paid && (
          <Button
            onClick={() => {
              const response = deployResponse || mintResponse;
              const { payment_address, required_amount_in_sats } = response.inscription_results[0].commit_response;
              payBrc20(walletAddress, payment_address, required_amount_in_sats, response.fee_rate);
            }}
            disabled={isLoadingBrc20Pay || !isWalletConnected}
            className={`w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 mt-4 ${
              isLoadingBrc20Pay || !isWalletConnected ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoadingBrc20Pay ? 'Processing...' : 'Pay Now'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}