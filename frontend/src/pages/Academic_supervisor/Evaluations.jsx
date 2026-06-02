import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Select, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Avatar, IconButton, useDisclosure, useToast, Spinner,
  Center, Alert, AlertIcon, AlertDescription, Input, InputGroup,
  InputLeftElement, Text, Flex, VStack,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon, CheckIcon, ViewIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import EvaluationModal from '../../components/modals/EvaluationModal'
import { evaluationService } from '../../api/services'

const GRADE_COLOR = {
  A: 'green', B: 'teal', C: 'blue', D: 'orange', F: 'red',
}

const STATUS_COLOR = {
  draft:     'gray',
  submitted: 'teal',
  approved:  'green',
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function EvaluationDetailModal({ isOpen, onClose, evaluation }) {
  if (!evaluation) return null
  const gc = GRADE_COLOR[evaluation.grade]   || 'gray'
  const sc = STATUS_COLOR[evaluation.status] || 'gray'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" mx={4}>
        <ModalHeader fontSize="md" fontWeight="700" pb={1}>
          Evaluation #{evaluation.id}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3} align="stretch">
            {[
              { label: 'Student',   value: evaluation.student_email   },
              { label: 'Evaluator', value: evaluation.evaluator_email },
              { label: 'Score',     value: evaluation.total_score != null
                  ? `${evaluation.total_score}/100` : '—' },
              { label: 'Date',      value: evaluation.created_at
                  ? new Date(evaluation.created_at).toLocaleDateString() : '—' },
            ].map(row => (
              <Flex key={row.label} justify="space-between" align="center"
                py={2} borderBottom="1px solid" borderColor="gray.50">
                <Text fontSize="xs" color="gray.400">{row.label}</Text>
                <Text fontSize="sm" fontWeight="600" color="gray.700">{row.value || '—'}</Text>
              </Flex>
            ))}

            <Flex justify="space-between" align="center"
              py={2} borderBottom="1px solid" borderColor="gray.50">
              <Text fontSize="xs" color="gray.400">Grade</Text>
              {evaluation.grade
                ? <Badge colorScheme={gc} borderRadius="full" px={3} fontSize="sm">
                    {evaluation.grade}
                  </Badge>
                : <Text fontSize="sm" color="gray.300">—</Text>
              }
            </Flex>

            <Flex justify="space-between" align="center"
              py={2} borderBottom="1px solid" borderColor="gray.50">
              <Text fontSize="xs" color="gray.400">Status</Text>
              <Badge colorScheme={sc} borderRadius="full" px={3} fontSize="xs">
                {evaluation.status}
              </Badge>
            </Flex>

            {evaluation.feedback && (
              <Box>
                <Text fontSize="xs" color="gray.400" mb={1}>Feedback</Text>
                <Box bg="gray.50" borderRadius="lg" p={3}>
                  <Text fontSize="sm" color="gray.700" lineHeight="1.7">
                    {evaluation.feedback}
                  </Text>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="ghost" onClick={onClose} borderRadius="lg">Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AcademicEvaluations() {
  const [evals,        setEvals]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected,     setSelected]     = useState(null)
  const [viewing,      setViewing]      = useState(null)

  const createD = useDisclosure()
  const viewD   = useDisclosure()
  const toast   = useToast()

  const fetchEvals = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await evaluationService.getAll()
      // ✅ Backend returns ALL evaluations for students under this supervisor
      // including those submitted by workplace supervisors
      setEvals(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Could not load evaluations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvals() }, [fetchEvals])

  // ✅ Client-side filter
  const filtered = evals.filter(ev => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      ev.student_email?.toLowerCase().includes(q)  ||
      ev.evaluator_email?.toLowerCase().includes(q)
    const matchStatus = !filterStatus || ev.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleAdd    = () => { setSelected(null); createD.onOpen() }
  const handleEdit   = (ev) => { setSelected(ev);  createD.onOpen() }
  const handleView   = (ev) => { setViewing(ev);   viewD.onOpen()   }

  const handleSubmit = async (id) => {
    try {
      await evaluationService.submit(id)
      toast({ title: 'Evaluation submitted', status: 'success', duration: 2500, isClosable: true })
      fetchEvals()
    } catch {
      toast({ title: 'Submit failed', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleSave = async (data) => {
    try {
      if (selected) {
        await evaluationService.update(selected.id, data)
        toast({ title: 'Evaluation updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        await evaluationService.create(data)
        toast({ title: 'Evaluation created', status: 'success', duration: 2500, isClosable: true })
      }
      createD.onClose()
      fetchEvals()
    } catch (err) {
      throw err  // let EvaluationModal show the error
    }
  }

  return (
    <Box>
      <PageHeader
        title="Evaluations & Grading"
        subtitle="All evaluations for your assigned students — including from workplace supervisors">
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
          <Input placeholder="Search student or evaluator…"
            value={search} onChange={e => setSearch(e.target.value)}
            bg="white" borderRadius="lg" />
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
              <Th>Evaluated By</Th>
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

                        {/* ✅ evaluator_email — shows workplace or academic supervisor */}
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {ev.evaluator_email || '—'}
                          </Text>
                        </Td>

                        {/* ✅ total_score */}
                        <Td>
                          <Text fontSize="sm" fontWeight="700" color="gray.700">
                            {ev.total_score != null ? `${ev.total_score}/100` : '—'}
                          </Text>
                        </Td>

                        {/* ✅ grade */}
                        <Td>
                          {ev.grade
                            ? <Badge colorScheme={gc} borderRadius="full" px={2} fontSize="10px">
                                {ev.grade}
                              </Badge>
                            : <Text fontSize="xs" color="gray.300">—</Text>
                          }
                        </Td>

                        {/* ✅ status */}
                        <Td>
                          <Badge colorScheme={sc} borderRadius="full" px={2} fontSize="10px">
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
                              icon={<ViewIcon />} size="xs" variant="ghost"
                              colorScheme="gray" aria-label="View"
                              onClick={() => handleView(ev)}
                            />
                            {ev.status === 'draft' && (
                              <>
                                <IconButton
                                  icon={<EditIcon />} size="xs" variant="ghost"
                                  colorScheme="blue" aria-label="Edit"
                                  onClick={() => handleEdit(ev)}
                                />
                                <IconButton
                                  icon={<CheckIcon />} size="xs" variant="ghost"
                                  colorScheme="green" aria-label="Submit"
                                  onClick={() => handleSubmit(ev.id)}
                                />
                              </>
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
        isOpen={createD.isOpen}
        onClose={createD.onClose}
        onSave={handleSave}
        evaluation={selected}
      />
      <EvaluationDetailModal
        isOpen={viewD.isOpen}
        onClose={viewD.onClose}
        evaluation={viewing}
      />
    </Box>
  )
}