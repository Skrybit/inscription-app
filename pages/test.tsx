import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export default function TestPage() {
  return (
    <div className="p-6">
      <h1>Test Shadcn</h1>
      <Button>Test Button</Button>
      <Input placeholder="Test Input" />
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Alert variant="destructive">
        <AlertDescription>Test Alert</AlertDescription>
      </Alert>
      <Spinner />
    </div>
  );
}