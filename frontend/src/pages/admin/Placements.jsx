import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Input, InputGroup, InputLeftElement,
  Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Avatar,
  IconButton, useDisclosure, useToast, Spinner, Center,
  Alert, AlertIcon, Text, Flex,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import PlacementModal from '../../components/modals/PlacementModal'
import { placementService } from '../../api/services'

const STATUS_COLOR = {
  active:    'green',
  pending:   'orange',
  completed: 'purple',
  rejected:  'red',
}

export default function Placements() {
  const [placements,    setPlacements]   = useState([])
  const [loading,       setLoading]      = useState(true)
  const [error,         setError]        = useState('')
  const [search,        setSearch]       = useState('')
  const [filterStatus,  setFilter]       = useState('')
  const [selected,      setSelected]     = useState(null)
  const { isOpen, onOpen, onClose }      = useDisclosure()
  const toast = useToast()

  const fetchPlacements = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await placementService.getAll()
      // ✅ backend returns array with student_name, company_name etc.
      setPlacements(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Could not load placements.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlacements() }, [fetchPlacements])

  // ✅ Filter client-side using backend field names
  const filtered = placements.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      p.student_name?.toLowerCase().includes(q)  ||
      p.student_email?.toLowerCase().includes(q) ||
      p.company_name?.toLowerCase().includes(q)  ||
      p.position?.toLowerCase().includes(q)
    const matchStatus = !filterStatus || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleAdd  = () => { setSelected(null); onOpen() }
  const handleEdit = (p) => { setSelected(p);   onOpen() }
  
  const handleDelete = async (id) => {

	const confirmed = window.confirm(
		'Delete this placement?'
	)

	if (!confirmed) return

	try {

		await placementService.delete(id)

		toast({
			title: 'Placement deleted',
			status: 'success',
			duration: 2500,
			isClosable: true,
		})

		fetchPlacements()

	} catch {

		toast({
			title: 'Delete failed',
			status: 'error',
			duration: 2500,
			isClosable: true,
		})

	}
}

  const handleStatusChange = async (id, newStatus) => {
    try {
      await placementService.updateStatus(id, newStatus)
      toast({ title: `Status updated to ${newStatus}`, status: 'info', duration: 2000, isClosable: true })
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
      onClose()
      fetchPlacements()
    } catch (err) {
      // re-throw so PlacementModal can show the error inline
      throw err
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

      {/* Filters */}
      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="300px" size="sm">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search student or workplace…"
            value={search} onChange={e => setSearch(e.target.value)}
            bg="white" borderRadius="lg"
          />
        </InputGroup>
        <Select maxW="160px" size="sm" value={filterStatus}
          onChange={e => setFilter(e.target.value)} bg="white" borderRadius="lg">
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </Select>
      </HStack>

      {error && (
        <Alert status="error" borderRadius="lg" mb={4} fontSize="sm">
          <AlertIcon />{error}
        </Alert>
      )}

      {/* Table */}
      <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100"
        boxShadow="sm" overflow="hidden">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Student</Th>
              <Th>Workplace</Th>
              <Th>Position</Th>
              <Th>Supervisors</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={8} py={10}>
                  <Center><Spinner color="brand.500" /></Center>
                </Td>
              </Tr>
            ) : filtered.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={10} color="gray.400">
                  {search || filterStatus ? 'No placements match your filters.' : 'No placements yet.'}
                </Td>
              </Tr>
            ) : filtered.map(p => (
              <Tr key={p.id} _hover={{ bg: 'gray.50' }}>
                {/* ✅ Use backend field names: student_name, student_email */}
                <Td>
                  <Flex align="center" gap={2}>
                    <Avatar size="xs"
                      name={p.student_name}
                      bg="brand.600" color="white" />
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">
                        {p.student_name || '—'}
                      </Text>
                      <Text fontSize="10px" color="gray.400">
                        {p.student_email || ''}
                      </Text>
                    </Box>
                  </Flex>
                </Td>
                <Td>
                  <Text fontSize="sm">{p.company_name || '—'}</Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">{p.position || '—'}</Text>
                </Td>
                <Td>
                  <Box>
                    {p.academic_supervisor?.name && (
                      <Text fontSize="xs" color="gray.600">
                        📚 {p.academic_supervisor.name}
                      </Text>
                    )}
                    {p.workplace_supervisor?.name && (
                      <Text fontSize="xs" color="gray.500">
                        🏢 {p.workplace_supervisor.name}
                      </Text>
                    )}
                    {!p.academic_supervisor?.name && !p.workplace_supervisor?.name && (
                      <Text fontSize="xs" color="gray.300">Not assigned</Text>
                    )}
                  </Box>
                </Td>
                <Td>
                  <Text fontSize="xs" color="gray.500">{p.start_date || '—'}</Text>
                </Td>
                <Td>
                  <Text fontSize="xs" color="gray.500">{p.end_date || '—'}</Text>
                </Td>
                <Td>
                  <Select size="xs" value={p.status} w="120px" borderRadius="md"
                    onChange={e => handleStatusChange(p.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </Td>
                <Td>
					<HStack spacing={1}>

						<IconButton
							icon={<EditIcon />}
							size="xs"
							variant="ghost"
							colorScheme="blue"
							aria-label="Edit"
							onClick={() => handleEdit(p)}
						/>

						<IconButton
							icon={<DeleteIcon />}
							size="xs"
							variant="ghost"
							colorScheme="red"
							aria-label="Delete"
							onClick={() => handleDelete(p.id)}
						/>

					</HStack>
				</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <PlacementModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
        placement={selected}
      />
    </Box>
  )
}