import { useState, useEffect, useCallback } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Button, Spinner, Select, Input,
  Alert, AlertIcon, AlertDescription,
} from '@chakra-ui/react'
import {
  MdNotifications, MdCheckCircle, MdSchedule,
  MdWarning, MdBook, MdPerson, MdWork,
  MdStar, MdAssignment,
} from 'react-icons/md'
import api from '../api/axiosInstance'

const ICON_MAP = {
  check:      { icon: MdCheckCircle, color: 'green'  },
  warning:    { icon: MdWarning,     color: 'red'    },
  book:       { icon: MdBook,        color: 'orange' },
  person:     { icon: MdPerson,      color: 'brand'  },
  work:       { icon: MdWork,        color: 'blue'   },
  star:       { icon: MdStar,        color: 'purple' },
  assignment: { icon: MdAssignment,  color: 'purple' },
  schedule:   { icon: MdSchedule,    color: 'orange' },
}

const TYPE_LABELS = {
  log_approved:         'Log Approved',
  log_rejected:         'Log Rejected',
  log_submitted:        'Log Review',
  new_evaluation:       'Evaluation',
  evaluation_submitted: 'Evaluation',
  placement_active:     'Placement',
  placement_pending:    'Placement',
  placement_rejected:   'Placement',
  student_assigned:     'Assignment',
  new_student:          'New User',
  new_supervisor:       'New User',
  reminder:             'Reminder',
}

function timeAgo(isoString) {
  if (!isoString) return ''
  const now  = new Date()
  const then = new Date(isoString)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return then.toLocaleDateString()
}

function NotificationCard({ n }) {
  const cfg   = ICON_MAP[n.icon] || ICON_MAP.schedule
  const color = n.color || cfg.color

  return (
    <Flex gap={4} p={4} borderRadius="xl"
      bg={n.read ? 'white' : `${color}.50`}
      border="1px solid"
      borderColor={n.read ? 'gray.100' : `${color}.200`}
      boxShadow={n.read
        ? '0 1px 3px rgba(0,0,0,0.04)'
        : '0 2px 8px rgba(0,0,0,0.06)'}
      _hover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      transition="all 0.15s">

      <Flex w="44px" h="44px" borderRadius="xl" flexShrink={0}
        bg={`${color}.100`} align="center" justify="center">
        <Icon as={cfg.icon} color={`${color}.600`} boxSize={5} />
      </Flex>

      <Box flex={1} minW={0}>
        <Flex justify="space-between" align="flex-start" gap={2}>
          <Box flex={1}>
            <HStack spacing={2} mb={0.5} flexWrap="wrap">
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                {n.title}
              </Text>
              {!n.read && (
                <Badge colorScheme={color} borderRadius="full"
                  fontSize="8px" px={2} py={0.5}>
                  New
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.600" lineHeight="1.6">
              {n.message}
            </Text>
          </Box>
          <Box textAlign="right" flexShrink={0}>
            <Text fontSize="10px" color="gray.400" whiteSpace="nowrap">
              {timeAgo(n.time)}
            </Text>
            <Badge mt={1} colorScheme="gray" borderRadius="full"
              fontSize="9px" px={2} variant="outline">
              {TYPE_LABELS[n.type] || n.type}
            </Badge>
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}

export default function NotificationsPage() {
  const [data,       setData]       = useState({ notifications: [], unread_count: 0 })
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [search,     setSearch]     = useState('')

  const fetchNotifications = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/notifications/')
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const notifications = data.notifications ?? []
  const unread        = data.unread_count  ?? 0

  const filtered = notifications.filter(n => {
    const matchType   = !typeFilter || n.type === typeFilter
    const matchSearch = !search ||
      n.title?.toLowerCase().includes(search.toLowerCase())   ||
      n.message?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const types = [...new Set(notifications.map(n => n.type))]

  return (
    <Box maxW="760px" mx="auto" py={6} px={{ base: 4, md: 6 }}>

      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <HStack spacing={3} mb={1}>
            <Text fontSize="xl" fontWeight="800" color="gray.800">
              Notifications
            </Text>
            {unread > 0 && (
              <Badge colorScheme="red" borderRadius="full" px={3} fontSize="sm">
                {unread} new
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.400">
            {loading
              ? 'Loading…'
              : `${filtered.length} notification${filtered.length !== 1 ? 's' : ''}`}
          </Text>
        </Box>
        <Button size="sm" variant="outline" borderRadius="lg"
          onClick={fetchNotifications} isLoading={loading}>
          Refresh
        </Button>
      </Flex>

      {/* Summary stats */}
      {!loading && notifications.length > 0 && (
        <Grid templateColumns="repeat(3, 1fr)" gap={3} mb={5}>
          {[
            { label: 'Total',   value: notifications.length,         color: 'gray'  },
            { label: 'Unread',  value: unread,                       color: 'red'   },
            { label: 'Read',    value: notifications.length - unread, color: 'green' },
          ].map(s => (
            <Box key={s.label} bg="white" borderRadius="xl" p={4}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 3px rgba(0,0,0,0.04)">
              <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                letterSpacing="wider">{s.label}</Text>
              <Text fontSize="2xl" fontWeight="800"
                color={`${s.color}.500`} mt={1}>{s.value}</Text>
            </Box>
          ))}
        </Grid>
      )}

      {/* Filters */}
      <HStack spacing={3} mb={5} flexWrap="wrap">
        <Input
          size="sm" borderRadius="lg" bg="white" maxW="220px"
          placeholder="Search notifications…"
          value={search} onChange={e => setSearch(e.target.value)}
          border="1px solid" borderColor="gray.200"
          _focus={{ borderColor: 'brand.400' }}
        />
        <Select size="sm" borderRadius="lg" bg="white" maxW="180px"
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          border="1px solid" borderColor="gray.200">
          <option value="">All types</option>
          {types.map(t => (
            <option key={t} value={t}>
              {TYPE_LABELS[t] || t}
            </option>
          ))}
        </Select>
      </HStack>

      {/* Error */}
      {error && (
        <Alert status="error" borderRadius="xl" mb={4}>
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* List */}
      {loading
        ? (
          <Flex justify="center" align="center" minH="300px">
            <Spinner size="lg" color="brand.500" />
          </Flex>
        )
        : filtered.length > 0
          ? (
            <VStack spacing={3} align="stretch">
              {filtered.map(n => (
                <NotificationCard key={n.id} n={n} />
              ))}
            </VStack>
          )
          : (
            <Flex direction="column" align="center" justify="center" minH="300px" gap={3}>
              <Icon as={MdNotifications} boxSize={16} color="gray.200" />
              <Text color="gray.400" fontWeight="600" textAlign="center">
                {search || typeFilter
                  ? 'No notifications match your filters.'
                  : 'No notifications yet.'}
              </Text>
              <Text color="gray.300" fontSize="sm" textAlign="center">
                Notifications appear here when there's activity related to your account.
              </Text>
            </Flex>
          )
      }
    </Box>
  )
}