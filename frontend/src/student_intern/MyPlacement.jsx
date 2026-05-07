export default function MyPlacement() {
  const placement = {
    company: 'TechNova Solutions',
    position: 'Frontend Developer Intern',
    supervisor: 'Sarah Johnson',
    duration: 'May 2026 - August 2026',
    status: 'Ongoing',
    location: 'Kampala, Uganda',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            My Placement
          </h1>
          <p className="text-gray-500 mt-2">
            Track your internship placement details and progress.
          </p>
        </div>

        {/* Placement Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {placement.company}
              </h2>
              <p className="text-blue-600 text-lg mt-2"></p>