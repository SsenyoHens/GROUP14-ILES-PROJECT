import { useState } from 'react'
import {
  Box, Flex, Grid, GridItem, Text, Heading, VStack, HStack,
  Badge, Avatar, Progress, Icon, Button, Table, Thead, Tbody,
  Tr, Th, Td, Select, Input, InputGroup, InputLeftElement,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Tabs, TabList, Tab, TabPanels, TabPanel, Tag, TagLabel,
  Divider, CircularProgress, CircularProgressLabel, useColorModeValue,
} from '@chakra-ui/react'
import {
  MdPeople, MdWork, MdAssignment, MdBarChart, MdSearch,
  MdNotifications, MdCheckCircle, MdSchedule, MdWarning,
  MdTrendingUp, MdBusiness, MdSchool, MdAdd, MdFilterList,
  MdOutlineCalendarMonth, MdOutlineLocationOn, MdMoreVert,
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

// ── Mock Data ────────────────────────────────────────────
const STATS = [
  { label: 'Total Students',     value: 248,  change: +12, icon: MdPeople,     color: 'brand',  sub: 'Active interns' },
  { label: 'Active Placements',  value: 183,  change: +8,  icon: MdWork,       color: 'blue',   sub: 'Across 64 orgs'  },
  { label: 'Pending Approvals',  value: 17,   change: -3,  icon: MdSchedule,   color: 'orange', sub: 'Needs attention'  },
  { label: 'Evaluations Due',    value: 34,   change: +5,  icon: MdAssignment, color: 'purple', sub: 'This week'        },
]

const RECENT_PLACEMENTS = [
  { student: 'Amara Nantongo',   reg: 'CS/2022/014', org: 'MTN Uganda',        dept: 'Software Eng.',  status: 'active',   supervisor: 'J. Mukasa',   start: 'Jan 2025' },
  { student: 'Brian Ssekitoleko', reg: 'IS/2022/031', org: 'Stanbic Bank',      dept: 'IT Systems',     status: 'active',   supervisor: 'P. Nalwoga',  start: 'Jan 2025' },
  { student: 'Christine Atim',   reg: 'CE/2021/009', org: 'NITA-U',            dept: 'Cybersecurity',  status: 'pending',  supervisor: 'Unassigned',  start: 'Feb 2025' },
  { student: 'David Okello',     reg: 'CS/2022/047', org: 'Airtel Uganda',      dept: 'Networks',       status: 'active',   supervisor: 'R. Ssali',    start: 'Jan 2025' },
  { student: 'Esther Namukasa',  reg: 'IT/2022/022', org: 'Cipla Quality Chem', dept: 'Data Systems',  status: 'review',   supervisor: 'A. Kigozi',   start: 'Dec 2024' },
  { student: 'Felix Tumusiime',  reg: 'CS/2021/088', org: 'Bank of Uganda',     dept: 'IT Audit',       status: 'complete', supervisor: 'B. Atuhaire', start: 'Aug 2024' },
]

const PENDING_ACTIONS = [
  { type: 'approval',    text: 'New student registration — Grace Achola (CS/2022/071)',      time: '2h ago',  urgency: 'high'   },
  { type: 'evaluation',  text: 'Mid-term evaluation overdue — David Okello at Airtel Uganda', time: '1d ago',  urgency: 'high'   },
  { type: 'placement',   text: 'Organisation request — Uganda Revenue Authority (3 slots)',   time: '3h ago',  urgency: 'medium' },
  { type: 'report',      text: 'Monthly placement report ready for review',                   time: '1d ago',  urgency: 'low'    },
  { type: 'approval',    text: 'Workplace supervisor account — Patrick Oryema (NWSC)',         time: '5h ago',  urgency: 'medium' },
]

const DEPARTMENTS = [
  { name: 'Computer Science',       placed: 68, total: 74, color: 'brand'  },
  { name: 'Information Systems',    placed: 45, total: 51, color: 'blue'   },
  { name: 'Computer Engineering',   placed: 38, total: 44, color: 'purple' },
  { name: 'Information Technology', placed: 32, total: 39, color: 'orange' },
]

// ── Helpers ──────────────────────────────────────────────
const STATUS_CONFIG = {
  active:   { color: 'green',  label: 'Active'   },
  pending:  { color: 'orange', label: 'Pending'  },
  review:   { color: 'blue',   label: 'In Review'},
  complete: { color: 'gray',   label: 'Complete' },
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

// ── Sub-components ───────────────────────────────────────
function StatCard({ stat }) {
  const isPositive = stat.change >= 0
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
            {stat.label}
          </Text>
          <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight={1}>
            {stat.value.toLocaleString()}
          </Text>
          <HStack spacing={1} mt={2}>
            <Icon
              as={MdTrendingUp}
              color={isPositive ? 'green.400' : 'red.400'}
              boxSize={3}
              transform={isPositive ? 'none' : 'scaleY(-1)'}
            />
            <Text fontSize="11px" color={isPositive ? 'green.500' : 'red.500'} fontWeight="600">
              {isPositive ? '+' : ''}{stat.change} this month
            </Text>
          </HStack>
        </Box>
        <Flex
          w="44px" h="44px" borderRadius="xl" align="center" justify="center"
          bg={`${stat.color}.50`}
        >
          <Icon as={stat.icon} boxSize={5} color={`${stat.color}.500`} />
        </Flex>
      </Flex>
      <Text fontSize="11px" color="gray.400" mt={3}>{stat.sub}</Text>
    </Box>
  )
}

function PlacementRow({ p, index }) {
  const cfg = STATUS_CONFIG[p.status]
  return (
    <Tr
      _hover={{ bg: 'gray.50' }}
      transition="background 0.1s"
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Td py={3} px={4}>
        <HStack spacing={3}>
          <Avatar size="sm" name={p.student} bg="brand.600" color="white" fontSize="xs" />
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.800">{p.student}</Text>
            <Text fontSize="11px" color="gray.400" fontFamily="mono">{p.reg}</Text>
          </Box>
        </HStack>
      </Td>
      <Td py={3} px={4}>
        <Text fontSize="sm" color="gray.700">{p.org}</Text>
        <Text fontSize="11px" color="gray.400">{p.dept}</Text>
      </Td>
      <Td py={3} px={4}>
        <Text fontSize="xs" color="gray.500">{p.supervisor}</Text>
      </Td>
      <Td py={3} px={4}>
        <Text fontSize="xs" color="gray.400">{p.start}</Text>
      </Td>
      <Td py={3} px={4}>
        <Badge colorScheme={cfg.color} borderRadius="full" px={2} fontSize="10px">
          {cfg.label}
        </Badge>
      </Td>
    </Tr>
  )
}

function ActionItem({ action }) {
  const urg = URGENCY_CONFIG[action.urgency]
  const TypeIcon = TYPE_ICON[action.type]
  return (
    <Flex
      gap={3} p={3} borderRadius="lg" align="flex-start"
      _hover={{ bg: 'gray.50' }} transition="background 0.1s" cursor="pointer"
    >
      <Box mt="2px">
        <Box w="7px" h="7px" borderRadius="full" bg={urg.dot} mt="6px" />
      </Box>
      <Box flex={1} minW={0}>
        <Text fontSize="xs" color="gray.700" lineHeight="1.5" noOfLines={2}>
          {action.text}
        </Text>
        <Text fontSize="10px" color="gray.400" mt={1}>{action.time}</Text>
      </Box>
      <Badge colorScheme={urg.color} fontSize="9px" borderRadius="full" px={2} flexShrink={0}>
        {action.urgency}
      </Badge>
    </Flex>
  )
}

function DeptBar({ dept }) {
  const pct = Math.round((dept.placed / dept.total) * 100)
  return (
    <Box>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs" color="gray.700" fontWeight="500">{dept.name}</Text>
        <Text fontSize="xs" color="gray.400">{dept.placed}/{dept.total}</Text>
      </Flex>
      <Progress
        value={pct} size="sm" colorScheme={dept.color}
        borderRadius="full" bg="gray.100"
      />
      <Text fontSize="10px" color="gray.400" mt={1}>{pct}% placed</Text>
    </Box>
  )
}

// ── Main Dashboard ───────────────────────────────────────
function AdminDashboard() {
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = RECENT_PLACEMENTS.filter(p => {
    const matchSearch = !search ||
      p.student.toLowerCase().includes(search.toLowerCase()) ||
      p.org.toLowerCase().includes(search.toLowerCase()) ||
      p.reg.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const overallPlaced = DEPARTMENTS.reduce((s, d) => s + d.placed, 0)
  const overallTotal  = DEPARTMENTS.reduce((s, d) => s + d.total, 0)
  const overallPct    = Math.round((overallPlaced / overallTotal) * 100)

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
            {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </Box>
        <HStack spacing={3}>
          <Box position="relative">
            <Icon as={MdNotifications} boxSize={5} color="gray.400" cursor="pointer"
              _hover={{ color: 'gray.600' }} />
            <Box
              position="absolute" top="-2px" right="-2px"
              w="8px" h="8px" bg="red.400" borderRadius="full"
              border="1.5px solid white"
            />
          </Box>
          <Avatar
            size="sm" name={user?.name || 'Admin'} bg="brand.600"
            color="white" cursor="pointer"
          />
        </HStack>
      </Flex>

      {/* ── Body ── */}
      <Box px={{ base: 4, md: 6 }} py={6} maxW="1400px" mx="auto">

        {/* ── Stat cards ── */}
        <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4} mb={6}>
          {STATS.map(s => <StatCard key={s.label} stat={s} />)}
        </Grid>

        {/* ── Main grid ── */}
        <Grid templateColumns={{ base: '1fr', xl: '1fr 340px' }} gap={5}>

          {/* ── Left: placements table ── */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">

            <Flex px={5} py={4} justify="space-between" align="center"
              borderBottom="1px solid" borderColor="gray.100">
              <Box>
                <Text fontWeight="700" fontSize="sm" color="gray.800">Recent Placements</Text>
                <Text fontSize="11px" color="gray.400">{filtered.length} records shown</Text>
              </Box>
              <HStack spacing={2}>
                <InputGroup size="sm" w="180px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.300" boxSize={4} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search..." borderRadius="lg" bg="gray.50"
                    value={search} onChange={e => setSearch(e.target.value)}
                    _focus={{ bg: 'white', borderColor: 'brand.400' }}
                  />
                </InputGroup>
                <Select
                  size="sm" w="120px" borderRadius="lg" bg="gray.50"
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
                  {filtered.map((p, i) => <PlacementRow key={p.reg} p={p} index={i} />)}
                  {filtered.length === 0 && (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={10} color="gray.400" fontSize="sm">
                        No placements match your search.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

            <Flex px={5} py={3} justify="flex-end" borderTop="1px solid" borderColor="gray.100">
              <Button size="xs" variant="ghost" color="brand.600" fontSize="xs"
                _hover={{ bg: 'brand.50' }}>
                View all placements →
              </Button>
            </Flex>
          </Box>

          {/* ── Right column ── */}
          <VStack spacing={5} align="stretch">

            {/* Placement overview donut */}
            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 3px rgba(0,0,0,0.04)" p={5}>
              <Text fontWeight="700" fontSize="sm" color="gray.800" mb={4}>Placement Overview</Text>
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
                {DEPARTMENTS.map(d => <DeptBar key={d.name} dept={d} />)}
              </VStack>
            </Box>

            {/* Pending actions */}
            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
              <Flex px={5} py={4} justify="space-between" align="center"
                borderBottom="1px solid" borderColor="gray.100">
                <Box>
                  <Text fontWeight="700" fontSize="sm" color="gray.800">Pending Actions</Text>
                  <Text fontSize="11px" color="gray.400">{PENDING_ACTIONS.length} items need attention</Text>
                </Box>
                <Badge colorScheme="red" borderRadius="full" px={2} fontSize="10px">
                  {PENDING_ACTIONS.filter(a => a.urgency === 'high').length} urgent
                </Badge>
              </Flex>
              <VStack spacing={0} align="stretch" divider={<Divider />} px={2} py={2}>
                {PENDING_ACTIONS.map((a, i) => <ActionItem key={i} action={a} />)}
              </VStack>
              <Flex px={5} py={3} justify="flex-end" borderTop="1px solid" borderColor="gray.100">
                <Button size="xs" variant="ghost" color="brand.600" fontSize="xs"
                  _hover={{ bg: 'brand.50' }}>
                  View all →
                </Button>
              </Flex>
            </Box>

          </VStack>
        </Grid>

        {/* ── Quick actions bar ── */}
        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mt={5}>
          {[
            { label: 'Register Student',    icon: MdSchool,   color: 'brand'  },
            { label: 'Add Organisation',    icon: MdBusiness, color: 'blue'   },
            { label: 'Assign Supervisor',   icon: MdPeople,   color: 'purple' },
            { label: 'Generate Report',     icon: MdBarChart, color: 'orange' },
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

export default AdminDashboard