import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Input,
  Alert, AlertIcon, AlertDescription,
  Table, Thead, Tbody, Tr, Th, Td,
  Select, Progress, Drawer, DrawerOverlay,
  DrawerContent, DrawerHeader, DrawerBody,
  DrawerCloseButton, useDisclosure, Divider,
  CircularProgress, CircularProgressLabel,
} from '@chakra-ui/react'
import {
  MdPeople, MdSearch, MdStar, MdCalendarToday,
  MdCheckCircle, MdWarning, MdTrendingUp,
  MdPerson, MdEmail, MdPhone, MdSchool,
  MdAssignment, MdBook,
} from 'react-icons/md'
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

function LoadingRows({ cols = 6 }) {
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

function StatCard({ label, value, icon, color, loading }) {
  return (
    <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)">
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>{label}</Text>
          {loading
            ? <Box h="28px" w="50px" bg="gray.100" borderRadius="md" mt={1} />
            : <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight={1}>{value ?? '—'}</Text>
          }
        </Box>
        <Flex w="44px" h="44px" borderRadius="xl" bg={`${color}.50`} align="center" justify="center">
          <Icon as={icon} boxSize={5} color={`${color}.500`} />
        </Flex>
      </Flex>
    </Box>
  )
}

// Student detail drawer
function StudentDrawer({ student, isOpen, onClose }) {
  // Fetch individual student detail when drawer opens
  // Expects: { ...student fields, evaluations: [], logbook_count, attendance_records: [] }
  const { data, loading } = useFetch(student ? `/workplace-supervisor/students/${student.id}/` : null)
  const detail = data ?? {}

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md" placement="right">
      <DrawerOverlay bg="blackAlpha.200" backdropFilter="blur(4px)" />
      <DrawerContent borderRadius="2xl 0 0 2xl" overflow="hidden">
        <DrawerCloseButton mt={2} />
        <DrawerHeader borderBottom="1px solid" borderColor="gray.100" pb={4}>
          {student && (
            <HStack spacing={3}>
              <Avatar size="md" name={student.name} bg="brand.600" color="white" />
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.800">{student.name}</Text>
                <Text fontSize="xs" color="gray.400" fontFamily="mono">{student.registration_number}</Text>
              </Box>
            </HStack>
          )}
        </DrawerHeader>
        <DrawerBody px={5} py={4}>
          {loading
            ? <Flex justify="center" align="center" h="200px"><Spinner color="brand.500" /></Flex>
            : (
              <VStack spacing={5} align="stretch">

                {/* Stats row */}
                <Grid templateColumns="repeat(3,1fr)" gap={3}>
                  {[
                    { label: 'Attendance', value: `${student?.attendance_pct ?? '—'}%`,
                      color: student?.attendance_pct >= 80 ? 'green' : 'orange' },
                    { label: 'Evaluations', value: detail.evaluations?.length ?? '—', color: 'brand' },
                    { label: 'Logbook',    value: detail.logbook_count ?? '—',         color: 'purple' },
                  ].map(s => (
                    <Box key={s.label} bg="gray.50" borderRadius="xl" p={3} textAlign="center">
                      <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{s.label}</Text>
                      <Text fontSize="lg" fontWeight="800" color={`${s.color}.500`} mt={1}>{s.value}</Text>
                    </Box>
                  ))}
                </Grid>

                {/* Personal info */}
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" mb={3}>Contact Info</Text>
                  {[
                    { icon: MdEmail,  label: 'Email',       value: student?.email       },
                    { icon: MdPhone,  label: 'Phone',       value: student?.phone       },
                    { icon: MdSchool, label: 'Programme',   value: student?.programme   },
                    { icon: MdPerson, label: 'Department',  value: student?.department  },
                  ].map(r => r.value && (
                    <Flex key={r.label} align="center" gap={3} py={2}
                      borderBottom="1px solid" borderColor="gray.50" _last={{ border: 'none' }}>
                      <Icon as={r.icon} color="gray.300" boxSize={4} flexShrink={0} />
                      <Box>
                        <Text fontSize="10px" color="gray.400">{r.label}</Text>
                        <Text fontSize="xs" fontWeight="600" color="gray.700">{r.value}</Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>

                <Divider />

                {/* Recent evaluations */}
                {(detail.evaluations ?? []).length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="gray.400"
                      textTransform="uppercase" letterSpacing="wider" mb={3}>Recent Evaluations</Text>
                    <VStack spacing={2} align="stretch">
                      {detail.evaluations.slice(0, 3).map((ev, i) => (
                        <Flex key={i} align="center" gap={3} p={3} bg="gray.50" borderRadius="lg">
                          <CircularProgress value={ev.score ?? 0} size="36px" thickness="8px"
                            color={ev.score >= 70 ? 'green.400' : 'orange.400'} trackColor="gray.200">
                            <CircularProgressLabel fontSize="8px" fontWeight="800">{ev.score}</CircularProgressLabel>
                          </CircularProgress>
                          <Box flex={1}>
                            <Text fontSize="xs" fontWeight="600" color="gray.700">{ev.title}</Text>
                            <Text fontSize="10px" color="gray.400">{ev.date}</Text>
                          </Box>
                          <Badge colorScheme={ev.status === 'graded' ? 'green' : 'orange'}
                            borderRadius="full" fontSize="9px">{ev.status}</Badge>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )
          }
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default function MyStudents() {
  // API expects: array of { id, name, registration_number, department, programme,
  //   email, phone, attendance_pct, last_evaluation, status }
  const { data, loading, error, refetch } = useFetch('/workplace-supervisor/students/')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const students = data ?? []

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(q) ||
      s.registration_number?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleView = (s) => { setSelected(s); onOpen() }

  const goodAttendance = students.filter(s => (s.attendance_pct ?? 0) >= 80).length
  const issues        = students.filter(s => (s.attendance_pct ?? 100) < 80).length
  const evaluated     = students.filter(s => s.last_evaluation).length

  return (
    <Box>
      {/* Header */}
      <Box mb={6}>
        <Text fontSize="xl" fontWeight="800" color="gray.800">My Students</Text>
        <Text fontSize="sm" color="gray.400">
          {loading ? 'Loading…' : `${students.length} interns assigned to you`}
        </Text>
      </Box>

      {/* Stats */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        <StatCard label="Total Students"   value={students.length} icon={MdPeople}     color="brand"  loading={loading} />
        <StatCard label="Good Attendance"  value={goodAttendance}  icon={MdCheckCircle} color="green"  loading={loading} />
        <StatCard label="Attendance Issues" value={issues}         icon={MdWarning}    color="red"    loading={loading} />
        <StatCard label="Evaluated"        value={evaluated}       icon={MdAssignment} color="purple" loading={loading} />
      </Grid>

      {error && (
        <Alert status="error" borderRadius="xl" mb={4}>
          <AlertIcon /><AlertDescription>{error}</AlertDescription>
          <Button size="xs" ml={3} onClick={refetch} colorScheme="red" variant="outline">Retry</Button>
        </Alert>
      )}

      {/* Table */}
      <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">

        {/* Toolbar */}
        <Flex px={5} py={4} justify="space-between" align="center"
          borderBottom="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
          <Text fontWeight="700" fontSize="sm" color="gray.800">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            <Box position="relative">
              <Icon as={MdSearch} position="absolute" left={2} top="50%"
                transform="translateY(-50%)" color="gray.300" boxSize={4} pointerEvents="none" />
              <Input pl={8} size="sm" borderRadius="lg" bg="gray.50" w="180px"
                placeholder="Search name or reg…"
                value={search} onChange={e => setSearch(e.target.value)}
                _focus={{ bg: 'white', borderColor: 'brand.400' }} />
            </Box>
            <Select size="sm" w="140px" borderRadius="lg" bg="gray.50"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              _focus={{ bg: 'white', borderColor: 'brand.400' }}>
              <option value="">All status</option>
              <option value="Placed">Placed</option>
              <option value="Evaluating">Evaluating</option>
              <option value="Completed">Completed</option>
            </Select>
          </HStack>
        </Flex>

        <Box overflowX="auto">
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr bg="gray.50">
                {['Student', 'Department', 'Attendance', 'Status', 'Last Evaluation', 'Action'].map(h => (
                  <Th key={h} px={4} py={3} fontSize="10px" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" fontWeight="600">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {loading
                ? <LoadingRows cols={6} />
                : filtered.length > 0
                  ? filtered.map(s => (
                      <Tr key={s.id} _hover={{ bg: 'gray.50' }} transition="background 0.1s"
                        borderBottom="1px solid" borderColor="gray.50">
                        <Td py={3} px={4}>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={s.name} bg="brand.600" color="white" fontSize="xs" />
                            <Box>
                              <Text fontSize="sm" fontWeight="600" color="gray.800">{s.name}</Text>
                              <Text fontSize="11px" color="gray.400" fontFamily="mono">{s.registration_number}</Text>
                            </Box>
                          </HStack>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="sm" color="gray.600">{s.department || '—'}</Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Box w="80px">
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="10px" color="gray.500">{s.attendance_pct ?? '—'}%</Text>
                            </Flex>
                            <Progress value={s.attendance_pct ?? 0} size="xs" borderRadius="full" bg="gray.100"
                              colorScheme={s.attendance_pct >= 80 ? 'green' : s.attendance_pct >= 60 ? 'orange' : 'red'} />
                          </Box>
                        </Td>
                        <Td py={3} px={4}>
                          <Badge
                            colorScheme={
                              s.status === 'Placed'     ? 'green'  :
                              s.status === 'Evaluating' ? 'blue'   :
                              s.status === 'Completed'  ? 'purple' : 'orange'
                            }
                            borderRadius="full" px={2} fontSize="10px">{s.status || 'Pending'}
                          </Badge>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="xs" color={s.last_evaluation ? 'gray.600' : 'gray.300'}>
                            {s.last_evaluation || 'Not yet'}
                          </Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Button size="xs" variant="outline" borderRadius="lg" fontSize="10px"
                            colorScheme="brand" onClick={() => handleView(s)}>
                            View
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  : (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={10} color="gray.400" fontSize="sm">
                        {search || statusFilter ? 'No students match your filters.' : 'No students assigned yet.'}
                      </Td>
                    </Tr>
                  )
              }
            </Tbody>
          </Table>
        </Box>
      </Box>

      <StudentDrawer student={selected} isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}