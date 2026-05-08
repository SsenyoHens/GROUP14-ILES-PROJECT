import { useState, useCallback, useEffect } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Progress,
  Alert, AlertIcon, AlertDescription,
  Table, Thead, Tbody, Tr, Th, Td,
  Textarea, Select, Input, FormLabel,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, CircularProgress, CircularProgressLabel,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb, useToast,
} from '@chakra-ui/react'
import {
  MdPeople, MdAssignment, MdCheckCircle, MdSchedule,
  MdTrendingUp, MdStar, MdBarChart, MdPerson,
  MdWarning, MdCalendarToday, MdSearch, MdBook,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'

function useFetch(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await api.get(endpoint); setData(res.data) }
    catch (err) { setError(err.response?.data?.detail || err.message) }
    finally { setLoading(false) }
  }, [endpoint])
  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

const EVAL_CRITERIA = [
  { key: 'punctuality',   label: 'Punctuality & Attendance' },
  { key: 'attitude',      label: 'Work Attitude'            },
  { key: 'technical',     label: 'Technical Skills'         },
  { key: 'communication', label: 'Communication'            },
  { key: 'teamwork',      label: 'Teamwork'                 },
  { key: 'initiative',    label: 'Initiative'               },
]

const ATTENDANCE_STATUS = {
  present: { color: 'green',  label: 'Present' },
  absent:  { color: 'red',    label: 'Absent'  },
  late:    { color: 'orange', label: 'Late'    },
  excused: { color: 'blue',   label: 'Excused' },
}

function ErrorBanner({ message, onRetry }) {
  return (
    <Alert status="error" borderRadius="lg" fontSize="sm" mb={3}>
      <AlertIcon /><AlertDescription flex={1}>{message}</AlertDescription>
      {onRetry && <Button size="xs" ml={3} onClick={onRetry} colorScheme="red" variant="outline">Retry</Button>}
    </Alert>
  )
}

function EvalModal({ isOpen, onClose, student, onSubmit }) {
  const [scores, setScores] = useState(Object.fromEntries(EVAL_CRITERIA.map(c => [c.key, 70])))
  const [comments, setComments] = useState('')
  const [week, setWeek] = useState('')
  const [saving, setSaving] = useState(false)
  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / EVAL_CRITERIA.length)
  const handleSubmit = async () => {
    setSaving(true)
    try { await onSubmit({ student_id: student?.id, scores, comments, week, overall }); onClose() }
    finally { setSaving(false) }
  }
  if (!student) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader pb={1}>
          <Text fontSize="md" fontWeight="700">Evaluate Student</Text>
          <Text fontSize="xs" color="gray.400" fontWeight="400" mt={0.5}>{student.name} · {student.registration_number}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5}>
            <Flex w="full" bg="brand.50" borderRadius="xl" p={4} align="center" justify="space-between">
              <Box>
                <Text fontSize="xs" color="brand.600" fontWeight="600">Overall Score</Text>
                <Text fontSize="3xl" fontWeight="800" color="brand.700" lineHeight={1}>{overall}</Text>
                <Text fontSize="10px" color="brand.400">/ 100</Text>
              </Box>
              <CircularProgress value={overall} size="70px" thickness="8px" color="brand.500" trackColor="brand.100">
                <CircularProgressLabel fontSize="sm" fontWeight="800" color="brand.700">{overall}%</CircularProgressLabel>
              </CircularProgress>
            </Flex>
            <Box w="full">
              <Text fontSize="xs" fontWeight="600" color="gray.600" mb={3}>Assessment Criteria</Text>
              <VStack spacing={4} align="stretch">
                {EVAL_CRITERIA.map(c => (
                  <Box key={c.key}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.600">{c.label}</Text>
                      <Text fontSize="xs" fontWeight="700" color="brand.600">{scores[c.key]}/100</Text>
                    </Flex>
                    <Slider value={scores[c.key]} onChange={v => setScores(s => ({ ...s, [c.key]: v }))} min={0} max={100} step={5}>
                      <SliderTrack bg="gray.100" borderRadius="full"><SliderFilledTrack bg="brand.500" /></SliderTrack>
                      <SliderThumb boxSize={4} boxShadow="md" />
                    </Slider>
                  </Box>
                ))}
              </VStack>
            </Box>
            <Grid templateColumns="1fr 2fr" gap={4} w="full">
              <Box>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>Week</FormLabel>
                <Select size="sm" borderRadius="lg" bg="gray.50" value={week} onChange={e => setWeek(e.target.value)}>
                  <option value="">Select…</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>Week {i+1}</option>)}
                  <option value="mid">Mid-term</option>
                  <option value="final">Final</option>
                </Select>
              </Box>
              <Box>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>Comments</FormLabel>
                <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={3}
                  placeholder="Feedback…" value={comments} onChange={e => setComments(e.target.value)} />
              </Box>
            </Grid>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose} borderRadius="lg">Cancel</Button>
          <Button size="sm" bg="brand.600" color="white" borderRadius="lg" _hover={{ bg: 'brand.700' }}
            isLoading={saving} onClick={handleSubmit} isDisabled={!week}>Submit Evaluation</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function AttModal({ isOpen, onClose, student, onSubmit }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState('present')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const handleSubmit = async () => {
    setSaving(true)
    try { await onSubmit({ student_id: student?.id, date, status, note }); onClose() }
    finally { setSaving(false) }
  }
  if (!student) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader pb={1}>
          <Text fontSize="md" fontWeight="700">Log Attendance</Text>
          <Text fontSize="xs" color="gray.400" fontWeight="400" mt={0.5}>{student.name}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Date</FormLabel>
              <Input type="date" size="sm" borderRadius="lg" bg="gray.50" value={date} onChange={e => setDate(e.target.value)} />
            </Box>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Status</FormLabel>
              <Grid templateColumns="1fr 1fr" gap={2}>
                {Object.entries(ATTENDANCE_STATUS).map(([key, cfg]) => (
                  <Button key={key} size="sm" borderRadius="lg" fontSize="xs"
                    colorScheme={cfg.color} variant={status === key ? 'solid' : 'outline'}
                    onClick={() => setStatus(key)}>{cfg.label}</Button>
                ))}
              </Grid>
            </Box>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Note (optional)</FormLabel>
              <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={2}
                placeholder="Any remarks…" value={note} onChange={e => setNote(e.target.value)} />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose} borderRadius="lg">Cancel</Button>
          <Button size="sm" bg="brand.600" color="white" borderRadius="lg" _hover={{ bg: 'brand.700' }}
            isLoading={saving} onClick={handleSubmit}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function WorkplaceSupervisorDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const evalD = useDisclosure()
  const attD  = useDisclosure()
  const [sel, setSel] = useState(null)
  const [search, setSearch] = useState('')

  // /workplace-supervisor/summary/        → { total_students, pending_evaluations, attendance_issues, avg_score }
  // /workplace-supervisor/students/       → [{ id, name, registration_number, department, attendance_pct, last_evaluation }]
  // /workplace-supervisor/logbook-entries/→ [{ id, student_name, date, activities, approved }]
  const summary  = useFetch('/workplace-supervisor/summary/')
  const students = useFetch('/workplace-supervisor/students/')
  const logbook  = useFetch('/workplace-supervisor/logbook-entries/')

  const studentList = (students.data ?? []).filter(s => {
    const q = search.toLowerCase()
    return !search || s.name?.toLowerCase().includes(q) || s.registration_number?.toLowerCase().includes(q)
  })
  const logEntries  = logbook.data  ?? []
  const sd          = summary.data  ?? {}

  const submitEval = async (payload) => {
    await api.post('/workplace-supervisor/evaluations/', payload)
    toast({ title: 'Evaluation submitted', status: 'success', duration: 3000, isClosable: true })
    students.refetch()
  }
  const submitAtt = async (payload) => {
    await api.post('/workplace-supervisor/attendance/', payload)
    toast({ title: 'Attendance logged', status: 'success', duration: 3000, isClosable: true })
    students.refetch()
  }
  const approveLog = async (id) => {
    await api.patch(`/workplace-supervisor/logbook-entries/${id}/approve/`)
    logbook.refetch()
  }

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="xl" fontWeight="800" color="gray.800">Welcome, {user?.name?.split(' ')[0] || 'Supervisor'} 👋</Text>
        <Text fontSize="sm" color="gray.400">{user?.organisation || 'Manage your intern students.'}</Text>
      </Box>

      {summary.error && <ErrorBanner message={summary.error} onRetry={summary.refetch} />}

      <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(4,1fr)' }} gap={4} mb={6}>
        {[
          { label: 'My Students',         value: sd.total_students,     icon: MdPeople,     color: 'brand',  sub: 'Assigned interns'  },
          { label: 'Pending Evaluations', value: sd.pending_evaluations, icon: MdAssignment, color: 'orange', sub: 'Need attention'     },
          { label: 'Attendance Issues',   value: sd.attendance_issues,   icon: MdWarning,    color: 'red',    sub: 'Below 80%'          },
          { label: 'Avg. Score',          value: sd.avg_score != null ? `${sd.avg_score}%` : null,
                                                                         icon: MdTrendingUp, color: 'green',  sub: 'All evaluations'    },
        ].map(s => (
          <Box key={s.label} bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)"
            _hover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' }} transition="all 0.2s">
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>{s.label}</Text>
                {summary.loading
                  ? <Box h="28px" w="60px" bg="gray.100" borderRadius="md" mt={1} />
                  : <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight={1}>{s.value ?? '—'}</Text>
                }
                <Text fontSize="10px" color="gray.400" mt={2}>{s.sub}</Text>
              </Box>
              <Flex w="44px" h="44px" borderRadius="xl" bg={`${s.color}.50`} align="center" justify="center">
                <Icon as={s.icon} boxSize={5} color={`${s.color}.500`} />
              </Flex>
            </Flex>
          </Box>
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '1fr 340px' }} gap={5}>
        {/* Students table */}
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
          <Flex px={5} py={4} justify="space-between" align="center"
            borderBottom="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
            <Box>
              <Text fontWeight="700" fontSize="sm" color="gray.800">My Students</Text>
              <Text fontSize="11px" color="gray.400">{students.loading ? 'Loading…' : `${studentList.length} assigned`}</Text>
            </Box>
            <Box position="relative">
              <Icon as={MdSearch} position="absolute" left={2} top="50%"
                transform="translateY(-50%)" color="gray.300" boxSize={4} pointerEvents="none" />
              <Input pl={8} size="sm" borderRadius="lg" bg="gray.50" w="160px" placeholder="Search…"
                value={search} onChange={e => setSearch(e.target.value)}
                _focus={{ bg: 'white', borderColor: 'brand.400' }} />
            </Box>
          </Flex>
          <Box overflowX="auto">
            <Table size="sm" variant="unstyled">
              <Thead><Tr bg="gray.50">
                {['Student', 'Department', 'Attendance', 'Last Eval', 'Actions'].map(h => (
                  <Th key={h} px={4} py={3} fontSize="10px" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" fontWeight="600">{h}</Th>
                ))}
              </Tr></Thead>
              <Tbody>
                {students.loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <Tr key={i}>{Array.from({ length: 5 }).map((__, j) => (
                        <Td key={j} py={3} px={4}><Box h="12px" bg="gray.100" borderRadius="full" /></Td>
                      ))}</Tr>
                    ))
                  : studentList.length > 0
                    ? studentList.map(s => (
                        <Tr key={s.id} _hover={{ bg: 'gray.50' }} borderBottom="1px solid" borderColor="gray.100">
                          <Td py={3} px={4}>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={s.name} bg="brand.600" color="white" fontSize="xs" />
                              <Box>
                                <Text fontSize="sm" fontWeight="600" color="gray.800">{s.name}</Text>
                                <Text fontSize="11px" color="gray.400" fontFamily="mono">{s.registration_number}</Text>
                              </Box>
                            </HStack>
                          </Td>
                          <Td py={3} px={4}><Text fontSize="sm" color="gray.600">{s.department || '—'}</Text></Td>
                          <Td py={3} px={4}>
                            <HStack spacing={1}>
                              <Box w="7px" h="7px" borderRadius="full"
                                bg={s.attendance_pct >= 80 ? 'green.400' : s.attendance_pct >= 60 ? 'orange.400' : 'red.400'} />
                              <Text fontSize="sm">{s.attendance_pct != null ? `${s.attendance_pct}%` : '—'}</Text>
                            </HStack>
                          </Td>
                          <Td py={3} px={4}>
                            <Badge colorScheme={s.last_evaluation ? 'green' : 'orange'} borderRadius="full" px={2} fontSize="10px">
                              {s.last_evaluation || 'Not yet'}
                            </Badge>
                          </Td>
                          <Td py={3} px={4}>
                            <HStack spacing={2}>
                              <Button size="xs" leftIcon={<Icon as={MdStar} boxSize={3} />}
                                colorScheme="brand" variant="outline" borderRadius="lg" fontSize="10px"
                                onClick={() => { setSel(s); evalD.onOpen() }}>Evaluate</Button>
                              <Button size="xs" leftIcon={<Icon as={MdCalendarToday} boxSize={3} />}
                                colorScheme="blue" variant="outline" borderRadius="lg" fontSize="10px"
                                onClick={() => { setSel(s); attD.onOpen() }}>Attendance</Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    : <Tr><Td colSpan={5} textAlign="center" py={10} color="gray.400" fontSize="sm">
                        {search ? 'No matches.' : 'No students assigned.'}
                      </Td></Tr>
                }
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Right */}
        <VStack spacing={5} align="stretch">
          {/* Logbook reviews */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
            <Flex px={5} py={4} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100">
              <Box>
                <Text fontWeight="700" fontSize="sm" color="gray.800">Logbook Reviews</Text>
                <Text fontSize="11px" color="gray.400">
                  {logbook.loading ? 'Loading…' : `${logEntries.filter(e => !e.approved).length} pending`}
                </Text>
              </Box>
              {logEntries.filter(e => !e.approved).length > 0 && (
                <Badge colorScheme="orange" borderRadius="full" px={2} fontSize="10px">
                  {logEntries.filter(e => !e.approved).length} new
                </Badge>
              )}
            </Flex>
            {logbook.loading
              ? <Flex justify="center" py={6}><Spinner color="brand.500" /></Flex>
              : logEntries.length > 0
                ? logEntries.slice(0, 5).map((e, i) => (
                    <Flex key={i} align="flex-start" gap={3} p={3} _hover={{ bg: 'gray.50' }}
                      borderBottom="1px solid" borderColor="gray.50">
                      <Avatar size="xs" name={e.student_name} bg="brand.500" color="white" />
                      <Box flex={1} minW={0}>
                        <Text fontSize="xs" fontWeight="600" color="gray.700">{e.student_name}</Text>
                        <Text fontSize="10px" color="gray.400" mb={1}>{e.date}</Text>
                        <Text fontSize="xs" color="gray.600" noOfLines={2}>{e.activities}</Text>
                      </Box>
                      {!e.approved
                        ? <Button size="xs" colorScheme="green" variant="outline" borderRadius="lg"
                            fontSize="9px" flexShrink={0} onClick={() => approveLog(e.id)}>Approve</Button>
                        : <Icon as={MdCheckCircle} color="green.400" boxSize={4} flexShrink={0} mt={0.5} />
                      }
                    </Flex>
                  ))
                : <Flex direction="column" align="center" py={8} gap={2}>
                    <Icon as={MdBook} boxSize={8} color="gray.200" />
                    <Text fontSize="sm" color="gray.400">No entries to review.</Text>
                  </Flex>
            }
          </Box>

          {/* Attendance overview */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" p={5}>
            <Text fontWeight="700" fontSize="sm" color="gray.800" mb={4}>Attendance Overview</Text>
            {students.loading
              ? <Flex justify="center" py={4}><Spinner size="sm" color="brand.500" /></Flex>
              : (students.data ?? []).slice(0, 5).map(s => (
                  <Box key={s.id} mb={3}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.600" fontWeight="500">{s.name?.split(' ')[0]}</Text>
                      <Text fontSize="xs" color="gray.400">{s.attendance_pct ?? '—'}%</Text>
                    </Flex>
                    <Progress value={s.attendance_pct ?? 0} size="xs" borderRadius="full" bg="gray.100"
                      colorScheme={s.attendance_pct >= 80 ? 'green' : s.attendance_pct >= 60 ? 'orange' : 'red'} />
                  </Box>
                ))
            }
          </Box>

          {/* Quick actions */}
          <Grid templateColumns="1fr 1fr" gap={3}>
            {[
              { label: 'My Students', icon: MdPeople,         color: 'brand'  },
              { label: 'Evaluations', icon: MdStar,           color: 'orange' },
              { label: 'Attendance',  icon: MdCalendarToday,  color: 'blue'   },
              { label: 'My Profile',  icon: MdPerson,         color: 'purple' },
            ].map(a => (
              <Button key={a.label} leftIcon={<Icon as={a.icon} />}
                variant="outline" borderColor="gray.200" bg="white" color="gray.600"
                borderRadius="xl" size="sm" fontSize="xs" fontWeight="500" py={5}
                _hover={{ bg: `${a.color}.50`, borderColor: `${a.color}.300`, color: `${a.color}.600` }}
                transition="all 0.15s">{a.label}</Button>
            ))}
          </Grid>
        </VStack>
      </Grid>

      <EvalModal isOpen={evalD.isOpen} onClose={evalD.onClose} student={sel} onSubmit={submitEval} />
      <AttModal  isOpen={attD.isOpen}  onClose={attD.onClose}  student={sel} onSubmit={submitAtt}  />
    </Box>
  )
}