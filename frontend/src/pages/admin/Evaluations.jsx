
import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import EvaluationModal from '../../components/modals/EvaluationModal'

const Evaluations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <PageHeader title="Evaluations" subtitle="Manage student evaluations"/>
      <button onClick={() => setIsModalOpen(true)}>Add Evaluation</button>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Evaluator</th>
            <th>Grade</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        evaluation={null}
      />
    </div>
  )
}

export default Evaluations
