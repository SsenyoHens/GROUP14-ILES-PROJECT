export default function MyEvaluation() {
  const evaluations = [
    {
      title: "Midterm Evaluation",
      score: 78,
      remarks: "Good progress and teamwork.",
    },
    {
      title: "Final Evaluation",
      score: 88,
      remarks: "Excellent improvement and consistency.",
    },
  ];

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">
        My Evaluations
      </h1>

      <div className="space-y-6">
        {evaluations.map((evaluation, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-6"
          >
            <h2 className="text-xl font-bold">
              {evaluation.title}
            </h2>

            <div className="mt-4">
              <p className="text-gray-700">
                <span className="font-semibold">
                  Score:
                </span>{" "}
                {evaluation.score}%
              </p>

              <p className="text-gray-700 mt-2">
                <span className="font-semibold">
                  Remarks:
                </span>{" "}
                {evaluation.remarks}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}