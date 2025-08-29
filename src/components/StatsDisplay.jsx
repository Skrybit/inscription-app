function StatsDisplay({ stats }) {
  console.log('Rendering StatsDisplay, stats:', stats);

  if (!stats) {
    return <p className="text-gray-600">No stats available.</p>;
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Inscription Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p><strong>Total Inscriptions:</strong> {stats.total_inscriptions}</p>
        <p><strong>Total Paid:</strong> {stats.total_paid}</p>
        <p><strong>Total Pending:</strong> {stats.total_pending}</p>
        <p><strong>Total Failed:</strong> {stats.total_failed}</p>
      </div>
    </div>
  );
}

export default StatsDisplay;