export default function MyEvaluation() {
  const evaluations = [
    {
      title: 'Communication Skills',
      score: 85,
      remark: 'Excellent communication and teamwork.',
    },
    {
      title: 'Technical Skills',
      score: 90,
      remark: 'Strong frontend development skills.',
    },
    {
      title: 'Professionalism',
      score: 80,
      remark: 'Maintains professionalism in all tasks.',
    },
    {
      title: 'Problem Solving',
      score: 88,
      remark: 'Shows initiative in solving challenges.',
    },
  ];

  const averageScore = (
    evaluations.reduce((acc, item) => acc + item.score, 0) /
    evaluations.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            My Evaluation
          </h1>
          <p className="text-gray-500 mt-2">
            Review your internship performance evaluations and feedback.
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Overall Performance
              </h2>
              <p className="text-gray-500 mt-2"></p>