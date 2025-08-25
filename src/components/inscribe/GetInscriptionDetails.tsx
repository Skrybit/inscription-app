import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

interface GetInscriptionDetailsProps {
  inscriptionIdInput: string;
  setInscriptionIdInput: (id: string) => void;
  isLoadingDetails: boolean;
  getInscriptionDetails: () => void;
  response: any;
}

// Component for fetching inscription details
export function GetInscriptionDetails({
  inscriptionIdInput,
  setInscriptionIdInput,
  isLoadingDetails,
  getInscriptionDetails,
}: GetInscriptionDetailsProps) {
  return (
    <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 md:w-1/2">
      <CardHeader className="p-2">
        <CardTitle className="text-lg font-bold text-gray-800">Get Inscription Details</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <Input
            id="inscriptionId"
            type="text"
            placeholder="Enter Inscription ID"
            value={inscriptionIdInput}
            onChange={(e) => setInscriptionIdInput(e.target.value)}
            className="border-gray-300 focus:ring-teal-500 focus:border-teal-500 rounded-lg bg-white text-sm"
          />
          <Button
            onClick={getInscriptionDetails}
            disabled={isLoadingDetails}
            className={`w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isLoadingDetails ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoadingDetails ? 'Fetching...' : 'Get Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}