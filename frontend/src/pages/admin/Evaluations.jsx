import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Select, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Avatar, IconButton, useDisclosure, useToast, Spinner,
  Center, Alert, AlertIcon, AlertDescription, Input, InputGroup,
  InputLeftElement, Text, Flex,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon, CheckIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import EvaluationModal from '../../components/modals/EvaluationModal'
import { evaluationService } from '../../api/services'

const GRADE_COLOR = {
  A: 'green',
  B: 'teal',
  C: 'blue',
  D: 'orange',
  F: 'red',
}

const STATUS_COLOR = {
  draft:     'gray',
  submitted: 'teal',
  approved:  'green',
}

export default function AcademicEvaluations() {
  const [evals,        setEvals]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected,     setSelected]     = useState(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchEvals = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await evaluationService.getAll()
      // ✅ Backend returns array with student_email, total_score, grade, status
      setEvals(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Could not load evaluations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvals() }, [fetchEvals])

  // ✅ Client-side filter using correct backend field names
  const filtered = evals.filter(ev => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      ev.student_email?.toLowerCase().includes(q)  ||
      ev.evaluator_email?.toLowerCase().includes(q)
    const matchStatus = !filterStatus || ev.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleAdd  = () => { setSelected(null); onOpen() }
  const handleEdit = (ev) => { setSelected(ev);  onOpen() }

  const handleSubmit = async (id) => {
    try {
      await evaluationService.submit(id)
      toast({
        title: 'Evaluation submitted',
        status: 'success', duration: 2500, isClosable: true,
      })
      fetchEvals()
    } catch {
      toast({ title: 'Submit failed', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleSave = async (data) => {
    try {
      if (selected) {
        await evaluationService.update(selected.id, data)
        toast({
          title: 'Evaluation updated',
          status: 'success', duration: 2500, isClosable: true,
        })
      } else {
        await evaluationService.create(data)
        toast({
          title: 'Evaluation created',
          status: 'success', duration: 2500, isClosable: true,
        })
      }
      onClose()
      fetchEvals()
    } catch (err) {
      // Re-throw so EvaluationModal shows inline error
      throw err
    }
  }

  return (
    <Box>
      <PageHeader
        title="Evaluations & Grading"
        subtitle="Review and grade student internship performance">
        <Button leftIcon={<AddIcon />} onClick={handleAdd}
          bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} size="sm">
          New Evaluation
        </Button>
      </PageHeader>

      {/* Filters */}
      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="300px" size="sm">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search student or evaluator…"
            value={search} onChange={e => setSearch(e.target.value)}
            bg="white" borderRadius="lg"
          />
        </InputGroup>
        <Select maxW="160px" size="sm" value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          bg="white" borderRadius="lg">
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
        </Select>
        <Text fontSize="sm" color="gray.400" ml="auto">
          {filtered.length} evaluation{filtered.length !== 1 ? 's' : ''}
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
              <Th>#</Th>
              <Th>Student</Th>
              <Th>Evaluator</Th>
              <Th>Score</Th>
              <Th>Grade</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading
              ? (
                <Tr>
                  <Td colSpan={8} py={10}>
                    <Center><Spinner color="brand.500" /></Center>
                  </Td>
                </Tr>
              )
              : filtered.length === 0
                ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={10} color="gray.400">
                      {search || filterStatus
                        ? 'No evaluations match your filters.'
                        : 'No evaluations found.'}
                    </Td>
                  </Tr>
                )
                : filtered.map(ev => {
                    const gc = GRADE_COLOR[ev.grade]   || 'gray'
                    const sc = STATUS_COLOR[ev.status] || 'gray'

                    return (
                      <Tr key={ev.id} _hover={{ bg: 'gray.50' }}>

                        {/* ID */}
                        <Td>
                          <Text fontSize="xs" color="gray.400" fontFamily="mono">
                            #{ev.id}
                          </Text>
                        </Td>

                        {/* ✅ student_email from backend */}
                        <Td>
                          <HStack spacing={2}>
                            <Avatar size="xs" name={ev.student_email}
                              bg="brand.600" color="white" />
                            <Text fontSize="sm" color="gray.700" fontWeight="500">
                              {ev.student_email || '—'}
                            </Text>
                          </HStack>
                        </Td>

                        {/* ✅ evaluator_email from backend */}
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {ev.evaluator_email || '—'}
                          </Text>
                        </Td>

                        {/* ✅ total_score from backend */}
                        <Td>
                          <Text fontSize="sm" fontWeight="700" color="gray.700">
                            {ev.total_score != null ? `${ev.total_score}/100` : '—'}
                          </Text>
                        </Td>

                        {/* ✅ grade from backend */}
                        <Td>
                          {ev.grade
                            ? (
                              <Badge colorScheme={gc} borderRadius="full"
                                px={2} fontSize="10px">
                                {ev.grade}
                              </Badge>
                            )
                            : <Text fontSize="xs" color="gray.300">—</Text>
                          }
                        </Td>

                        {/* ✅ status from backend */}
                        <Td>
                          <Badge colorScheme={sc} borderRadius="full"
                            px={2} fontSize="10px">
                            {ev.status}
                          </Badge>
                        </Td>

                        {/* Date */}
                        <Td>
                          <Text fontSize="xs" color="gray.400">
                            {ev.created_at
                              ? new Date(ev.created_at).toLocaleDateString()
                              : '—'}
                          </Text>
                        </Td>

                        {/* Actions */}
                        <Td>
                          <HStack spacing={1}>
                            <IconButton
                              icon={<EditIcon />} size="xs" variant="ghost"
                              colorScheme="blue" aria-label="Edit"
                              onClick={() => handleEdit(ev)}
                            />
                            {ev.status === 'draft' && (
                              <IconButton
                                icon={<CheckIcon />} size="xs" variant="ghost"
                                colorScheme="green" aria-label="Submit"
                                onClick={() => handleSubmit(ev.id)}
                              />
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    )
                  })
            }
          </Tbody>
        </Table>
      </Box>

      <EvaluationModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
        evaluation={selected}
      />
    </Box>
  )
}