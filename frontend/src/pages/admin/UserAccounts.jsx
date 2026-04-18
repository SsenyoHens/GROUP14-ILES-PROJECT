
import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import UserModal from '../../components/modals/UserModal'

const UserAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <PageHeader title="User Accounts" subtitle="Manage system users"/>
      <button onClick={() => setIsModalOpen(true)}>Add User</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={null}
      />
    </div>
  )
}

export default UserAccounts
