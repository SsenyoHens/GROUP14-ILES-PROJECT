import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import StudentModal from '../../components/modals/StudentModal'

const Students = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <PageHeader title="Students" subtitle="Manage all students"/>
      <button onClick={() => setIsModalOpen(true)}>Add Student</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Student ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={null}
      />
    </div>
  )
}

export default Students