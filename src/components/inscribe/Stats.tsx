import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

interface StatsProps {
  stats: any;
  isLoadingStats: boolean;
  fetchStats: () => void;
}

// Component for displaying stats with refresh button
export function Stats({ stats, isLoadingStats, fetchStats }: StatsProps) {
  return (
    <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 md:w-1/2">
      <CardHeader className="p-2 flex justify-between items-center">
        <CardTitle className="text-lg font-bold text-gray-800">Stats</CardTitle>
        <Button
          onClick={fetchStats}
          disabled={isLoadingStats}
          className={`text-sm bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 ${
            isLoadingStats ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoadingStats ? 'Loading...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="p-2 text-sm text-gray-700">
        <span><strong>Total Inscriptions:</strong> {stats.total_inscriptions}</span><br />
        <span><strong>Total Pending:</strong> {stats.total_pending}</span><br />
        <span><strong>Total Broadcasted:</strong> {stats.total_broadcasted}</span><br />
        <span><strong>Total Confirmed:</strong> {stats.total_confirmed}</span>
      </CardContent>
    </Card>
  );
}