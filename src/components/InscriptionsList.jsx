function InscriptionsList({ inscriptions }) {
  console.log('Rendering InscriptionsList, inscriptions:', inscriptions);

  if (!Array.isArray(inscriptions)) {
    return <p className="text-gray-600">No inscriptions found or invalid data.</p>;
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Inscriptions</h2>
      {inscriptions.length === 0 ? (
        <p className="text-gray-600">No inscriptions found.</p>
      ) : (
        <div className="grid gap-4">
          {inscriptions.map((inscription) => (
            <div key={inscription.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p><strong>ID:</strong> {inscription.id}</p>
                <p><strong>Status:</strong> {inscription.status}</p>
                <p><strong>Payment Address:</strong> <span className="truncate">{inscription.payment_address}</span></p>
                <p><strong>Recipient Address:</strong> <span className="truncate">{inscription.recipient_address}</span></p>
                <p><strong>File Size:</strong> {inscription.file_size_in_bytes} bytes</p>
                <p><strong>Created At:</strong> {new Date(inscription.created_at).toLocaleString()}</p>
                {inscription.commit_tx_id && (
                  <p><strong>Commit TX ID:</strong> <span className="truncate">{inscription.commit_tx_id}</span></p>
                )}
                {inscription.reveal_tx_hex && (
                  <p><strong>Reveal TX Hex:</strong> <span className="truncate">{inscription.reveal_tx_hex.slice(0, 20)}...</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InscriptionsList;