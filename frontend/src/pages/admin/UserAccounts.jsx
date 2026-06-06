import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Input, InputGroup, InputLeftElement,
  Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Avatar,
  IconButton, useDisclosure, useToast, Spinner, Center,
  Text, Flex, Alert, AlertIcon, AlertDescription,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon, DeleteIcon, LockIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import UserModal from '../../components/modals/UserModal'
import api from '../../api/axiosInstance'

const ROLE_COLOR = {
  admin:                'red',
  academic_supervisor:  'purple',
  workplace_supervisor: 'blue',
  student:              'green',
}

const ROLE_LABEL = {
  admin:                'Internship Admin',
  academic_supervisor:  'Academic Supervisor',
  workplace_supervisor: 'Workplace Supervisor',
  student:              'Student',
}

export default function UserAccounts() {
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [filterRole,   setFilterRole]   = useState('')
  const [selected,     setSelected]     = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      // ✅ Use /users/ endpoint — returns backend field names
      const res = await api.get('/users/')
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Could not load user accounts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ✅ Client-side filter using backend field names
  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q)  ||
      u.email?.toLowerCase().includes(q)
    const matchRole = !filterRole || u.role === filterRole
    return matchSearch && matchRole
  })

  const handleAdd    = () => { setSelected(null); onOpen() }
  const handleEdit   = (u) => { setSelected(u);   onOpen() }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account?')) return
    try {
      await api.delete(`/users/${id}/`)
      toast({ title: 'User deleted', status: 'warning', duration: 2500, isClosable: true })
      fetchUsers()
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleResetPw = async (id) => {
    const newPw = window.prompt('Enter new password (min 8 characters):')
    if (!newPw || newPw.length < 8) {
      toast({ title: 'Password must be at least 8 characters', status: 'warning', duration: 3000, isClosable: true })
      return
    }
    try {
      await api.post(`/users/${id}/reset-password/`, { new_password: newPw })
      toast({ title: 'Password reset successfully', status: 'success', duration: 3000, isClosable: true })
    } catch {
      toast({ title: 'Reset failed', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleSave = async (data) => {
    try {
      if (selected) {
        // ✅ Update existing user
        await api.put(`/users/${selected.id}/`, {
          first_name: data.first_name,
          last_name:  data.last_name,
          email:      data.email,
          role:       data.role,
          department: data.department,
        })
        toast({ title: 'User updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        // ✅ Create new user via register
        await api.post('/auth/register/', {
          first_name: data.first_name,
          last_name:  data.last_name,
          email:      data.email,
          password:   data.password,
          role:       data.role,
          department: data.department,
        })
        toast({ title: 'User created', status: 'success', duration: 2500, isClosable: true })
      }
      onClose()
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Save failed'
      toast({ title: msg, status: 'error', duration: 4000, isClosable: true })
    }
  }

  return (
    <Box>
      <PageHeader title="User Accounts" subtitle="Manage all system user accounts">
        <Button leftIcon={<AddIcon />} onClick={handleAdd}
          bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} size="sm">
          Add User
        </Button>
      </PageHeader>

      {/* Filters */}
      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="300px" size="sm">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            bg="white" borderRadius="lg" />
        </InputGroup>
        <Select maxW="200px" size="sm" value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          bg="white" borderRadius="lg">
          <option value="">All roles</option>
          <option value="admin">Internship Admin</option>
          <option value="academic_supervisor">Academic Supervisor</option>
          <option value="workplace_supervisor">Workplace Supervisor</option>
          <option value="student">Student</option>
        </Select>
        <Text fontSize="sm" color="gray.400" ml="auto">
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </Text>
      </HStack>

      {error && (
        <Alert status="error" borderRadius="lg" mb={4} fontSize="sm">
          <AlertIcon /><AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100"
        boxShadow="sm" overflow="hidden">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Department</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading
              ? (
                <Tr><Td colSpan={5} py={10}>
                  <Center><Spinner color="brand.500" /></Center>
                </Td></Tr>
              )
              : filtered.length === 0
                ? (
                  <Tr><Td colSpan={5} textAlign="center" py={10} color="gray.400">
                    {search || filterRole ? 'No users match your filters.' : 'No users found.'}
                  </Td></Tr>
                )
                : filtered.map(u => {
                    // ✅ Use backend field names
                    const fullName  = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email
                    const roleColor = ROLE_COLOR[u.role] || 'gray'
                    const roleLabel = ROLE_LABEL[u.role] || u.role

                    return (
                      <Tr key={u.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Flex align="center" gap={2}>
                            <Avatar size="xs" name={fullName}
                              bg="brand.600" color="white" />
                            <Text fontSize="sm" fontWeight="500">{fullName}</Text>
                          </Flex>
                        </Td>
                        <Td fontSize="sm" color="gray.500">{u.email}</Td>
                        <Td>
                          <Badge colorScheme={roleColor} borderRadius="full"
                            px={2} fontSize="10px">
                            {roleLabel}
                          </Badge>
                        </Td>
                        <Td fontSize="sm">{u.department || '—'}</Td>
                        <Td>
                          <HStack spacing={1}>
                            <IconButton icon={<EditIcon />} size="xs" variant="ghost"
                              colorScheme="blue" aria-label="Edit"
                              onClick={() => handleEdit(u)} />
                            <IconButton icon={<LockIcon />} size="xs" variant="ghost"
                              colorScheme="orange" aria-label="Reset password"
                              onClick={() => handleResetPw(u.id)} />
                            <IconButton icon={<DeleteIcon />} size="xs" variant="ghost"
                              colorScheme="red" aria-label="Delete"
                              onClick={() => handleDelete(u.id)} />
                          </HStack>
                        </Td>
                      </Tr>
                    )
                  })
            }
          </Tbody>
        </Table>
      </Box>

      <UserModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
        user={selected}
      />
    </Box>
  )
}