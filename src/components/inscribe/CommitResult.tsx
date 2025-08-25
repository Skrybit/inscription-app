import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BUTTON_STYLES } from '@/src/constants/ui';

interface CommitResultProps {
  response: any;
  isLoadingPaymentStatus: boolean;
  checkPaymentStatus: (walletAddress: string | null) => void;
  walletAddress: string | null;
}

// Component for displaying commit result or placeholder
export function CommitResult({
  response,
  isLoadingPaymentStatus,
  checkPaymentStatus,
  walletAddress,
}: CommitResultProps) {
  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 md:w-1/2">
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-gray-800">Create Commit Result</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-sm text-gray-700">
        {response ? (
          <>
            <span><strong>Inscription ID:</strong> {response.inscription_id}</span><br />
            <span><strong>File Size:</strong> {response.file_size_in_bytes} bytes</span><br />
            <span><strong>Payment Address:</strong> {response.payment_address}</span><br />
            <span><strong>Recipient Address:</strong> {response.recipient_address}</span><br />
            <span><strong>Sender Address:</strong> {response.sender_address}</span><br />
            <span><strong>Amount (sats):</strong> {response.required_amount_in_sats}</span><br />
            <span><strong>Status:</strong> {response.commmit_creation_successful ? 'Created' : 'Pending'}</span><br />
            <Button
              onClick={() => checkPaymentStatus(walletAddress)}
              disabled={isLoadingPaymentStatus}
              className={`mt-4 w-full ${BUTTON_STYLES.TEAL_BLUE} ${
                isLoadingPaymentStatus ? BUTTON_STYLES.DISABLED : ''
              }`}
            >
              {isLoadingPaymentStatus ? 'Checking...' : 'Check Payment Status'}
            </Button>
          </>
        ) : (
          <span>No commit result yet.</span>
        )}
      </CardContent>
    </Card>
  );
}