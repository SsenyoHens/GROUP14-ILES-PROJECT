import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Input, InputGroup, InputLeftElement,
  Select, Table, Thead, Tbody, Tr, Th, Td, Badge,
  IconButton, useDisclosure, useToast, Spinner, Center,
  Alert, AlertIcon,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon, DeleteIcon, LockIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import UserModal from '../../components/modals/UserModal'
import { userService } from '../../api/services'

const roleColor = { admin: 'red', registrar: 'purple', viewer: 'blue' }

function UserAccounts() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('All')
  const [selected, setSelected] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await userService.getAll({ search, role: filter !== 'All' ? filter : undefined })
      setUsers(res.data)
    } catch { setError('Could not load user accounts.') }
    finally { setLoading(false) }
  }, [search, filter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleAdd    = () => { setSelected(null); onOpen() }
  const handleEdit   = (u) => { setSelected(u);  onOpen() }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account?')) return
    try {
      await userService.delete(id)
      toast({ title: 'User deleted', status: 'warning', duration: 2500, isClosable: true })
      fetchUsers()
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleResetPw = async (id) => {
    try {
      await userService.resetPw(id)
      toast({ title: 'Password reset email sent', status: 'info', duration: 3000, isClosable: true })
    } catch {
      toast({ title: 'Reset failed', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleSave = async (data) => {
    try {
      if (selected) {
        await userService.update(selected.id, data)
        toast({ title: 'User updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        await userService.create(data)
        toast({ title: 'User created', status: 'success', duration: 2500, isClosable: true })
      }
      onClose(); fetchUsers()
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Save failed', status: 'error', duration: 3000, isClosable: true })
    }
  }

  return (
    <Box>
      <PageHeader title="User Accounts" subtitle="Manage admin and registrar access">
        <Button leftIcon={<AddIcon />} onClick={handleAdd}
          bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} size="sm">
          Add User
        </Button>
      </PageHeader>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="300px" size="sm">
          <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
          <Input placeholder="Search name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            bg="white" borderRadius="lg" />
        </InputGroup>
        <Select maxW="160px" size="sm" value={filter}
          onChange={(e) => setFilter(e.target.value)} bg="white" borderRadius="lg">
          <option>All</option>
          <option value="admin">Admin</option>
          <option value="registrar">Registrar</option>
          <option value="viewer">Viewer</option>
        </Select>
      </HStack>

      {error && <Alert status="error" borderRadius="lg" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}

      <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm" overflow="hidden">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Full Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Department</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={6} py={10}><Center><Spinner color="brand.500" /></Center></Td></Tr>
            ) : users.length === 0 ? (
              <Tr><Td colSpan={6} textAlign="center" py={10} color="gray.400">No users found</Td></Tr>
            ) : users.map((u) => (
              <Tr key={u.id} _hover={{ bg: 'gray.50' }}>
                <Td fontSize="sm" fontWeight="500">{u.fullName}</Td>
                <Td fontSize="sm" color="gray.500">{u.email}</Td>
                <Td>
                  <Badge colorScheme={roleColor[u.role] || 'gray'}
                    borderRadius="full" px={2} fontSize="10px" textTransform="capitalize">
                    {u.role}
                  </Badge>
                </Td>
                <Td fontSize="sm">{u.department}</Td>
                <Td>
                  <Badge colorScheme={u.isActive ? 'green' : 'gray'}
                    borderRadius="full" px={2} fontSize="10px">
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton icon={<EditIcon />} size="xs" variant="ghost"
                      colorScheme="blue" aria-label="Edit" onClick={() => handleEdit(u)} />
                    <IconButton icon={<LockIcon />} size="xs" variant="ghost"
                      colorScheme="orange" aria-label="Reset password" onClick={() => handleResetPw(u.id)} />
                    <IconButton icon={<DeleteIcon />} size="xs" variant="ghost"
                      colorScheme="red" aria-label="Delete" onClick={() => handleDelete(u.id)} />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <UserModal isOpen={isOpen} onClose={onClose} onSave={handleSave} user={selected} />
    </Box>
  )
}

export default UserAccounts