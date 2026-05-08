export default function Dashboard() {
  const stats = [
    { title: 'Students', value: 120 },
    { title: 'Internships', value: 45 },
    { title: 'Applications', value: 89 },
    { title: 'Companies', value: 18 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Welcome to the Student Internship Management System.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <h2 className="text-gray-500 text-sm">{item.title}</h2>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Applications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-700">John Doe</p>
                  <p className="text-sm text-gray-500">Frontend Developer</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Approved
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-700">Sarah Kim</p>
                  <p className="text-sm text-gray-500">UI/UX Designer</p>
                </div>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                  Pending
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">David Mark</p>
                  <p className="text-sm text-gray-500">Backend Developer</p>
                </div>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  Rejected
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition">
                Add Student
              </button>

              <button className="bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition">
                Post Internship
              </button>

              <button className="bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition">
                View Reports
              </button>

              <button className="bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition">
                Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
