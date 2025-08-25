import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BUTTON_STYLES } from '@/src/constants/ui';

interface PaymentProps {
  requiredAmount: string;
  paymentAddress: string;
  isLoadingPay: boolean;
  payNow: (walletAddress: string | null) => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

// Component for handling payment
export function Payment({
  requiredAmount,
  paymentAddress,
  isLoadingPay,
  payNow,
  isWalletConnected,
  walletAddress,
}: PaymentProps) {
  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-gray-800">Payment</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-sm text-gray-700">
        <span><strong>Payment Address:</strong> {paymentAddress}</span><br />
        <span><strong>Amount (sats):</strong> {requiredAmount}</span><br />
        <Button
          onClick={() => payNow(walletAddress)}
          disabled={isLoadingPay || !isWalletConnected}
          className={`mt-4 w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
            isLoadingPay || !isWalletConnected ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoadingPay ? 'Processing...' : 'Pay Now'}
        </Button>
      </CardContent>
    </Card>
  );
}