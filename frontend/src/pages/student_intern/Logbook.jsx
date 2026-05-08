import { useState } from "react";

export default function Logbook() {
  const [logs, setLogs] = useState([
    {
      week: "Week 1",
      activity: "Worked on frontend dashboard",
      status: "Completed",
    },
    {
      week: "Week 2",
      activity: "Integrated login API",
      status: "Pending",
    },
  ]);

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">My Logbook</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Add Weekly Log
        </h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Week"
            className="w-full border p-3 rounded-lg"
          />

          <textarea
            placeholder="Describe activities..."
            className="w-full border p-3 rounded-lg h-32"
          ></textarea>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Submit Log
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Submitted Logs
        </h2>

        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className="border rounded-lg p-4"
            >
              <h3 className="font-bold">{log.week}</h3>

              <p className="text-gray-600 mt-2">
                {log.activity}
              </p>

              <span className="inline-block mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}