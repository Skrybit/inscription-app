function StatsDisplay({ stats }) {
  console.log('Rendering StatsDisplay, stats:', stats);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Inscription Statistics</h2>
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Inscriptions</p>
            <p className="text-lg font-semibold text-teal-700">{stats.total_inscriptions}</p>
          </div>
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-lg font-semibold text-teal-700">{stats.total_pending}</p>
          </div>
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-600">Broadcasted</p>
            <p className="text-lg font-semibold text-teal-700">{stats.total_broadcasted}</p>
          </div>
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-lg font-semibold text-teal-700">{stats.total_confirmed}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Loading stats...</p>
      )}
    </div>
  );
}

export default StatsDisplay;