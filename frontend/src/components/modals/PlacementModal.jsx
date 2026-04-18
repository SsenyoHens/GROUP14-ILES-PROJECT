const PlacementModal = ({ isOpen, onClose, placement }) => {
  if (!isOpen) return null

  return (
    <div>
      <div>
        <h2>{placement ? 'Edit Placement' : 'Add Placement'}</h2>
        <form>
          <input
            type="text"
            placeholder="Company Name"
          />
          <input
            type="text"
            placeholder="Position"
          />
          <input
            type="date"
            placeholder="Start Date"
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

export default PlacementModal