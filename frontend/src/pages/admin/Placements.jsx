import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Input, InputGroup, InputLeftElement,
  Select, Table, Thead, Tbody, Tr, Th, Td, Badge,
  IconButton, useDisclosure, useToast, Spinner, Center,
  Alert, AlertIcon,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import PlacementModal from '../../components/modals/PlacementModal'
import { placementService } from '../../api/services'

const statusColor = { Active: 'green', Pending: 'orange', Evaluating: 'blue', Completed: 'purple', Terminated: 'red' }

function Placements() {
  const [placements, setPlacements] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [search,     setSearch]     = useState('')
  const [filterStatus, setFilter]   = useState('All')
  const [selected,   setSelected]   = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchPlacements = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await placementService.getAll({
        search, status: filterStatus !== 'All' ? filterStatus : undefined,
      })
      setPlacements(res.data)
    } catch { setError('Could not load placements.') }
    finally { setLoading(false) }
  }, [search, filterStatus])

  useEffect(() => { fetchPlacements() }, [fetchPlacements])

  const handleAdd  = () => { setSelected(null); onOpen() }
  const handleEdit = (p) => { setSelected(p);   onOpen() }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await placementService.updateStatus(id, newStatus)
      toast({ title: `Status → ${newStatus}`, status: 'info', duration: 2000, isClosable: true })
      fetchPlacements()
    } catch {
      toast({ title: 'Update failed', status: 'error', duration: 2000, isClosable: true })
    }
  }

  const handleSave = async (data) => {
    try {
      if (selected) {
        await placementService.update(selected.id, data)
        toast({ title: 'Placement updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        await placementService.create(data)
        toast({ title: 'Placement created', status: 'success', duration: 2500, isClosable: true })
      }
      onClose(); fetchPlacements()
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Save failed', status: 'error', duration: 3000, isClosable: true })
    }
  }

  return (
    <Box>
      <PageHeader title="Placements" subtitle="Assign and track student internship placements">
        <Button leftIcon={<AddIcon />} onClick={handleAdd}
          bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} size="sm">
          New Placement
        </Button>
      </PageHeader>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="300px" size="sm">
          <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
          <Input placeholder="Search student or workplace..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            bg="white" borderRadius="lg" />
        </InputGroup>
        <Select maxW="170px" size="sm" value={filterStatus}
          onChange={(e) => setFilter(e.target.value)} bg="white" borderRadius="lg">
          <option>All</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Evaluating</option>
          <option>Completed</option>
          <option>Terminated</option>
        </Select>
      </HStack>

      {error && <Alert status="error" borderRadius="lg" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}

      <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm" overflow="hidden">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Student</Th>
              <Th>Reg No.</Th>
              <Th>Workplace</Th>
              <Th>Supervisor</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={8} py={10}><Center><Spinner color="brand.500" /></Center></Td></Tr>
            ) : placements.length === 0 ? (
              <Tr><Td colSpan={8} textAlign="center" py={10} color="gray.400">No placements found</Td></Tr>
            ) : placements.map((p) => (
              <Tr key={p.id} _hover={{ bg: 'gray.50' }}>
                <Td fontSize="sm" fontWeight="500">{p.studentName}</Td>
                <Td fontSize="xs" color="gray.500" fontFamily="mono">{p.regNumber}</Td>
                <Td fontSize="sm">{p.workplace}</Td>
                <Td fontSize="sm">{p.supervisorName}</Td>
                <Td fontSize="xs" color="gray.500">{p.startDate}</Td>
                <Td fontSize="xs" color="gray.500">{p.endDate}</Td>
                <Td>
                  <Select size="xs" value={p.status} w="120px" borderRadius="md"
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}>
                    {Object.keys(statusColor).map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Td>
                <Td>
                  <IconButton icon={<EditIcon />} size="xs" variant="ghost"
                    colorScheme="blue" aria-label="Edit" onClick={() => handleEdit(p)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <PlacementModal isOpen={isOpen} onClose={onClose} onSave={handleSave} placement={selected} />
    </Box>
  )
}

export default Placements