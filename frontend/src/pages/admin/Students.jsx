import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Input, InputGroup, InputLeftElement,
  Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Avatar,
  IconButton, useDisclosure, useToast, Spinner, Center,
  Text, Flex, Alert, AlertIcon, AlertDescription,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import StudentModal from '../../components/modals/StudentModal'
import api from '../../api/axiosInstance'

export default function Students() {
  const [students,     setStudents]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected,     setSelected]     = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchStudents = useCallback(async () => {
    setLoading(true); setError('')
    try {
      // ✅ Use correct endpoint — backend returns
      // [{ id, first_name, last_name, email, phone, department,
      //    profile: { registration_number, course, year_of_study } }]
      const res = await api.get('/students/')
      setStudents(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Could not load students.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  // ✅ Client-side filter using backend field names
  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q)  ||
      s.email?.toLowerCase().includes(q)       ||
      s.profile?.registration_number?.toLowerCase().includes(q)
    return matchSearch
  })

  const handleAdd  = () => { setSelected(null); onOpen() }
  const handleEdit = (s) => { setSelected(s);   onOpen() }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student?')) return
    try {
      await api.delete(`/users/${id}/`)
      toast({ title: 'Student removed', status: 'warning', duration: 2500, isClosable: true })
      fetchStudents()
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleSave = async (data) => {
    try {
      if (selected) {
        // ✅ Update user base fields
        await api.put(`/users/${selected.id}/`, {
          first_name: data.first_name,
          last_name:  data.last_name,
          email:      data.email,
          phone:      data.phone,
          department: data.department,
        })
        // ✅ Update student profile fields
        if (selected.profile) {
          await api.patch(`/profile/student/${selected.id}/`, {
            registration_number: data.registration_number,
            course:              data.course,
            year_of_study:       parseInt(data.year_of_study) || null,
          })
        }
        toast({ title: 'Student updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        // ✅ Register new student via auth/register
        await api.post('/auth/register/', {
          first_name:          data.first_name,
          last_name:           data.last_name,
          email:               data.email,
          password:            data.password,
          phone:               data.phone,
          department:          data.department,
          role:                'student',
          registration_number: data.registration_number,
          course:              data.course,
          year_of_study:       parseInt(data.year_of_study) || null,
        })
        toast({ title: 'Student registered', status: 'success', duration: 2500, isClosable: true })
      }
      onClose()
      fetchStudents()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Save failed'
      toast({ title: msg, status: 'error', duration: 4000, isClosable: true })
    }
  }

  return (
    <Box>
      <PageHeader title="Student Registration" subtitle="Manage all registered interns">
        <Button leftIcon={<AddIcon />} onClick={handleAdd}
          bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} size="sm">
          Register Student
        </Button>
      </PageHeader>

      {/* Filters */}
      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="300px" size="sm">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Search name, reg no, email…"
            value={search} onChange={e => setSearch(e.target.value)}
            bg="white" borderRadius="lg" />
        </InputGroup>
        <Text fontSize="sm" color="gray.400" ml="auto">
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
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
              <Th>Student</Th>
              <Th>Reg No.</Th>
              <Th>Department</Th>
              <Th>Course</Th>
              <Th>Year</Th>
              <Th>Email</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading
              ? (
                <Tr><Td colSpan={7} py={10}>
                  <Center><Spinner color="brand.500" /></Center>
                </Td></Tr>
              )
              : filtered.length === 0
                ? (
                  <Tr><Td colSpan={7} textAlign="center" py={10} color="gray.400">
                    {search ? 'No students match your search.' : 'No students registered yet.'}
                  </Td></Tr>
                )
                : filtered.map(s => {
                    // ✅ Use backend field names
                    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email
                    const regNo    = s.profile?.registration_number || '—'
                    const course   = s.profile?.course              || '—'
                    const year     = s.profile?.year_of_study       ?? '—'

                    return (
                      <Tr key={s.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Flex align="center" gap={2}>
                            <Avatar size="xs" name={fullName}
                              bg="brand.600" color="white" />
                            <Text fontSize="sm" fontWeight="500">{fullName}</Text>
                          </Flex>
                        </Td>
                        <Td fontSize="xs" color="gray.500" fontFamily="mono">{regNo}</Td>
                        <Td fontSize="sm">{s.department || '—'}</Td>
                        <Td fontSize="sm">{course}</Td>
                        <Td fontSize="sm" textAlign="center">
                          {year !== '—' ? `Year ${year}` : '—'}
                        </Td>
                        <Td fontSize="xs" color="gray.500">{s.email}</Td>
                        <Td>
                          <HStack spacing={1}>
                            <IconButton icon={<EditIcon />} size="xs" variant="ghost"
                              colorScheme="blue" aria-label="Edit"
                              onClick={() => handleEdit(s)} />
                            <IconButton icon={<DeleteIcon />} size="xs" variant="ghost"
                              colorScheme="red" aria-label="Delete"
                              onClick={() => handleDelete(s.id)} />
                          </HStack>
                        </Td>
                      </Tr>
                    )
                  })
            }
          </Tbody>
        </Table>
      </Box>

      <StudentModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
        student={selected}
      />
    </Box>
  )
}