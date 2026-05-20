import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Input, Select,
  Alert, AlertIcon, AlertDescription,
  Table, Thead, Tbody, Tr, Th, Td, FormLabel,
  Progress, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
} from '@chakra-ui/react'
import {
  MdCalendarToday, MdCheckCircle, MdCancel,
  MdSchedule, MdWarning, MdAdd, MdPeople,
  MdSearch,
} from 'react-icons/md'
import api from '../../api/axiosInstance'

function useFetch(endpoint) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const load = useCallback(async () => {
    if (!endpoint) return
    setLoading(true); setError(null)
    try { const res = await api.get(endpoint); setData(res.data) }
    catch (err) { setError(err.response?.data?.detail || err.message) }
    finally { setLoading(false) }
  }, [endpoint])
  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

const STATUS_CONFIG = {
  present: { color: 'green',  label: 'Present', icon: MdCheckCircle },
  absent:  { color: 'red',    label: 'Absent',  icon: MdCancel      },
  late:    { color: 'orange', label: 'Late',    icon: MdSchedule    },
  excused: { color: 'blue',   label: 'Excused', icon: MdWarning     },
}

function LoadingRows({ cols = 5 }) {
  return Array.from({ length: 4 }).map((_, i) => (
    <Tr key={i}>
      {Array.from({ length: cols }).map((__, j) => (
        <Td key={j} py={3} px={4}>
          <Box h="12px" bg="gray.100" borderRadius="full" w={j === 0 ? '80%' : '60%'} />
        </Td>
      ))}
    </Tr>
  ))
}

function LogAttendanceModal({ isOpen, onClose, students, onSubmit }) {
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10))
  const [rows,   setRows]   = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (students.length > 0) {
      setRows(students.map(s => ({
        student_id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        status: 'present',
        note: '',
      })))
    }
  }, [students, isOpen])

  const updateRow = (id, field, val) =>
    setRows(r => r.map(row => row.student_id === id ? { ...row, [field]: val } : row))

  const handleSubmit = async () => {
    setSaving(true)
    try { await onSubmit({ date, records: rows }); onClose() }
    finally { setSaving(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader pb={1}>
          <Text fontSize="md" fontWeight="700">Log Attendance</Text>
          <Text fontSize="xs" color="gray.400" fontWeight="400" mt={0.5}>
            Mark attendance for all students
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <FormLabel fontSize="xs" color="gray.500" mb={1}>Date</FormLabel>
            <Input type="date" size="sm" borderRadius="lg" bg="gray.50" w="200px"
              value={date} onChange={e => setDate(e.target.value)} />
          </Box>
          <VStack spacing={3} align="stretch">
            {rows.map(row => (
              <Box key={row.student_id} bg="gray.50" borderRadius="xl" p={4}>
                <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
                  <HStack spacing={2}>
                    <Avatar size="sm" name={row.name} bg="brand.600" color="white" fontSize="xs" />
                    <Text fontSize="sm" fontWeight="600" color="gray.700">{row.name}</Text>
                  </HStack>
                  <HStack spacing={2} flexWrap="wrap">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <Button key={key} size="xs" borderRadius="lg" fontSize="10px"
                        colorScheme={cfg.color}
                        variant={row.status === key ? 'solid' : 'outline'}
                        onClick={() => updateRow(row.student_id, 'status', key)}>
                        {cfg.label}
                      </Button>
                    ))}
                  </HStack>
                </Flex>
                {(row.status === 'absent' || row.status === 'late' || row.status === 'excused') && (
                  <Input mt={3} size="xs" borderRadius="lg" bg="white"
                    placeholder="Add a note (optional)"
                    value={row.note}
                    onChange={e => updateRow(row.student_id, 'note', e.target.value)} />
                )}
              </Box>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose} borderRadius="lg">Cancel</Button>
          <Button size="sm" bg="brand.600" color="white" borderRadius="lg"
            _hover={{ bg: 'brand.700' }} isLoading={saving}
            onClick={handleSubmit} isDisabled={!date}>
            Save Attendance
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function AttendanceLog() {
  const students = useFetch('/students/')
  const logs     = useFetch('/logs/')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter,   setDateFilter]   = useState('')

  const studentList = Array.isArray(students.data) ? students.data : []
  const logList     = Array.isArray(logs.data)     ? logs.data     : []
  const submittedLogs = logList.filter(l => l.status === 'submitted' || l.status === 'approved')

  const filtered = submittedLogs.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !search || r.student_email?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleSubmit = async ({ date, records }) => {
    try {
      toast({
        title: 'Attendance logged',
        description: `Recorded for ${records.length} students on ${date}`,
        status: 'success', duration: 3000, isClosable: true
      })
      onClose()
    } catch (err) {
      toast({ title: 'Failed to save', description: err.message, status: 'error', duration: 4000, isClosable: true })
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">Attendance Log</Text>
          <Text fontSize="sm" color="gray.400">Track and manage intern attendance records</Text>
        </Box>
        <Button leftIcon={<Icon as={MdAdd} />} bg="brand.600" color="white"
          borderRadius="xl" size="sm" _hover={{ bg: 'brand.700' }} onClick={onOpen}>
          Log Today's Attendance
        </Button>
      </Flex>

      {/* Summary stats */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        {[
          { label: 'Total Students',   value: studentList.length,                              icon: MdPeople,      color: 'brand'  },
          { label: 'Submitted Logs',   value: logList.filter(l => l.status === 'submitted').length, icon: MdCheckCircle, color: 'green'  },
          { label: 'Approved Logs',    value: logList.filter(l => l.status === 'approved').length,  icon: MdCalendarToday, color: 'teal' },
          { label: 'Pending Review',   value: logList.filter(l => l.status === 'submitted').length, icon: MdSchedule,    color: 'orange' },
        ].map(s => (
          <Box key={s.label} bg="white" borderRadius="2xl" p={5}
            border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                  letterSpacing="wider" mb={1}>{s.label}</Text>
                <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight={1}>
                  {s.value}
                </Text>
              </Box>
              <Flex w="44px" h="44px" borderRadius="xl" bg={`${s.color}.50`}
                align="center" justify="center">
                <Icon as={s.icon} boxSize={5} color={`${s.color}.500`} />
              </Flex>
            </Flex>
          </Box>
        ))}
      </Grid>

      {/* Per-student progress */}
      <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)" p={5} mb={5}>
        <Text fontWeight="700" fontSize="sm" color="gray.800" mb={4}>Students Overview</Text>
        {students.loading
          ? <Spinner size="sm" color="brand.500" />
          : (
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              {studentList.map(s => {
                const studentLogs = logList.filter(l => l.student_email === s.email)
                const approved    = studentLogs.filter(l => l.status === 'approved').length
                const total       = studentLogs.length
                const pct         = total > 0 ? Math.round((approved / total) * 100) : 0
                return (
                  <Box key={s.id}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.600" fontWeight="500">
                        {s.first_name} {s.last_name}
                      </Text>
                      <Text fontSize="xs" fontWeight="700"
                        color={pct >= 80 ? 'green.500' : pct >= 60 ? 'orange.500' : 'red.500'}>
                        {approved}/{total} logs
                      </Text>
                    </Flex>
                    <Progress value={pct} size="sm" borderRadius="full" bg="gray.100"
                      colorScheme={pct >= 80 ? 'green' : pct >= 60 ? 'orange' : 'red'} />
                  </Box>
                )
              })}
              {studentList.length === 0 && (
                <Text fontSize="sm" color="gray.400">No students assigned.</Text>
              )}
            </Grid>
          )
        }
      </Box>

      {/* Log records table */}
      <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
        <Flex px={5} py={4} justify="space-between" align="center"
          borderBottom="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontWeight="700" fontSize="sm" color="gray.800">Logbook Activity</Text>
            <Text fontSize="11px" color="gray.400">{filtered.length} records</Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            <Box position="relative">
              <Icon as={MdSearch} position="absolute" left={2} top="50%"
                transform="translateY(-50%)" color="gray.300" boxSize={4} pointerEvents="none" />
              <Input pl={8} size="sm" borderRadius="lg" bg="gray.50" w="150px"
                placeholder="Search…" value={search}
                onChange={e => setSearch(e.target.value)}
                _focus={{ bg: 'white', borderColor: 'brand.400' }} />
            </Box>
            <Select size="sm" w="130px" borderRadius="lg" bg="gray.50"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All status</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </Select>
          </HStack>
        </Flex>

        <Box overflowX="auto">
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr bg="gray.50">
                {['Student', 'Week', 'Activities', 'Status'].map(h => (
                  <Th key={h} px={4} py={3} fontSize="10px" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" fontWeight="600">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {logs.loading
                ? <LoadingRows cols={4} />
                : filtered.length > 0
                  ? filtered.map((r, i) => (
                      <Tr key={i} _hover={{ bg: 'gray.50' }}
                        borderBottom="1px solid" borderColor="gray.50">
                        <Td py={3} px={4}>
                          <HStack spacing={2}>
                            <Avatar size="xs" name={r.student_email}
                              bg="brand.600" color="white" />
                            <Text fontSize="sm" fontWeight="600" color="gray.700">
                              {r.student_email}
                            </Text>
                          </HStack>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="sm" color="gray.600">Week {r.week_number}</Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {r.activities_done}
                          </Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Badge
                            colorScheme={
                              r.status === 'approved'  ? 'green'  :
                              r.status === 'submitted' ? 'teal'   : 'gray'
                            }
                            borderRadius="full" px={2} fontSize="10px">
                            {r.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))
                  : (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={10} color="gray.400" fontSize="sm">
                        No logbook activity yet.
                      </Td>
                    </Tr>
                  )
              }
            </Tbody>
          </Table>
        </Box>
      </Box>

      <LogAttendanceModal
        isOpen={isOpen} onClose={onClose}
        students={studentList} onSubmit={handleSubmit}
      />
    </Box>
  )
}