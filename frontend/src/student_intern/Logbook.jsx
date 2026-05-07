export default function Logbook() {
  const logs = [
    {
      date: 'Monday, 5 May 2026',
      activity: 'Designed and implemented the dashboard user interface.',
      status: 'Completed',
    },
    {
      date: 'Tuesday, 6 May 2026',
      activity: 'Integrated backend APIs for internship applications.',
      status: 'Completed',
    },
    {
      date: 'Wednesday, 7 May 2026',
      activity: 'Attended team meeting and discussed project improvements.',
      status: 'Pending Review',
    },
    {
      date: 'Thursday, 8 May 2026',
      activity: 'Worked on responsive mobile layouts for student pages.',
      status: 'Completed',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Logbook</h1>
            <p className="text-gray-500 mt-2">
              Record and track your daily internship activities.
            </p>
          </div>

          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
            Add New Entry
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="