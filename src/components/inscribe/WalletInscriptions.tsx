import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';

interface WalletInscriptionsProps {
  inscriptions: any[];
}

// Component for displaying wallet inscriptions table
export function WalletInscriptions({ inscriptions }: WalletInscriptionsProps) {
  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-gray-800">Wallet Inscriptions</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-teal-50 hover:bg-teal-50">
                <TableHead className="text-gray-800 font-semibold">ID</TableHead>
                <TableHead className="text-gray-800 font-semibold">Recipient Address</TableHead>
                <TableHead className="text-gray-800 font-semibold">Payment Address</TableHead>
                <TableHead className="text-gray-800 font-semibold">Amount (sats)</TableHead>
                <TableHead className="text-gray-800 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inscriptions.map((inscription, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition duration-200">
                  <TableCell>{inscription.id}</TableCell>
                  <TableCell className="font-mono text-xs break-all">
                    {inscription.recipient_address}
                  </TableCell>
                  <TableCell className="font-mono text-xs break-all">
                    {inscription.payment_address}
                  </TableCell>
                  <TableCell>{inscription.required_amount_in_sats}</TableCell>
                  <TableCell>
                    {inscription.commit_creation_successful ? 'Created' : 'Pending'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}