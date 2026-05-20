import { useState, useCallback, useEffect } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Progress,
  Alert, AlertIcon, AlertDescription,
  Textarea, Input, FormLabel,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, useToast,
} from '@chakra-ui/react'
import {
  MdWork, MdAssignment, MdBook, MdPerson,
  MdCheckCircle, MdSchedule, MdTrendingUp,
  MdCalendarToday, MdAdd, MdStar, MdNotifications,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'

function useFetch(endpoint) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await api.get(endpoint); setData(res.data) }
    catch (err) { setError(err.response?.data?.detail || err.message) }
    finally { setLoading(false) }
  }, [endpoint])
  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

const STATUS_CONFIG = {
  active:    { color: 'green',  label: 'Active',    icon: MdCheckCircle   },
  pending:   { color: 'orange', label: 'Pending',   icon: MdSchedule      },
  review:    { color: 'blue',   label: 'In Review', icon: MdNotifications },
  completed: { color: 'purple', label: 'Complete',  icon: MdCheckCircle   },
}

const EVAL_STATUS = {
  submitted: { color: 'teal',   label: 'Submitted' },
  pending:   { color: 'orange', label: 'Pending'   },
  approved:  { color: 'green',  label: 'Approved'  },
  draft:     { color: 'gray',   label: 'Draft'     },
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

function StatMini({ label, value, icon, color, sub, loading }) {
  return (
    <Box bg="white" borderRadius="xl" p={4} border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)">
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
        <Flex w="32px" h="32px" borderRadius="lg" bg={`${color}.50`}
          align="center" justify="center">
          <Icon as={icon} color={`${color}.500`} boxSize={4} />
        </Flex>
      </Flex>
      {loading
        ? <Box h="24px" w="40px" bg="gray.100" borderRadius="md" />
        : <Text fontSize="xl" fontWeight="800" color="gray.800">{value ?? '—'}</Text>
      }
      {sub && <Text fontSize="10px" color="gray.400" mt={1}>{sub}</Text>}
    </Box>
  )
}

function LogbookModal({ isOpen, onClose, onSubmit }) {
  const [form,   setForm]   = useState({
    week_number: '', activities_done: '', challenges: '', skills_gained: '',
  })
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit(form)
      setForm({ week_number: '', activities_done: '', challenges: '', skills_gained: '' })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader fontSize="md" fontWeight="700" pb={1}>New Logbook Entry</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Week Number *</FormLabel>
              <Input type="number" size="sm" borderRadius="lg" bg="gray.50"
                placeholder="e.g. 1"
                value={form.week_number} onChange={set('week_number')} />
            </Box>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Activities Performed *</FormLabel>
              <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={3}
                placeholder="Describe what you did…"
                value={form.activities_done} onChange={set('activities_done')} />
            </Box>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Challenges Faced</FormLabel>
              <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={2}
                placeholder="Any difficulties?"
                value={form.challenges} onChange={set('challenges')} />
            </Box>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Skills Gained</FormLabel>
              <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={2}
                placeholder="What did you learn?"
                value={form.skills_gained} onChange={set('skills_gained')} />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose} borderRadius="lg">Cancel</Button>
          <Button size="sm" bg="brand.600" color="white" borderRadius="lg"
            _hover={{ bg: 'brand.700' }} isLoading={saving} onClick={handleSubmit}
            isDisabled={!form.week_number || !form.activities_done}>
            Save Entry
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function StudentDashboard() {
  const { user }  = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const stats     = useFetch('/dashboard/stats/')
  const placement = useFetch('/placements/')
  const logs      = useFetch('/logs/')
  const evals     = useFetch('/evaluations/')

  const statsData     = stats.data ?? {}
  const logList       = Array.isArray(logs.data)      ? logs.data      : []
  const evalList      = Array.isArray(evals.data)     ? evals.data     : []
  const placementList = Array.isArray(placement.data) ? placement.data : []

  // ✅ Student has one placement — take the first
  const p   = placementList[0] ?? null
  const cfg = p ? (STATUS_CONFIG[p.status] || STATUS_CONFIG.pending) : null

  // ✅ Safely extract supervisor names — backend now returns objects {id, name, email}
  const academicSupName  = typeof p?.academic_supervisor  === 'object'
    ? (p.academic_supervisor?.name  || p.academic_supervisor?.email  || '—')
    : (p?.academic_supervisor  ?? '—')

  const workplaceSupName = typeof p?.workplace_supervisor === 'object'
    ? (p.workplace_supervisor?.name || p.workplace_supervisor?.email || '—')
    : (p?.workplace_supervisor ?? '—')

  // ✅ Progress calculation
  const progress = p && p.start_date && p.end_date
    ? (() => {
        const start = new Date(p.start_date)
        const end   = new Date(p.end_date)
        const now   = new Date()
        const total = end - start
        const done  = now - start
        return Math.min(100, Math.max(0, Math.round((done / total) * 100)))
      })()
    : 0

  const daysRemaining = p?.end_date
    ? Math.max(0, Math.round((new Date(p.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null

  const handleLogEntry = async (form) => {
    try {
      await api.post('/logs/create/', form)
      toast({ title: 'Entry added', status: 'success', duration: 3000, isClosable: true })
      logs.refetch()
      stats.refetch()
    } catch (err) {
      toast({
        title: 'Failed', description: err.message,
        status: 'error', duration: 4000, isClosable: true,
      })
      throw err
    }
  }

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Student'
    : 'Student'

  return (
    <Box>
      {/* Welcome banner */}
      <Box bg="brand.600" bgGradient="linear(135deg, brand.600 0%, brand.800 100%)"
        borderRadius="2xl" p={5} mb={6} position="relative" overflow="hidden">
        <Box position="absolute" top="-20px" right="-20px" w="140px" h="140px"
          borderRadius="full" bg="whiteAlpha.100" />
        <Text color="white" fontWeight="700" fontSize="lg">
          Welcome back, {displayName.split(' ')[0]} 👋
        </Text>
        <Text color="brand.100" fontSize="sm" mt={1}>
          Your internship at a glance
        </Text>
      </Box>

      {/* Mini stats */}
      {stats.error && <ErrorBanner message={stats.error} onRetry={stats.refetch} />}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        {[
          {
            label: 'Logbook Entries',
            value: statsData.total_logs ?? logList.length,
            icon:  MdBook,       color: 'brand',  sub: 'All time',
          },
          {
            label: 'Evaluations',
            value: evalList.length,
            icon:  MdAssignment, color: 'purple', sub: 'Submitted',
          },
          {
            label: 'Pending Evals',
            value: evalList.filter(e => e.status === 'draft').length,
            icon:  MdSchedule,   color: 'orange', sub: 'Due soon',
          },
          {
            label: 'Submitted Logs',
            value: statsData.submitted_logs ?? logList.filter(l => l.status === 'submitted').length,
            icon:  MdTrendingUp, color: 'green',  sub: 'This period',
          },
        ].map(s => <StatMini key={s.label} {...s} loading={stats.loading && logs.loading} />)}
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '1fr 380px' }} gap={5}>
        <VStack spacing={5} align="stretch">

          {/* ── Placement card ── */}
          <Box>
            <Text fontWeight="700" fontSize="sm" color="gray.700" mb={3}>My Current Placement</Text>

            {placement.loading
              ? (
                <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="gray.100">
                  <Flex justify="center" py={6}><Spinner color="brand.500" /></Flex>
                </Box>
              )
              : placement.error
                ? <ErrorBanner message={placement.error} onRetry={placement.refetch} />
                : !p
                  ? (
                    <Box bg="white" borderRadius="2xl" p={5} border="1px solid"
                      borderColor="gray.100" textAlign="center">
                      <Icon as={MdWork} boxSize={10} color="gray.200" mb={2} />
                      <Text color="gray.400" fontSize="sm">No active placement found.</Text>
                      <Text color="gray.300" fontSize="xs" mt={1}>
                        Contact your coordinator to get placed.
                      </Text>
                    </Box>
                  )
                  : (
                    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
                      boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">

                      {/* Header */}
                      <Box bg="brand.600" px={5} py={4}>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text color="white" fontWeight="700" fontSize="md">
                              {p.company_name || '—'}
                            </Text>
                            <Text color="brand.100" fontSize="xs" mt={0.5}>
                              {p.position || ''}
                            </Text>
                          </Box>
                          {cfg && (
                            <Badge colorScheme={cfg.color} bg="whiteAlpha.200" color="white"
                              border="1px solid" borderColor="whiteAlpha.300"
                              borderRadius="full" px={3} py={1} fontSize="xs">
                              <HStack spacing={1}>
                                <Icon as={cfg.icon} boxSize={3} />
                                <Text>{cfg.label}</Text>
                              </HStack>
                            </Badge>
                          )}
                        </Flex>
                      </Box>

                      {/* Details */}
                      <Box px={5} py={4}>
                        <Grid templateColumns="1fr 1fr 1fr" gap={4} mb={4}>
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                              letterSpacing="wider">Academic Supervisor</Text>
                            {/* ✅ Fixed — extract .name from object */}
                            <Text fontSize="sm" fontWeight="600" color="gray.700" mt={1}>
                              {academicSupName}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                              letterSpacing="wider">Start Date</Text>
                            <Text fontSize="sm" fontWeight="600" color="gray.700" mt={1}>
                              {p.start_date ?? '—'}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                              letterSpacing="wider">End Date</Text>
                            <Text fontSize="sm" fontWeight="600" color="gray.700" mt={1}>
                              {p.end_date ?? '—'}
                            </Text>
                          </Box>
                        </Grid>

                        {/* Workplace supervisor row */}
                        <Box mb={4}>
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                            letterSpacing="wider">Workplace Supervisor</Text>
                          {/* ✅ Fixed — extract .name from object */}
                          <Text fontSize="sm" fontWeight="600" color="gray.700" mt={1}>
                            {workplaceSupName}
                          </Text>
                        </Box>

                        {/* Progress */}
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="xs" color="gray.500">Progress</Text>
                          <Text fontSize="xs" fontWeight="700" color="brand.600">{progress}%</Text>
                        </Flex>
                        <Progress value={progress} colorScheme="brand" borderRadius="full"
                          size="sm" bg="gray.100" />
                        <Text fontSize="10px" color="gray.400" mt={1}>
                          {daysRemaining !== null && daysRemaining > 0
                            ? `${daysRemaining} days remaining`
                            : daysRemaining === 0
                              ? 'Placement ends today'
                              : 'Placement complete'}
                        </Text>
                      </Box>
                    </Box>
                  )
            }
          </Box>

          {/* ── Logbook ── */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
            <Flex px={5} py={4} justify="space-between" align="center"
              borderBottom="1px solid" borderColor="gray.100">
              <Box>
                <Text fontWeight="700" fontSize="sm" color="gray.800">Recent Logbook Entries</Text>
                <Text fontSize="11px" color="gray.400">
                  {logs.loading ? 'Loading…' : `${logList.length} entries`}
                </Text>
              </Box>
              <Button size="sm" leftIcon={<Icon as={MdAdd} />} bg="brand.600" color="white"
                borderRadius="lg" _hover={{ bg: 'brand.700' }} fontSize="xs" onClick={onOpen}>
                Add Entry
              </Button>
            </Flex>

            {logs.error && (
              <Box px={5} pt={3}>
                <ErrorBanner message={logs.error} onRetry={logs.refetch} />
              </Box>
            )}

            {logs.loading
              ? <Flex justify="center" py={8}><Spinner color="brand.500" /></Flex>
              : logList.length > 0
                ? logList.slice(0, 5).map((e, i) => (
                    <Flex key={e.id ?? i} align="center" gap={3} px={4} py={3}
                      borderBottom="1px solid" borderColor="gray.50"
                      _last={{ border: 'none' }} _hover={{ bg: 'gray.50' }}>
                      <Icon as={MdCalendarToday} boxSize={3.5} color="brand.400" flexShrink={0} />
                      <Box flex={1} minW={0}>
                        <Text fontSize="xs" fontWeight="600" color="gray.700">
                          Week {e.week_number}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {e.activities_done}
                        </Text>
                      </Box>
                      <Badge
                        colorScheme={
                          e.status === 'approved'  ? 'green'  :
                          e.status === 'submitted' ? 'teal'   :
                          e.status === 'rejected'  ? 'red'    : 'orange'
                        }
                        borderRadius="full" fontSize="9px" px={2}>
                        {e.status}
                      </Badge>
                    </Flex>
                  ))
                : (
                  <Flex direction="column" align="center" py={10} gap={2}>
                    <Icon as={MdBook} boxSize={8} color="gray.200" />
                    <Text fontSize="sm" color="gray.400">No entries yet.</Text>
                    <Button size="xs" colorScheme="brand" variant="ghost" onClick={onOpen}>
                      Add first entry
                    </Button>
                  </Flex>
                )
            }
          </Box>
        </VStack>

        {/* ── Right column ── */}
        <VStack spacing={5} align="stretch">

          {/* Evaluations */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
            <Flex px={5} py={4} justify="space-between" align="center"
              borderBottom="1px solid" borderColor="gray.100">
              <Box>
                <Text fontWeight="700" fontSize="sm" color="gray.800">My Evaluations</Text>
                <Text fontSize="11px" color="gray.400">
                  {evals.loading ? 'Loading…' : `${evalList.length} total`}
                </Text>
              </Box>
              {evalList.filter(e => e.status === 'draft').length > 0 && (
                <Badge colorScheme="orange" borderRadius="full" px={2} fontSize="10px">
                  {evalList.filter(e => e.status === 'draft').length} pending
                </Badge>
              )}
            </Flex>

            {evals.loading
              ? <Flex justify="center" py={8}><Spinner color="brand.500" /></Flex>
              : evalList.length > 0
                ? evalList.map((e, i) => {
                    const ecfg = EVAL_STATUS[e.status] || { color: 'gray', label: e.status }
                    return (
                      <Flex key={e.id ?? i} align="center" gap={3} px={4} py={3}
                        borderBottom="1px solid" borderColor="gray.50"
                        _last={{ border: 'none' }} _hover={{ bg: 'gray.50' }}>
                        <Flex w="36px" h="36px" borderRadius="lg" bg={`${ecfg.color}.50`}
                          align="center" justify="center" flexShrink={0}>
                          <Icon as={MdAssignment} color={`${ecfg.color}.500`} boxSize={4} />
                        </Flex>
                        <Box flex={1} minW={0}>
                          <Text fontSize="sm" fontWeight="600" color="gray.700" noOfLines={1}>
                            Evaluation #{e.id}
                          </Text>
                          <Text fontSize="11px" color="gray.400">
                            {e.created_at
                              ? new Date(e.created_at).toLocaleDateString()
                              : ''}
                          </Text>
                        </Box>
                        <VStack spacing={1} align="flex-end">
                          <Badge colorScheme={ecfg.color} borderRadius="full"
                            fontSize="9px" px={2}>
                            {ecfg.label}
                          </Badge>
                          {e.total_score != null && (
                            <HStack spacing={1}>
                              <Icon as={MdStar} boxSize={3} color="orange.300" />
                              <Text fontSize="10px" color="gray.500" fontWeight="600">
                                {e.total_score}/100
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Flex>
                    )
                  })
                : (
                  <Flex direction="column" align="center" py={8} gap={2}>
                    <Icon as={MdAssignment} boxSize={8} color="gray.200" />
                    <Text fontSize="sm" color="gray.400">No evaluations yet.</Text>
                  </Flex>
                )
            }
          </Box>

          {/* Quick actions */}
          <Grid templateColumns="1fr 1fr" gap={3}>
            {[
              { label: 'My Profile',   icon: MdPerson,     color: 'brand'  },
              { label: 'My Placement', icon: MdWork,       color: 'purple' },
              { label: 'Logbook',      icon: MdBook,       color: 'blue'   },
              { label: 'Evaluations',  icon: MdAssignment, color: 'orange' },
            ].map(a => (
              <Button key={a.label} leftIcon={<Icon as={a.icon} />}
                variant="outline" borderColor="gray.200" bg="white" color="gray.600"
                borderRadius="xl" size="sm" fontSize="xs" fontWeight="500" py={5}
                _hover={{
                  bg: `${a.color}.50`,
                  borderColor: `${a.color}.300`,
                  color: `${a.color}.600`,
                }}
                transition="all 0.15s">
                {a.label}
              </Button>
            ))}
          </Grid>
        </VStack>
      </Grid>

      <LogbookModal isOpen={isOpen} onClose={onClose} onSubmit={handleLogEntry} />
    </Box>
  )
}