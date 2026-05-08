import { useEffect, useState } from "react";

export default function Logbook() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/logs/")
      .then((response) => response.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Logbook</h1>

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded-lg p-4 shadow bg-white"
            >
              <h2 className="text-xl font-semibold">
                Week {log.week_number}
              </h2>

              <p className="text-gray-700 mt-2">
                {log.activities}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Date: {log.date}
              </p>

              <p className="text-sm text-blue-600 mt-2">
                Status: {log.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}