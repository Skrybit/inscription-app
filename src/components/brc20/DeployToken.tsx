import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

interface DeployTokenProps {
  deployTicker: string;
  setDeployTicker: (value: string) => void;
  maxSupply: string;
  setMaxSupply: (value: string) => void;
  amountPerMint: string;
  setAmountPerMint: (value: string) => void;
  destinationAddress: string;
  setDestinationAddress: (value: string) => void;
  deployFeeRate: string;
  setDeployFeeRate: (value: string) => void;
  isLoadingDeploy: boolean;
  deployToken: (walletAddress: string | null) => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

export function DeployToken({
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
  isLoadingDeploy,
  deployToken,
  isWalletConnected,
  walletAddress,
}: DeployTokenProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    deployToken(walletAddress);
  };

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-gray-800">Deploy BRC-20 Token</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-sm text-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ticker (4 uppercase letters)</label>
            <Input
              type="text"
              value={deployTicker}
              onChange={(e) => setDeployTicker(e.target.value.toUpperCase())}
              placeholder="e.g., TEST"
              className="mt-1"
              maxLength={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Supply</label>
            <Input
              type="text"
              value={maxSupply}
              onChange={(e) => setMaxSupply(e.target.value)}
              placeholder="e.g., 21000000"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Per Mint</label>
            <Input
              type="text"
              value={amountPerMint}
              onChange={(e) => setAmountPerMint(e.target.value)}
              placeholder="e.g., 1000"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Destination Address</label>
            <Input
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="e.g., bc1qexampleaddress"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fee Rate (sats/vbyte)</label>
            <Input
              type="number"
              value={deployFeeRate}
              onChange={(e) => setDeployFeeRate(e.target.value)}
              placeholder="e.g., 1"
              min="1"
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoadingDeploy || !isWalletConnected}
            className={`w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isLoadingDeploy || !isWalletConnected ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoadingDeploy ? 'Deploying...' : 'Deploy Token'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}