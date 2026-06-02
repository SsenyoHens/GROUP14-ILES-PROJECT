import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Progress,
  Alert, AlertIcon, AlertDescription,
} from '@chakra-ui/react'
import {
  MdWork, MdLocationOn, MdEmail, MdPhone,
  MdCheckCircle, MdSchedule, MdInfo,
} from 'react-icons/md'
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
  active:    { color: 'green',  label: 'Active',    icon: MdCheckCircle },
  pending:   { color: 'orange', label: 'Pending',   icon: MdSchedule    },
  completed: { color: 'purple', label: 'Complete',  icon: MdCheckCircle },
  rejected:  { color: 'red',    label: 'Rejected',  icon: MdInfo        },
}

function Section({ title, children }) {
  return (
    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
      <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
        <Text fontWeight="700" fontSize="sm" color="gray.800">{title}</Text>
      </Box>
      <Box px={5} py={2}>{children}</Box>
    </Box>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <Flex align="center" gap={3} py={3}
      borderBottom="1px solid" borderColor="gray.50" _last={{ border: 'none' }}>
      <Flex w="32px" h="32px" borderRadius="lg" bg="brand.50"
        align="center" justify="center" flexShrink={0}>
        <Icon as={icon} color="brand.500" boxSize={4} />
      </Flex>
      <Box>
        <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="600" color="gray.700">{value || '—'}</Text>
      </Box>
    </Flex>
  )
}

export default function MyPlacement() {
  
  const { data, loading, error, refetch } = useFetch('/placements/')

  const placementList = Array.isArray(data) ? data : []
  const p = placementList[0] ?? null  // student has one placement

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

  if (loading) return (
    <Flex justify="center" align="center" minH="60vh">
      <Spinner size="lg" color="brand.500" />
    </Flex>
  )

  if (error) return (
    <Alert status="error" borderRadius="xl">
      <AlertIcon />
      <AlertDescription>{error}</AlertDescription>
      <Button size="xs" ml={3} onClick={refetch} colorScheme="red" variant="outline">Retry</Button>
    </Alert>
  )

  if (!p) return (
    <Flex direction="column" align="center" justify="center" minH="60vh" gap={3}>
      <Icon as={MdWork} boxSize={14} color="gray.200" />
      <Text color="gray.400" fontWeight="600">No placement assigned yet</Text>
      <Text color="gray.300" fontSize="sm">Contact your coordinator to get placed.</Text>
    </Flex>
  )

  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending

  return (
    <Box>
      {/* Hero */}
      <Box bg="brand.600" bgGradient="linear(135deg, brand.600 0%, brand.800 100%)"
        borderRadius="2xl" p={6} mb={6} position="relative" overflow="hidden">
        <Box position="absolute" top="-30px" right="-30px" w="160px" h="160px"
          borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
          <Box>
            <Text color="brand.100" fontSize="xs" textTransform="uppercase"
              letterSpacing="wider" mb={1}>Current Placement</Text>
            <Text color="white" fontSize="xl" fontWeight="800">{p.company_name}</Text>
            <Text color="brand.100" fontSize="sm" mt={1}>{p.position}</Text>
          </Box>
          <Badge colorScheme={cfg.color} px={3} py={1} borderRadius="full"
            bg="whiteAlpha.200" color="white" border="1px solid" borderColor="whiteAlpha.300">
            <HStack spacing={1}>
              <Icon as={cfg.icon} boxSize={3} />
              <Text fontSize="xs">{cfg.label}</Text>
            </HStack>
          </Badge>
        </Flex>
        <Box mt={5}>
          <Flex justify="space-between" mb={1}>
            <Text color="brand.100" fontSize="xs">Placement Progress</Text>
            <Text color="white" fontSize="xs" fontWeight="700">{progress}%</Text>
          </Flex>
          <Progress value={progress} size="sm" borderRadius="full"
            bg="whiteAlpha.200" sx={{ '& > div': { background: 'white' } }} />
          <Text color="brand.200" fontSize="10px" mt={1}>
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Placement complete'}
          </Text>
        </Box>
      </Box>

      {/* Quick stats */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        {[
          { label: 'Start Date',     value: p.start_date  || '—'                             },
          { label: 'End Date',       value: p.end_date    || '—'                             },
          { label: 'Days Remaining', value: daysRemaining ?? '—'                             },
          { label: 'Status',         value: cfg.label                                         },
        ].map(s => (
          <Box key={s.label} bg="white" borderRadius="xl" p={4}
            border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              {s.label}
            </Text>
            <Text fontSize="lg" fontWeight="800" color="gray.800" mt={1}>{s.value}</Text>
          </Box>
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 340px' }} gap={5}>
        <VStack spacing={5} align="stretch">
          <Section title="Placement Details">
            <InfoRow icon={MdWork}     label="Company"  value={p.company_name} />
            <InfoRow icon={MdWork}     label="Position" value={p.position}     />
          </Section>
        </VStack>

        <VStack spacing={5} align="stretch">
          {/* Workplace Supervisor */}
          <Section title="Workplace Supervisor">
            <Flex align="center" gap={3} py={3} borderBottom="1px solid" borderColor="gray.50">
              <Avatar size="md" name="Workplace Supervisor" bg="brand.600" color="white" />
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.800">
                  {p.workplace_supervisor?.name }
                </Text>
                <Text fontSize="xs" color="gray.400">Workplace Supervisor</Text>
              </Box>
            </Flex>
          </Section>

          {/* Academic Supervisor */}
          <Section title="Academic Supervisor">
            <Flex align="center" gap={3} py={3} borderBottom="1px solid" borderColor="gray.50">
              <Avatar size="md" name="Academic Supervisor" bg="purple.500" color="white" />
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.800">
                  {p.academic_supervisor?.name }
                </Text>
                <Text fontSize="xs" color="gray.400">Academic Supervisor</Text>
              </Box>
            </Flex>
          </Section>
        </VStack>
      </Grid>
    </Box>
  )
}