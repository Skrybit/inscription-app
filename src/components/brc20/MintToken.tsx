import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

interface MintTokenProps {
  mintTicker: string;
  setMintTicker: (value: string) => void;
  mintAmount: string;
  setMintAmount: (value: string) => void;
  numberOfMints: string;
  setNumberOfMints: (value: string) => void;
  mintFeeRate: string;
  setMintFeeRate: (value: string) => void;
  isLoadingMint: boolean;
  mintToken: (walletAddress: string | null) => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

export function MintToken({
  mintTicker,
  setMintTicker,
  mintAmount,
  setMintAmount,
  numberOfMints,
  setNumberOfMints,
  mintFeeRate,
  setMintFeeRate,
  isLoadingMint,
  mintToken,
  isWalletConnected,
  walletAddress,
}: MintTokenProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mintToken(walletAddress);
  };

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-gray-800">Mint BRC-20 Tokens</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-sm text-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ticker (4 uppercase letters)</label>
            <Input
              type="text"
              value={mintTicker}
              onChange={(e) => setMintTicker(e.target.value.toUpperCase())}
              placeholder="e.g., TEST"
              className="mt-1"
              maxLength={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <Input
              type="text"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="e.g., 1000"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Mints</label>
            <Input
              type="text"
              value={numberOfMints}
              onChange={(e) => setNumberOfMints(e.target.value)}
              placeholder="e.g., 10"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fee Rate (sats/vbyte)</label>
            <Input
              type="number"
              value={mintFeeRate}
              onChange={(e) => setMintFeeRate(e.target.value)}
              placeholder="e.g., 1"
              min="1"
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoadingMint || !isWalletConnected}
            className={`w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isLoadingMint || !isWalletConnected ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoadingMint ? 'Minting...' : 'Mint Tokens'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}