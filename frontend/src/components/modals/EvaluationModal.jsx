const EvaluationModal = ({ isOpen, onClose, evaluation }) => {
  if (!isOpen) return null

  return (
    <div>
      <div>
        <h2>{evaluation ? 'Edit Evaluation' : 'Add Evaluation'}</h2>
        <form>
          <input
            type="text"
            placeholder="Student Name"
          />
          <input
            type="text"
            placeholder="Evaluator"
          />
          <textarea
            placeholder="Evaluation Notes"
            rows={4}
          />
          <select>
            <option value="">Select Grade</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
          <div>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EvaluationModal