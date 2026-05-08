import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Input, InputGroup, InputLeftElement,
  Select, Table, Thead, Tbody, Tr, Th, Td, Badge,
  IconButton, useDisclosure, useToast, Spinner, Center,
  Text, VStack, Alert, AlertIcon,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import StudentModal from '../../components/modals/StudentModal'
import { studentService } from '../../api/services'

const statusColor = { Placed: 'green', Pending: 'orange', Evaluating: 'blue', Completed: 'purple' }

function Students() {
  const [students,   setStudents]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [search,     setSearch]     = useState('')
  const [filterStatus, setFilter]   = useState('All')
  const [selected,   setSelected]   = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await studentService.getAll({ search, status: filterStatus !== 'All' ? filterStatus : undefined })
      setStudents(res.data)
    } catch {
      setError('Could not load students.')
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const handleAdd  = () => { setSelected(null); onOpen() }
  const handleEdit = (s) => { setSelected(s);   onOpen() }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student?')) return
    try {
      await studentService.delete(id)
      toast({ title: 'Student removed', status: 'warning', duration: 2500, isClosable: true })
      fetchStudents()
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleSave = async (data) => {
    try {
      if (selected) {
        await studentService.update(selected.id, data)
        toast({ title: 'Student updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        await studentService.create(data)
        toast({ title: 'Student registered', status: 'success', duration: 2500, isClosable: true })
      }
      onClose()
      fetchStudents()
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Save failed',
        status: 'error', duration: 3000, isClosable: true,
      })
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

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="300px" size="sm">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Search name, reg no, email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            bg="white" borderRadius="lg" />
        </InputGroup>
        <Select maxW="170px" size="sm" value={filterStatus}
          onChange={(e) => setFilter(e.target.value)} bg="white" borderRadius="lg">
          <option>All</option>
          <option>Pending</option>
          <option>Placed</option>
          <option>Evaluating</option>
          <option>Completed</option>
        </Select>
      </HStack>

      {error && <Alert status="error" borderRadius="lg" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}

      <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100"
        boxShadow="sm" overflow="hidden">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Reg No.</Th>
              <Th>Full Name</Th>
              <Th>Department</Th>
              <Th>Course</Th>
              <Th>Year</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={8} py={10}>
                <Center><Spinner color="brand.500" /></Center>
              </Td></Tr>
            ) : students.length === 0 ? (
              <Tr><Td colSpan={8} textAlign="center" py={10} color="gray.400">
                No students found
              </Td></Tr>
            ) : students.map((s) => (
              <Tr key={s.id} _hover={{ bg: 'gray.50' }}>
                <Td fontSize="xs" color="gray.500" fontFamily="mono">{s.regNumber}</Td>
                <Td fontSize="sm" fontWeight="500">{s.fullName}</Td>
                <Td fontSize="sm">{s.department}</Td>
                <Td fontSize="sm">{s.course}</Td>
                <Td fontSize="sm" textAlign="center">{s.yearOfStudy}</Td>
                <Td fontSize="xs" color="gray.500">{s.email}</Td>
                <Td>
                  <Badge colorScheme={statusColor[s.status] || 'gray'}
                    borderRadius="full" px={2} fontSize="10px">
                    {s.status}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton icon={<EditIcon />} size="xs" variant="ghost"
                      colorScheme="blue" aria-label="Edit" onClick={() => handleEdit(s)} />
                    <IconButton icon={<DeleteIcon />} size="xs" variant="ghost"
                      colorScheme="red" aria-label="Delete" onClick={() => handleDelete(s.id)} />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <StudentModal isOpen={isOpen} onClose={onClose} onSave={handleSave} student={selected} />
    </Box>
  )
}

export default Students