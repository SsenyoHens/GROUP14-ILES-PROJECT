import { useState, useEffect, useCallback } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack,
  Badge, Avatar, Progress, Icon, Button, Table, Thead, Tbody,
  Tr, Th, Td, Select, Input, InputGroup, InputLeftElement,
  CircularProgress, CircularProgressLabel, Divider, Spinner,
  Alert, AlertIcon, AlertDescription,
} from '@chakra-ui/react'
import {
  MdPeople, MdWork, MdAssignment, MdBarChart, MdSearch,
  MdNotifications, MdCheckCircle, MdSchedule,
  MdTrendingUp, MdBusiness, MdSchool, MdAdd,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'

// ── Status / urgency config (display only) ───────────────
const STATUS_CONFIG = {
  active:   { color: 'green',  label: 'Active'    },
  pending:  { color: 'orange', label: 'Pending'   },
  review:   { color: 'blue',   label: 'In Review' },
  complete: { color: 'gray',   label: 'Complete'  },
}

const URGENCY_CONFIG = {
  high:   { color: 'red',    dot: '#FC8181' },
  medium: { color: 'orange', dot: '#F6AD55' },
  low:    { color: 'gray',   dot: '#CBD5E0' },
}

const TYPE_ICON = {
  approval:   MdCheckCircle,
  evaluation: MdAssignment,
  placement:  MdWork,
  report:     MdBarChart,
}

// ── Generic fetch hook ────────────────────────────────────
function useFetch(endpoint) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(endpoint)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}

// ── Helpers ───────────────────────────────────────────────
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

function ErrorBanner({ message, onRetry }) {
  return (
    <Alert status="error" borderRadius="lg" fontSize="sm">
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

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, change, icon, color, sub, loading, error }) {
  const isPositive = Number(change) >= 0
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
          <Text fontSize="11px" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
            {label}
          </Text>
          {loading ? (
            <Box h="28px" w="60px" bg="gray.100" borderRadius="md" mt={1} />
          ) : error ? (
            <Text fontSize="sm" color="red.400">—</Text>
          ) : (
            <>
              <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight={1}>
                {Number(value ?? 0).toLocaleString()}
              </Text>
              {change !== undefined && (
                <HStack spacing={1} mt={2}>
                  <Icon
                    as={MdTrendingUp}
                    color={isPositive ? 'green.400' : 'red.400'}
                    boxSize={3}
                    transform={isPositive ? 'none' : 'scaleY(-1)'}
                  />
                  <Text fontSize="11px" color={isPositive ? 'green.500' : 'red.500'} fontWeight="600">
                    {isPositive ? '+' : ''}{change} this month
                  </Text>
                </HStack>
              )}
            </>
          )}
        </Box>
        <Flex w="44px" h="44px" borderRadius="xl" align="center" justify="center" bg={`${color}.50`}>
          <Icon as={icon} boxSize={5} color={`${color}.500`} />
        </Flex>
      </Flex>
      <Text fontSize="11px" color="gray.400" mt={3}>{sub}</Text>
    </Box>
  )
}

// ── Placement Row ─────────────────────────────────────────
function PlacementRow({ p }) {
  const cfg = STATUS_CONFIG[p.status] || { color: 'gray', label: p.status }
  return (
    <Tr _hover={{ bg: 'gray.50' }} transition="background 0.1s" borderBottom="1px solid" borderColor="gray.100">
      <Td py={3} px={4}>
        <HStack spacing={3}>
          <Avatar size="sm" name={p.student_name} bg="brand.600" color="white" fontSize="xs" />
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.800">{p.student_name}</Text>
            <Text fontSize="11px" color="gray.400" fontFamily="mono">{p.registration_number}</Text>
          </Box>
        </HStack>
      </Td>
      <Td py={3} px={4}>
        <Text fontSize="sm" color="gray.700">{p.organisation_name}</Text>
        <Text fontSize="11px" color="gray.400">{p.department}</Text>
      </Td>
      <Td py={3} px={4}>
        <Text fontSize="xs" color="gray.500">{p.supervisor_name || 'Unassigned'}</Text>
      </Td>
      <Td py={3} px={4}>
        <Text fontSize="xs" color="gray.400">{p.start_date}</Text>
      </Td>
      <Td py={3} px={4}>
        <Badge colorScheme={cfg.color} borderRadius="full" px={2} fontSize="10px">
          {cfg.label}
        </Badge>
      </Td>
    </Tr>
  )
}

// ── Action Item ───────────────────────────────────────────
function ActionItem({ action }) {
  const urg = URGENCY_CONFIG[action.urgency] || URGENCY_CONFIG.low
  const TypeIcon = TYPE_ICON[action.type] || MdNotifications
  return (
    <Flex gap={3} p={3} borderRadius="lg" align="flex-start"
      _hover={{ bg: 'gray.50' }} transition="background 0.1s" cursor="pointer">
      <Box mt="2px">
        <Box w="7px" h="7px" borderRadius="full" bg={urg.dot} mt="6px" />
      </Box>
      <Box flex={1} minW={0}>
        <Text fontSize="xs" color="gray.700" lineHeight="1.5" noOfLines={2}>{action.text}</Text>
        <Text fontSize="10px" color="gray.400" mt={1}>{action.time}</Text>
      </Box>
      <Badge colorScheme={urg.color} fontSize="9px" borderRadius="full" px={2} flexShrink={0}>
        {action.urgency}
      </Badge>
    </Flex>
  )
}

// ── Dept Bar ──────────────────────────────────────────────
const DEPT_COLORS = ['brand', 'blue', 'purple', 'orange', 'teal', 'pink']

function DeptBar({ dept, index }) {
  const pct = dept.total > 0 ? Math.round((dept.placed / dept.total) * 100) : 0
  const color = DEPT_COLORS[index % DEPT_COLORS.length]
  return (
    <Box>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs" color="gray.700" fontWeight="500">{dept.name}</Text>
        <Text fontSize="xs" color="gray.400">{dept.placed}/{dept.total}</Text>
      </Flex>
      <Progress value={pct} size="sm" colorScheme={color} borderRadius="full" bg="gray.100" />
      <Text fontSize="10px" color="gray.400" mt={1}>{pct}% placed</Text>
    </Box>
  )
}

// ── Main Component ────────────────────────────────────────
function AcademicDashboard() {
  const { user } = useAuth()
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // ── API calls ──────────────────────────────────────────
  // Expects: { total_students, active_placements, pending_approvals, evaluations_due,
  //            changes: { students, placements, approvals, evaluations } }
  const stats = useFetch('/dashboard/stats/')

  // Expects: array of placement objects (see PlacementRow for field names)
  const placements = useFetch('/placements/')

  // Expects: array of { name, placed, total }
  const departments = useFetch('/dashboard/departments/')

  // Expects: array of { type, text, time, urgency }
  const actions = useFetch('/dashboard/pending-actions/')

  // ── Derived values ─────────────────────────────────────
  const placementList = placements.data ?? []
  const deptList      = departments.data ?? []
  const actionList    = actions.data ?? []
  const statsData     = stats.data ?? {}

  const filtered = placementList.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      p.student_name?.toLowerCase().includes(q) ||
      p.organisation_name?.toLowerCase().includes(q) ||
      p.registration_number?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const overallPlaced = deptList.reduce((s, d) => s + (d.placed ?? 0), 0)
  const overallTotal  = deptList.reduce((s, d) => s + (d.total  ?? 0), 0)
  const overallPct    = overallTotal > 0 ? Math.round((overallPlaced / overallTotal) * 100) : 0

  const statCards = [
    {
      label: 'Total Students',    key: 'total_students',    changeKey: 'students',
      icon: MdPeople,   color: 'brand',  sub: 'Active interns',
    },
    {
      label: 'Active Placements', key: 'active_placements', changeKey: 'placements',
      icon: MdWork,     color: 'blue',   sub: 'Across organisations',
    },
    {
      label: 'Pending Approvals', key: 'pending_approvals', changeKey: 'approvals',
      icon: MdSchedule, color: 'orange', sub: 'Needs attention',
    },
    {
      label: 'Evaluations Due',   key: 'evaluations_due',   changeKey: 'evaluations',
      icon: MdAssignment, color: 'purple', sub: 'This week',
    },
  ]

  return (
    <Box minH="100vh" bg="gray.50">

      {/* ── Top bar ── */}
      <Flex
        h="64px" bg="white" px={6} align="center" justify="space-between"
        borderBottom="1px solid" borderColor="gray.100"
        position="sticky" top={0} zIndex={10}
        boxShadow="0 1px 3px rgba(0,0,0,0.04)"
      >
        <Box>
          <Text fontSize="16px" fontWeight="700" color="gray.800">
            Good morning, {user?.name?.split(' ')[0] || 'Administrator'} 👋
          </Text>
          <Text fontSize="11px" color="gray.400">
            {new Date().toLocaleDateString('en-UG', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
        </Box>
        <HStack spacing={3}>
          <Box position="relative">
            <Icon as={MdNotifications} boxSize={5} color="gray.400" cursor="pointer"
              _hover={{ color: 'gray.600' }} />
            {actionList.filter(a => a.urgency === 'high').length > 0 && (
              <Box
                position="absolute" top="-2px" right="-2px"
                w="8px" h="8px" bg="red.400" borderRadius="full"
                border="1.5px solid white"
              />
            )}
          </Box>
          <Avatar size="sm" name={user?.name || 'Admin'} bg="brand.600" color="white" cursor="pointer" />
        </HStack>
      </Flex>

      {/* ── Body ── */}
      <Box px={{ base: 4, md: 6 }} py={6} maxW="1400px" mx="auto">

        {/* ── Stats error ── */}
        {stats.error && (
          <ErrorBanner message={`Stats: ${stats.error}`} onRetry={stats.refetch} />
        )}

        {/* ── Stat cards ── */}
        <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4} mb={6}>
          {statCards.map(s => (
            <StatCard
              key={s.key}
              label={s.label}
              value={statsData[s.key]}
              change={statsData.changes?.[s.changeKey]}
              icon={s.icon}
              color={s.color}
              sub={s.sub}
              loading={stats.loading}
              error={stats.error}
            />
          ))}
        </Grid>

        {/* ── Main grid ── */}
        <Grid templateColumns={{ base: '1fr', xl: '1fr 340px' }} gap={5}>

          {/* ── Left: placements table ── */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">

            <Flex px={5} py={4} justify="space-between" align="center"
              borderBottom="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
              <Box>
                <Text fontWeight="700" fontSize="sm" color="gray.800">Recent Placements</Text>
                <Text fontSize="11px" color="gray.400">
                  {placements.loading ? 'Loading…' : `${filtered.length} records shown`}
                </Text>
              </Box>
              <HStack spacing={2} flexWrap="wrap">
                <InputGroup size="sm" w="180px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.300" boxSize={4} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search…" borderRadius="lg" bg="gray.50"
                    value={search} onChange={e => setSearch(e.target.value)}
                    _focus={{ bg: 'white', borderColor: 'brand.400' }}
                  />
                </InputGroup>
                <Select
                  size="sm" w="130px" borderRadius="lg" bg="gray.50"
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  _focus={{ bg: 'white', borderColor: 'brand.400' }}
                >
                  <option value="">All status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="review">In Review</option>
                  <option value="complete">Complete</option>
                </Select>
                <Button size="sm" leftIcon={<Icon as={MdAdd} />}
                  bg="brand.600" color="white" borderRadius="lg"
                  _hover={{ bg: 'brand.700' }} fontSize="xs">
                  New
                </Button>
              </HStack>
            </Flex>

            {placements.error && (
              <Box px={5} pt={4}>
                <ErrorBanner message={placements.error} onRetry={placements.refetch} />
              </Box>
            )}

            <Box overflowX="auto">
              <Table size="sm" variant="unstyled">
                <Thead>
                  <Tr bg="gray.50">
                    {['Student', 'Organisation', 'Supervisor', 'Start Date', 'Status'].map(h => (
                      <Th key={h} px={4} py={3} fontSize="10px" color="gray.400"
                        textTransform="uppercase" letterSpacing="wider" fontWeight="600">
                        {h}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {placements.loading
                    ? <LoadingRows cols={5} />
                    : filtered.length > 0
                      ? filtered.map(p => <PlacementRow key={p.id ?? p.registration_number} p={p} />)
                      : (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={10} color="gray.400" fontSize="sm">
                            {search || statusFilter ? 'No placements match your search.' : 'No placements found.'}
                          </Td>
                        </Tr>
                      )
                  }
                </Tbody>
              </Table>
            </Box>

            <Flex px={5} py={3} justify="flex-end" borderTop="1px solid" borderColor="gray.100">
              <Button size="xs" variant="ghost" color="brand.600" fontSize="xs" _hover={{ bg: 'brand.50' }}>
                View all placements →
              </Button>
            </Flex>
          </Box>

          {/* ── Right column ── */}
          <VStack spacing={5} align="stretch">

            {/* Placement overview */}
            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 3px rgba(0,0,0,0.04)" p={5}>
              <Text fontWeight="700" fontSize="sm" color="gray.800" mb={4}>Placement Overview</Text>

              {departments.error && (
                <ErrorBanner message={departments.error} onRetry={departments.refetch} />
              )}

              {departments.loading ? (
                <Flex justify="center" py={6}><Spinner size="md" color="brand.500" /></Flex>
              ) : (
                <>
                  <Flex align="center" justify="center" gap={6} mb={5}>
                    <CircularProgress
                      value={overallPct} size="90px" thickness="8px"
                      color="brand.500" trackColor="gray.100"
                    >
                      <CircularProgressLabel fontSize="lg" fontWeight="800" color="gray.800">
                        {overallPct}%
                      </CircularProgressLabel>
                    </CircularProgress>
                    <Box>
                      <Text fontSize="xl" fontWeight="800" color="gray.800">{overallPlaced}</Text>
                      <Text fontSize="11px" color="gray.400">of {overallTotal} placed</Text>
                      <Badge colorScheme="green" borderRadius="full" px={2} fontSize="10px" mt={1}>
                        On track
                      </Badge>
                    </Box>
                  </Flex>
                  <VStack spacing={3} align="stretch">
                    {deptList.map((d, i) => <DeptBar key={d.name} dept={d} index={i} />)}
                    {deptList.length === 0 && (
                      <Text fontSize="xs" color="gray.400" textAlign="center">No department data.</Text>
                    )}
                  </VStack>
                </>
              )}
            </Box>

            {/* Pending actions */}
            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
              <Flex px={5} py={4} justify="space-between" align="center"
                borderBottom="1px solid" borderColor="gray.100">
                <Box>
                  <Text fontWeight="700" fontSize="sm" color="gray.800">Pending Actions</Text>
                  <Text fontSize="11px" color="gray.400">
                    {actions.loading ? 'Loading…' : `${actionList.length} items need attention`}
                  </Text>
                </Box>
                {!actions.loading && (
                  <Badge colorScheme="red" borderRadius="full" px={2} fontSize="10px">
                    {actionList.filter(a => a.urgency === 'high').length} urgent
                  </Badge>
                )}
              </Flex>

              {actions.error && (
                <Box px={5} pt={4}>
                  <ErrorBanner message={actions.error} onRetry={actions.refetch} />
                </Box>
              )}

              {actions.loading ? (
                <Flex justify="center" py={6}><Spinner size="md" color="brand.500" /></Flex>
              ) : (
                <VStack spacing={0} align="stretch" divider={<Divider />} px={2} py={2}>
                  {actionList.length > 0
                    ? actionList.map((a, i) => <ActionItem key={i} action={a} />)
                    : <Text fontSize="xs" color="gray.400" textAlign="center" py={4}>No pending actions.</Text>
                  }
                </VStack>
              )}

              <Flex px={5} py={3} justify="flex-end" borderTop="1px solid" borderColor="gray.100">
                <Button size="xs" variant="ghost" color="brand.600" fontSize="xs" _hover={{ bg: 'brand.50' }}>
                  View all →
                </Button>
              </Flex>
            </Box>

          </VStack>
        </Grid>

        {/* ── Quick actions bar ── */}
        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mt={5}>
          {[
            { label: 'Register Student',  icon: MdSchool,   color: 'brand'  },
            { label: 'Add Organisation',  icon: MdBusiness, color: 'blue'   },
            { label: 'Assign Supervisor', icon: MdPeople,   color: 'purple' },
            { label: 'Generate Report',   icon: MdBarChart, color: 'orange' },
          ].map(action => (
            <Button
              key={action.label}
              leftIcon={<Icon as={action.icon} />}
              variant="outline"
              borderColor="gray.200"
              bg="white"
              color="gray.700"
              borderRadius="xl"
              size="md"
              fontSize="sm"
              fontWeight="500"
              py={6}
              _hover={{
                bg: `${action.color}.50`,
                borderColor: `${action.color}.300`,
                color: `${action.color}.600`,
              }}
              transition="all 0.15s"
            >
              {action.label}
            </Button>
          ))}
        </Grid>

      </Box>
    </Box>
  )
}

export default AcademicDashboard