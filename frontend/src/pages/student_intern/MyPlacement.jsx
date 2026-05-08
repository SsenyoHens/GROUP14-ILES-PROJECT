export default function MyPlacement() {
  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">
        My Placement
      </h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <h2 className="font-semibold text-gray-700">
              Company Name
            </h2>

            <p className="text-gray-600 mt-2">
              TECH CO.S
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">
              Department
            </h2>

            <p className="text-gray-600 mt-2">
              IT Support
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">
              Supervisor
            </h2>

            <p className="text-gray-600 mt-2">
              Mr. John Supervisor
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">
              Supervisor Email
            </h2>

            <p className="text-gray-600 mt-2">
              supervisor@techcos.com
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">
              Start Date
            </h2>

            <p className="text-gray-600 mt-2">
              01 May 2026
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">
              End Date
            </h2>

            <p className="text-gray-600 mt-2">
              30 August 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}