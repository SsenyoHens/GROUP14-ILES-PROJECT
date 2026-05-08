export default function MyProfile() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        My Profile
      </h1>

      <div className="bg-white shadow rounded-xl p-6 max-w-2xl">
        <div className="mb-4">
          <label className="font-semibold">Name</label>
          <p className="text-gray-600">John Doe</p>
        </div>

        <div className="mb-4">
          <label className="font-semibold">Email</label>
          <p className="text-gray-600">john@example.com</p>
        </div>

        <div className="mb-4">
          <label className="font-semibold">Course</label>
          <p className="text-gray-600">Computer Science</p>
        </div>

        <div className="mb-4">
          <label className="font-semibold">Registration Number</label>
          <p className="text-gray-600">2024/BSCS/001</p>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Edit Profile
        </button>
      </div>
    </div>
  )
}