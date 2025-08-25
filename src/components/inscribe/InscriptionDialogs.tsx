import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/src/components/ui/alert-dialog';

interface InscriptionDialogsProps {
  paymentStatus: any;
  inscriptionDetails: any;
  showPaymentStatusDialog: boolean;
  setShowPaymentStatusDialog: (show: boolean) => void;
  showInscriptionDetailsDialog: boolean;
  setShowInscriptionDetailsDialog: (show: boolean) => void;
}

// Component for managing payment status and inscription details dialogs
export function InscriptionDialogs({
  paymentStatus,
  inscriptionDetails,
  showPaymentStatusDialog,
  setShowPaymentStatusDialog,
  showInscriptionDetailsDialog,
  setShowInscriptionDetailsDialog,
}: InscriptionDialogsProps) {
  return (
    <>
      {paymentStatus && (
        <AlertDialog
          open={showPaymentStatusDialog}
          onOpenChange={setShowPaymentStatusDialog}
        >
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800">Payment Status</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription className="text-sm text-gray-800">
              <span><strong>Paid:</strong> {paymentStatus.is_paid ? 'Yes' : 'No'}</span><br />
              {paymentStatus.payment_utxo ? (
                <>
                  <span><strong>Transaction ID:</strong> {paymentStatus.payment_utxo.txid}</span><br />
                  <span><strong>Confirmations:</strong> {paymentStatus.payment_utxo.confirmations}</span><br />
                  <span><strong>Amount:</strong> {paymentStatus.payment_utxo.amount} BTC</span>
                </>
              ) : (
                <span><strong>Error:</strong> {paymentStatus.error_details?.errMsg || 'No payment UTXO found'}</span>
              )}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction className="bg-teal-500 hover:bg-teal-600 text-white">
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {inscriptionDetails && (
        <AlertDialog
          open={showInscriptionDetailsDialog}
          onOpenChange={setShowInscriptionDetailsDialog}
        >
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800">Inscription Details</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription className="text-sm text-gray-800">
              <span><strong>ID:</strong> {inscriptionDetails.id}</span><br />
              <span><strong>Payment Address:</strong> {inscriptionDetails.payment_address}</span><br />
              <span><strong>Amount (sats):</strong> {inscriptionDetails.required_amount_in_sats}</span><br />
              <span><strong>File Size:</strong> {inscriptionDetails.file_size_in_bytes} bytes</span><br />
              <span><strong>Status:</strong> {inscriptionDetails.status}</span><br />
              <span><strong>Commit TX ID:</strong> {inscriptionDetails.commit_tx_id}</span><br />
              <span><strong>Reveal TX ID:</strong> {inscriptionDetails.reveal_tx_id}</span><br />
              <span><strong>Sender Address:</strong> {inscriptionDetails.sender_address}</span><br />
              <span><strong>Recipient Address:</strong> {inscriptionDetails.recipient_address}</span><br />
              <span><strong>Created At:</strong> {new Date(inscriptionDetails.created_at).toLocaleString()}</span>
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction className="bg-teal-500 hover:bg-teal-600 text-white">
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}