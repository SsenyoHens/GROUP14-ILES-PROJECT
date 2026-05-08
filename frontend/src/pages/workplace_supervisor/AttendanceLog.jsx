import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Input, Select,
  Alert, AlertIcon, AlertDescription,
  Table, Thead, Tbody, Tr, Th, Td, FormLabel,
  Textarea, Progress, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
} from '@chakra-ui/react'
import {
  MdCalendarToday, MdCheckCircle, MdCancel,
  MdSchedule, MdWarning, MdAdd, MdPeople,
  MdTrendingUp, MdSearch,
} from 'react-icons/md'
import api from '../../api/axiosInstance'

function useFetch(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

// Modal to log attendance for one or all students
function LogAttendanceModal({ isOpen, onClose, students, onSubmit }) {
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10))
  const [rows,   setRows]   = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (students.length > 0) {
      setRows(students.map(s => ({ student_id: s.id, name: s.name, status: 'present', note: '' })))
    }
  }, [students, isOpen])

  const updateRow = (id, field, val) =>
    setRows(r => r.map(row => row.student_id === id ? { ...row, [field]: val } : row))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit({ date, records: rows })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader pb={1}>
          <Text fontSize="md" fontWeight="700">Log Attendance</Text>
          <Text fontSize="xs" color="gray.400" fontWeight="400" mt={0.5}>Mark attendance for all students</Text>
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
                  <Input mt={3} size="xs" borderRadius="lg" bg="white" placeholder="Add a note (optional)"
                    value={row.note} onChange={e => updateRow(row.student_id, 'note', e.target.value)} />
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
  // /workplace-supervisor/students/ → [{ id, name, registration_number, attendance_pct }]
  // /workplace-supervisor/attendance/ → [{ id, student_name, student_id, date, status, note }]
  const students   = useFetch('/workplace-supervisor/students/')
  const attendance = useFetch('/workplace-supervisor/attendance/')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const [search,      setSearch]      = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter,   setDateFilter]   = useState('')

  const studentList   = students.data   ?? []
  const attendanceLog = attendance.data ?? []

  const filtered = attendanceLog.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !search || r.student_name?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || r.status === statusFilter
    const matchDate   = !dateFilter   || r.date === dateFilter
    return matchSearch && matchStatus && matchDate
  })

  // Stats
  const today = new Date().toISOString().slice(0, 10)
  const todayRecords = attendanceLog.filter(r => r.date === today)
  const presentToday  = todayRecords.filter(r => r.status === 'present').length
  const absentToday   = todayRecords.filter(r => r.status === 'absent').length
  const lateToday     = todayRecords.filter(r => r.status === 'late').length

  const handleSubmit = async ({ date, records }) => {
    try {
      await api.post('/workplace-supervisor/attendance/bulk/', { date, records })
      toast({ title: 'Attendance saved', status: 'success', duration: 3000, isClosable: true })
      attendance.refetch()
    } catch (err) {
      toast({ title: 'Failed to save', description: err.message, status: 'error', duration: 4000, isClosable: true })
      throw err
    }
  }

  return (
    <Box>
      {/* Header */}
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

      {/* Today's summary */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        {[
          { label: 'Total Students', value: studentList.length,          icon: MdPeople,        color: 'brand'  },
          { label: 'Present Today',  value: presentToday,                icon: MdCheckCircle,   color: 'green'  },
          { label: 'Absent Today',   value: absentToday,                 icon: MdCancel,        color: 'red'    },
          { label: 'Late Today',     value: lateToday,                   icon: MdSchedule,      color: 'orange' },
        ].map(s => (
          <Box key={s.label} bg="white" borderRadius="2xl" p={5}
            border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>{s.label}</Text>
                <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight={1}>{s.value}</Text>
              </Box>
              <Flex w="44px" h="44px" borderRadius="xl" bg={`${s.color}.50`} align="center" justify="center">
                <Icon as={s.icon} boxSize={5} color={`${s.color}.500`} />
              </Flex>
            </Flex>
          </Box>
        ))}
      </Grid>

      {/* Per-student attendance % */}
      <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)" p={5} mb={5}>
        <Text fontWeight="700" fontSize="sm" color="gray.800" mb={4}>Overall Attendance Rate</Text>
        {students.loading
          ? <Spinner size="sm" color="brand.500" />
          : (
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              {studentList.map(s => (
                <Box key={s.id}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="xs" color="gray.600" fontWeight="500">{s.name}</Text>
                    <Text fontSize="xs" fontWeight="700"
                      color={s.attendance_pct >= 80 ? 'green.500' : s.attendance_pct >= 60 ? 'orange.500' : 'red.500'}>
                      {s.attendance_pct ?? '—'}%
                    </Text>
                  </Flex>
                  <Progress value={s.attendance_pct ?? 0} size="sm" borderRadius="full" bg="gray.100"
                    colorScheme={s.attendance_pct >= 80 ? 'green' : s.attendance_pct >= 60 ? 'orange' : 'red'} />
                </Box>
              ))}
            </Grid>
          )
        }
      </Box>

      {/* Attendance records table */}
      <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">

        <Flex px={5} py={4} justify="space-between" align="center"
          borderBottom="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontWeight="700" fontSize="sm" color="gray.800">Attendance Records</Text>
            <Text fontSize="11px" color="gray.400">{filtered.length} records</Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            <Box position="relative">
              <Icon as={MdSearch} position="absolute" left={2} top="50%"
                transform="translateY(-50%)" color="gray.300" boxSize={4} pointerEvents="none" />
              <Input pl={8} size="sm" borderRadius="lg" bg="gray.50" w="150px"
                placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                _focus={{ bg: 'white', borderColor: 'brand.400' }} />
            </Box>
            <Select size="sm" w="130px" borderRadius="lg" bg="gray.50"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </Select>
            <Input type="date" size="sm" w="140px" borderRadius="lg" bg="gray.50"
              value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              _focus={{ bg: 'white', borderColor: 'brand.400' }} />
          </HStack>
        </Flex>

        {attendance.error && (
          <Box px={5} pt={4}>
            <Alert status="error" borderRadius="xl">
              <AlertIcon /><AlertDescription>{attendance.error}</AlertDescription>
            </Alert>
          </Box>
        )}

        <Box overflowX="auto">
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr bg="gray.50">
                {['Student', 'Date', 'Status', 'Note', 'Logged By'].map(h => (
                  <Th key={h} px={4} py={3} fontSize="10px" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" fontWeight="600">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {attendance.loading
                ? <LoadingRows cols={5} />
                : filtered.length > 0
                  ? filtered.map((r, i) => {
                      const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.present
                      return (
                        <Tr key={i} _hover={{ bg: 'gray.50' }} borderBottom="1px solid" borderColor="gray.50">
                          <Td py={3} px={4}>
                            <HStack spacing={2}>
                              <Avatar size="xs" name={r.student_name} bg="brand.600" color="white" />
                              <Text fontSize="sm" fontWeight="600" color="gray.700">{r.student_name}</Text>
                            </HStack>
                          </Td>
                          <Td py={3} px={4}>
                            <Text fontSize="sm" color="gray.600">{r.date}</Text>
                          </Td>
                          <Td py={3} px={4}>
                            <Badge colorScheme={cfg.color} borderRadius="full" px={2} fontSize="10px">
                              <HStack spacing={1}>
                                <Icon as={cfg.icon} boxSize={2.5} />
                                <Text>{cfg.label}</Text>
                              </HStack>
                            </Badge>
                          </Td>
                          <Td py={3} px={4}>
                            <Text fontSize="xs" color="gray.400">{r.note || '—'}</Text>
                          </Td>
                          <Td py={3} px={4}>
                            <Text fontSize="xs" color="gray.400">{r.logged_by || 'You'}</Text>
                          </Td>
                        </Tr>
                      )
                    })
                  : (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={10} color="gray.400" fontSize="sm">
                        {search || statusFilter || dateFilter
                          ? 'No records match your filters.'
                          : 'No attendance records yet. Log today\'s attendance to get started.'}
                      </Td>
                    </Tr>
                  )
              }
            </Tbody>
          </Table>
        </Box>
      </Box>

      <LogAttendanceModal
        isOpen={isOpen}
        onClose={onClose}
        students={studentList}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}