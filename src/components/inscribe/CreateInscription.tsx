import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { FormEvent } from 'react';
import { BUTTON_STYLES } from '@/src/constants/ui';

interface CreateInscriptionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  feeRate: string;
  setFeeRate: (fee: string) => void;
  isLoadingSubmit: boolean;
  handleSubmit: (e: FormEvent, walletAddress: string | null) => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

// Component for creating a new inscription
export function CreateInscription({
  file,
  setFile,
  recipientAddress,
  setRecipientAddress,
  feeRate,
  setFeeRate,
  isLoadingSubmit,
  handleSubmit,
  isWalletConnected,
  walletAddress,
}: CreateInscriptionProps) {
//   console.log('CreateInscription props:', { isWalletConnected, walletAddress });

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 md:w-1/2">
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-gray-800">Create Inscription</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <form onSubmit={(e) => handleSubmit(e, walletAddress)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium text-gray-700">
              Choose File
            </label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="recipient" className="text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <Input
              id="recipient"
              type="text"
              placeholder="Enter mainnet address (bc1q...)"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="feeRate" className="text-sm font-medium text-gray-700">
              Fee Rate (sats/vbyte)
            </label>
            <Input
              id="feeRate"
              type="number"
              placeholder="e.g., 1"
              value={feeRate}
              onChange={(e) => setFeeRate(e.target.value)}
              min="1"
              className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoadingSubmit}
            className={`w-full ${BUTTON_STYLES.TEAL_BLUE} ${
              isLoadingSubmit ? BUTTON_STYLES.DISABLED : ''
            }`}
          >
            {isLoadingSubmit ? 'Creating...' : 'Create Commit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}