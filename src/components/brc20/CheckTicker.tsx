import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

interface CheckTickerProps {
  checkTicker: string;
  setCheckTicker: (value: string) => void;
  checkTickerResponse: any;
  isLoadingCheckTicker: boolean;
  checkTickerExists: () => void;
}

export function CheckTicker({
  checkTicker,
  setCheckTicker,
  checkTickerResponse,
  isLoadingCheckTicker,
  checkTickerExists,
}: CheckTickerProps) {
  const formatDate = (timestamp: string | number | undefined): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(Number(timestamp));
      return isNaN(date.getTime()) ? 'N/A' : date.toISOString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-gray-800">Check BRC-20 Ticker</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-sm text-gray-700">
        <div className="space-y-4">
          <Input
            type="text"
            value={checkTicker}
            onChange={(e) => setCheckTicker(e.target.value.toUpperCase())}
            placeholder="e.g., SATS"
            maxLength={4}
            className="mt-1"
          />
          <Button
            onClick={checkTickerExists}
            disabled={isLoadingCheckTicker}
            className={`w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isLoadingCheckTicker ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoadingCheckTicker ? 'Checking...' : 'Check Ticker'}
          </Button>
          {checkTickerResponse && (
            <div className="mt-4 space-y-2">
              <p><strong>Exists:</strong> {checkTickerResponse.exists ? 'Yes' : 'No'}</p>
              {checkTickerResponse.exists && checkTickerResponse.token_details ? (
                <div className="space-y-2">
                  <p><strong>Ticker:</strong> {checkTickerResponse.ticker || 'N/A'}</p>
                  <p><strong>Max Supply:</strong> {checkTickerResponse.token_details.max_supply || 'N/A'}</p>
                  <p><strong>Amount Per Mint:</strong> {checkTickerResponse.token_details.amount_per_mint || 'N/A'}</p>
                  <p><strong>Deployed At:</strong> {formatDate(checkTickerResponse.token_details.deployed_at)}</p>
                  <p><strong>Deployer Address:</strong> {checkTickerResponse.token_details.deployer_address || 'N/A'}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}