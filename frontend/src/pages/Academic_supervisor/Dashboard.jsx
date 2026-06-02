import { useState, useEffect, useCallback } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack,
  Badge, Avatar, Progress, Icon, Button,
  Table, Thead, Tbody, Tr, Th, Td,
  Select, Input, InputGroup, InputLeftElement,
  CircularProgress, CircularProgressLabel,
  Spinner, Alert, AlertIcon, AlertDescription,
} from '@chakra-ui/react'
import {
  MdPeople, MdWork, MdAssignment, MdBarChart,
  MdSearch, MdSchedule, MdBusiness, MdBook,
} from 'react-icons/md'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axiosInstance'

const STATUS_CONFIG = {
  active:    { color: 'green',  label: 'Active'   },
  pending:   { color: 'orange', label: 'Pending'  },
  completed: { color: 'purple', label: 'Complete' },
  rejected:  { color: 'red',    label: 'Rejected' },
}

function useFetch(endpoint) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.get(endpoint)
      setData(res.data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error  ||
        err.message || 'Failed to load'
      )
    } finally {
      setLoading(false)
    }
  }, [endpoint])
  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

function ErrorBanner({ message, onRetry }) {
  return (
    <Alert status="error" borderRadius="lg" fontSize="sm" mb={3}>
      <AlertIcon />
      <AlertDescription flex={1}>{message}</AlertDescription>
      {onRetry && (
        <Button size="xs" ml={3} onClick={onRetry} colorScheme="red" variant="outline">
          Retry
        </Button>
      )}
    </Alert>
  )
}

function LoadingRows({ cols = 4 }) {
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

function StatCard({ label, value, icon, color, sub, loading }) {
  return (
    <Box
      bg="white" borderRadius="2xl" p={5}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
      _hover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="11px" color="gray.400" textTransform="uppercase"
            letterSpacing="wider" mb={1}>{label}</Text>
          {loading
            ? <Box h="28px" w="60px" bg="gray.100" borderRadius="md" mt={1} />
            : <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight={1}>
                {value ?? '—'}
              </Text>
          }
        </Box>
        <Flex w="44px" h="44px" borderRadius="xl" align="center" justify="center"
          bg={`${color}.50`}>
          <Icon as={icon} boxSize={5} color={`${color}.500`} />
        </Flex>
      </Flex>
      <Text fontSize="11px" color="gray.400" mt={3}>{sub}</Text>
    </Box>
  )
}

function PlacementRow({ p }) {
  const cfg  = STATUS_CONFIG[p.status] || { color: 'gray', label: p.status }
  const name = p.student_name || p.student_email || `Student #${p.student}`

  return (
    <Tr _hover={{ bg: 'gray.50' }} transition="background 0.1s"
      borderBottom="1px solid" borderColor="gray.100">
      <Td py={3} px={4}>
        <HStack spacing={3}>
          <Avatar size="sm" name={name} bg="brand.600" color="white" fontSize="xs" />
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.800">{name}</Text>
            {p.student_email && (
              <Text fontSize="11px" color="gray.400">{p.student_email}</Text>
            )}
          </Box>
        </HStack>
      </Td>
      <Td py={3} px={4}>
        <Text fontSize="sm" color="gray.700">{p.company_name || '—'}</Text>
        <Text fontSize="11px" color="gray.400">{p.position || ''}</Text>
      </Td>
      <Td py={3} px={4}>
        <Text fontSize="xs" color="gray.500">{p.start_date || '—'}</Text>
      </Td>
      <Td py={3} px={4}>
        <Badge colorScheme={cfg.color} borderRadius="full" px={2} fontSize="10px">
          {cfg.label}
        </Badge>
      </Td>
    </Tr>
  )
}

const DEPT_COLORS = ['brand', 'blue', 'purple', 'orange', 'teal', 'pink']

function DeptBar({ dept, index }) {
  const total  = dept.total_students   ?? 0
  const placed = dept.total_placements ?? dept.active_placements ?? 0
  const pct    = total > 0 ? Math.min(100, Math.round((placed / total) * 100)) : 0
  const color  = DEPT_COLORS[index % DEPT_COLORS.length]

  return (
    <Box>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs" color="gray.700" fontWeight="500">
          {dept.department || 'Unassigned'}
        </Text>
        <Text fontSize="xs" color="gray.400">{placed}/{total}</Text>
      </Flex>
      <Progress value={pct} size="sm" colorScheme={color} borderRadius="full" bg="gray.100" />
      <Text fontSize="10px" color="gray.400" mt={1}>{pct}% placed</Text>
    </Box>
  )
}

export default function AcademicDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const stats       = useFetch('/dashboard/stats/')
  const placements  = useFetch('/placements/')
  const departments = useFetch('/reports/by-department/')
  const logs        = useFetch('/logs/')
  const evaluations = useFetch('/evaluations/')

  const statsData     = stats.data ?? {}
  const placementList = Array.isArray(placements.data)  ? placements.data  : []
  const deptList      = Array.isArray(departments.data) ? departments.data : []
  const logList       = Array.isArray(logs.data)        ? logs.data        : []
  const evalList      = Array.isArray(evaluations.data) ? evaluations.data : []

  const filtered = placementList.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      p.student_name?.toLowerCase().includes(q)  ||
      p.student_email?.toLowerCase().includes(q) ||
      p.company_name?.toLowerCase().includes(q)  ||
      p.position?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const overallPlaced = deptList.reduce((s, d) => s + (d.total_placements ?? d.active_placements ?? 0), 0)
  const overallTotal  = deptList.reduce((s, d) => s + (d.total_students ?? 0), 0)
  const overallPct    = overallTotal > 0 ? Math.min(100, Math.round((overallPlaced / overallTotal) * 100)) : 0

  // ✅ Live fallbacks when stats 500s
  const liveStats = {
    total_students:    statsData.total_students    ?? placementList.length,
    active_placements: statsData.active_placements ?? placementList.filter(p => p.status === 'active').length,
    pending_logs:      statsData.pending_logs      ?? logList.filter(l => l.status === 'submitted').length,
    total_evaluations: statsData.total_evaluations ?? evalList.length,
  }

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Academic Supervisor'
    : 'Academic Supervisor'

  const pendingLogs = logList.filter(l => l.status === 'submitted').slice(0, 5)

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="xl" fontWeight="800" color="gray.800">
          Welcome back, {displayName.split(' ')[0]} 👋
        </Text>
        <Text fontSize="sm" color="gray.400">Academic Supervisor Dashboard</Text>
      </Box>

      {stats.error && <ErrorBanner message={stats.error} onRetry={stats.refetch} />}
      {placements.error && <ErrorBanner message={placements.error} onRetry={placements.refetch} />}

      {/* Stat cards */}
      <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4} mb={6}>
        {[
          { label: 'My Students',       key: 'total_students',    icon: MdPeople,     color: 'brand',  sub: 'Assigned interns'   },
          { label: 'Active Placements', key: 'active_placements', icon: MdWork,       color: 'blue',   sub: 'Currently active'   },
          { label: 'Pending Logs',      key: 'pending_logs',      icon: MdSchedule,   color: 'orange', sub: 'Awaiting review'    },
          { label: 'Evaluations',       key: 'total_evaluations', icon: MdAssignment, color: 'purple', sub: 'Total submitted'    },
        ].map(s => (
          <StatCard key={s.key} label={s.label} value={liveStats[s.key]}
            icon={s.icon} color={s.color} sub={s.sub} loading={stats.loading} />
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '1fr 340px' }} gap={5}>

        {/* Placements table */}
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
          <Flex px={5} py={4} justify="space-between" align="center"
            borderBottom="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
            <Box>
              <Text fontWeight="700" fontSize="sm" color="gray.800">Student Placements</Text>
              <Text fontSize="11px" color="gray.400">
                {placements.loading ? 'Loading…' : `${filtered.length} records`}
              </Text>
            </Box>
            <HStack spacing={2} flexWrap="wrap">
              <InputGroup size="sm" w="180px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdSearch} color="gray.300" boxSize={4} />
                </InputLeftElement>
                <Input placeholder="Search…" borderRadius="lg" bg="gray.50"
                  value={search} onChange={e => setSearch(e.target.value)}
                  _focus={{ bg: 'white', borderColor: 'brand.400' }} />
              </InputGroup>
              <Select size="sm" w="130px" borderRadius="lg" bg="gray.50"
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </Select>
            </HStack>
          </Flex>

          <Box overflowX="auto">
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr bg="gray.50">
                  {['Student', 'Organisation', 'Start Date', 'Status'].map(h => (
                    <Th key={h} px={4} py={3} fontSize="10px" color="gray.400"
                      textTransform="uppercase" letterSpacing="wider" fontWeight="600">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {placements.loading
                  ? <LoadingRows cols={4} />
                  : filtered.length > 0
                    ? filtered.map(p => <PlacementRow key={p.id} p={p} />)
                    : (
                      <Tr>
                        <Td colSpan={4} textAlign="center" py={10} color="gray.400" fontSize="sm">
                          {search || statusFilter ? 'No placements match your filters.' : 'No placements found.'}
                        </Td>
                      </Tr>
                    )
                }
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Right column */}
        <VStack spacing={5} align="stretch">

          {/* Dept breakdown */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" p={5}>
            <Text fontWeight="700" fontSize="sm" color="gray.800" mb={4}>By Department</Text>
            {departments.error && (
              <ErrorBanner message={departments.error} onRetry={departments.refetch} />
            )}
            {departments.loading
              ? <Flex justify="center" py={6}><Spinner size="md" color="brand.500" /></Flex>
              : (
                <>
                  <Flex align="center" justify="center" gap={6} mb={5}>
                    <CircularProgress value={overallPct} size="80px" thickness="8px"
                      color="brand.500" trackColor="gray.100">
                      <CircularProgressLabel fontSize="md" fontWeight="800" color="gray.800">
                        {overallPct}%
                      </CircularProgressLabel>
                    </CircularProgress>
                    <Box>
                      <Text fontSize="xl" fontWeight="800" color="gray.800">{overallPlaced}</Text>
                      <Text fontSize="11px" color="gray.400">of {overallTotal} placed</Text>
                    </Box>
                  </Flex>
                  <VStack spacing={3} align="stretch">
                    {deptList.length > 0
                      ? deptList.map((d, i) => <DeptBar key={d.department ?? i} dept={d} index={i} />)
                      : <Text fontSize="xs" color="gray.400" textAlign="center">No department data.</Text>
                    }
                  </VStack>
                </>
              )
            }
          </Box>

          {/* Pending logs */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
            <Flex px={5} py={4} justify="space-between" align="center"
              borderBottom="1px solid" borderColor="gray.100">
              <Box>
                <Text fontWeight="700" fontSize="sm" color="gray.800">Pending Log Reviews</Text>
                <Text fontSize="11px" color="gray.400">
                  {logs.loading ? 'Loading…' : `${pendingLogs.length} awaiting review`}
                </Text>
              </Box>
              {pendingLogs.length > 0 && (
                <Badge colorScheme="orange" borderRadius="full" px={2} fontSize="10px">
                  {pendingLogs.length} new
                </Badge>
              )}
            </Flex>
            {logs.loading
              ? <Flex justify="center" py={6}><Spinner size="sm" color="brand.500" /></Flex>
              : pendingLogs.length > 0
                ? pendingLogs.map((log, i) => (
                    <Flex key={log.id ?? i} align="flex-start" gap={3} p={3}
                      _hover={{ bg: 'gray.50' }}
                      borderBottom="1px solid" borderColor="gray.50">
                      <Avatar size="xs" name={log.student_email} bg="brand.500" color="white" />
                      <Box flex={1} minW={0}>
                        <Text fontSize="xs" fontWeight="600" color="gray.700">
                          Week {log.week_number}
                        </Text>
                        <Text fontSize="10px" color="gray.400" noOfLines={1}>
                          {log.student_email}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={2} mt={0.5}>
                          {log.activities_done}
                        </Text>
                      </Box>
                      <Badge colorScheme="orange" borderRadius="full" fontSize="9px" flexShrink={0} mt={0.5}>
                        Pending
                      </Badge>
                    </Flex>
                  ))
                : (
                  <Flex direction="column" align="center" py={8} gap={2}>
                    <Icon as={MdBook} boxSize={8} color="gray.200" />
                    <Text fontSize="sm" color="gray.400">No pending logs.</Text>
                  </Flex>
                )
            }
          </Box>
        </VStack>
      </Grid>

      {/* Quick actions */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mt={5}>
        {[
          { label: 'Students',    icon: MdPeople,     color: 'brand',  path: '/academic/students'    },
          { label: 'Placements',  icon: MdBusiness,   color: 'blue',   path: '/academic/placements'  },
          { label: 'Evaluations', icon: MdAssignment, color: 'purple', path: '/academic/evaluations' },
          { label: 'Reports',     icon: MdBarChart,   color: 'orange', path: '/academic/reports'     },
        ].map(action => (
          <Button key={action.label} leftIcon={<Icon as={action.icon} />}
            variant="outline" borderColor="gray.200" bg="white" color="gray.700"
            borderRadius="xl" size="md" fontSize="sm" fontWeight="500" py={6}
            onClick={() => navigate(action.path)}
            _hover={{ bg: `${action.color}.50`, borderColor: `${action.color}.300`, color: `${action.color}.600` }}
            transition="all 0.15s">
            {action.label}
          </Button>
        ))}
      </Grid>
    </Box>
  )
}