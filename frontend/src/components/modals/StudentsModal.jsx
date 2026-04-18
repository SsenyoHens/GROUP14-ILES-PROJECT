const StudentModal = ({ isOpen, onClose, student }) => {
  if (!isOpen) return null

  return (
    <div>
      <div>
        <h2>{student ? 'Edit Student' : 'Add Student'}</h2>
        <form>
          <input
            type="text"
            placeholder="Student Name"
          />
          <input
            type="email"
            placeholder="Email"
          />
          <input
            type="text"
            placeholder="Student ID"
          />
          <div>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentModal