import { useEffect, useState, useCallback } from 'react'
import {
  Box, HStack, Button, Select, Table, Thead, Tbody, Tr, Th, Td,
  Badge, IconButton, useDisclosure, useToast, Spinner, Center,
  Alert, AlertIcon, Input, InputGroup, InputLeftElement, Text,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, EditIcon, CheckIcon } from '@chakra-ui/icons'
import PageHeader from '../../components/PageHeader'
import EvaluationModal from '../../components/modals/EvaluationModal'
import { evaluationService } from '../../api/services'

const gradeColor = { A: 'green', B: 'teal', C: 'blue', D: 'orange', F: 'red' }
const statusColor = { Draft: 'gray', Submitted: 'green', Graded: 'purple' }

function Evaluations() {
  const [evals,   setEvals]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('All')
  const [selected, setSelected] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchEvals = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await evaluationService.getAll({
        search, status: filter !== 'All' ? filter : undefined,
      })
      setEvals(res.data)
    } catch { setError('Could not load evaluations.') }
    finally { setLoading(false) }
  }, [search, filter])

  useEffect(() => { fetchEvals() }, [fetchEvals])

  const handleAdd  = () => { setSelected(null); onOpen() }
  const handleEdit = (e) => { setSelected(e);   onOpen() }

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
      onClose(); fetchEvals()
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Save failed', status: 'error', duration: 3000, isClosable: true })
    }
  }

  return (
    <Box>
      <PageHeader title="Evaluations & Grading" subtitle="Review and grade student internship performance">
        <Button leftIcon={<AddIcon />} onClick={handleAdd}
          bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} size="sm">
          New Evaluation
        </Button>
      </PageHeader>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="300px" size="sm">
          <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
          <Input placeholder="Search student..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            bg="white" borderRadius="lg" />
        </InputGroup>
        <Select maxW="170px" size="sm" value={filter}
          onChange={(e) => setFilter(e.target.value)} bg="white" borderRadius="lg">
          <option>All</option>
          <option>Draft</option>
          <option>Submitted</option>
          <option>Graded</option>
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
              <Th>Period</Th>
              <Th>Score</Th>
              <Th>Grade</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={8} py={10}><Center><Spinner color="brand.500" /></Center></Td></Tr>
            ) : evals.length === 0 ? (
              <Tr><Td colSpan={8} textAlign="center" py={10} color="gray.400">No evaluations found</Td></Tr>
            ) : evals.map((e) => (
              <Tr key={e.id} _hover={{ bg: 'gray.50' }}>
                <Td fontSize="sm" fontWeight="500">{e.studentName}</Td>
                <Td fontSize="xs" color="gray.500" fontFamily="mono">{e.regNumber}</Td>
                <Td fontSize="sm">{e.workplace}</Td>
                <Td fontSize="xs" color="gray.500">{e.period}</Td>
                <Td fontSize="sm" fontWeight="600">{e.score ?? '—'}</Td>
                <Td>
                  {e.grade ? (
                    <Badge colorScheme={gradeColor[e.grade] || 'gray'}
                      borderRadius="full" px={2} fontSize="10px">
                      {e.grade}
                    </Badge>
                  ) : <Text fontSize="xs" color="gray.400">—</Text>}
                </Td>
                <Td>
                  <Badge colorScheme={statusColor[e.status] || 'gray'}
                    borderRadius="full" px={2} fontSize="10px">
                    {e.status}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton icon={<EditIcon />} size="xs" variant="ghost"
                      colorScheme="blue" aria-label="Edit" onClick={() => handleEdit(e)} />
                    {e.status === 'Draft' && (
                      <IconButton icon={<CheckIcon />} size="xs" variant="ghost"
                        colorScheme="green" aria-label="Submit" onClick={() => handleSubmit(e.id)} />
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <EvaluationModal isOpen={isOpen} onClose={onClose} onSave={handleSave} evaluation={selected} />
    </Box>
  )
}

export default Evaluations