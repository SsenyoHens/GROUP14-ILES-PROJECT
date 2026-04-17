import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import PlacementModal from '../../components/modals/PlacementModal'

const Placements = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Placements"
        subtitle="Manage student placements"
      />
      <button onClick={() => setIsModalOpen(true)}>
        Add Placement
      </button>

      {/* Table will go here */}
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Position</th>
            <th>Start Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Placement rows will go here */}
        </tbody>
      </table>

      <PlacementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        placement={null}
      />
    </div>
  )
}

export default Placements