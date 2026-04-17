const UserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null

  return (
    <div>
      <div>
        <h2>{user ? 'Edit User' : 'Add User'}</h2>
        <form>
          <input
            type="text"
            placeholder="Full Name"
          />
          <input
            type="email"
            placeholder="Email"
          />
          <select>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="student">Student</option>
          </select>
          <input
            type="password"
            placeholder="Password"
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

export default UserModal