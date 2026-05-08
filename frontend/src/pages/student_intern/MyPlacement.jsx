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

const STATUS_CONFIG = {
  active:   { color: 'green',  label: 'Active',    icon: MdCheckCircle },
  pending:  { color: 'orange', label: 'Pending',   icon: MdSchedule    },
  review:   { color: 'blue',   label: 'In Review', icon: MdInfo        },
  complete: { color: 'purple', label: 'Complete',  icon: MdCheckCircle },
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
    <Flex align="center" gap={3} py={3} borderBottom="1px solid" borderColor="gray.50" _last={{ border: 'none' }}>
      <Flex w="32px" h="32px" borderRadius="lg" bg="brand.50" align="center" justify="center" flexShrink={0}>
        <Icon as={icon} color="brand.500" boxSize={4} />
      </Flex>
      <Box>
        <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{label}</Text>
        <Text fontSize="sm" fontWeight="600" color="gray.700">{value || '—'}</Text>
      </Box>
    </Flex>
  )
}

export default function MyPlacement() {
  // API expects: { organisation_name, department, location, status, start_date, end_date,
  //   days_remaining, total_days, description,
  //   supervisor: { name, email, phone, title },
  //   coordinator: { name, email },
  //   milestones: [{ label, date, done }] }
  const { data: p, loading, error, refetch } = useFetch('/student/placement/')

  if (loading) return <Flex justify="center" align="center" minH="60vh"><Spinner size="lg" color="brand.500" /></Flex>

  if (error) return (
    <Alert status="error" borderRadius="xl">
      <AlertIcon /><AlertDescription>{error}</AlertDescription>
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
  const progress = p.total_days > 0
    ? Math.min(100, Math.round(((p.total_days - (p.days_remaining ?? 0)) / p.total_days) * 100))
    : 0

  return (
    <Box>
      {/* Hero */}
      <Box bg="brand.600" bgGradient="linear(135deg, brand.600 0%, brand.800 100%)"
        borderRadius="2xl" p={6} mb={6} position="relative" overflow="hidden">
        <Box position="absolute" top="-30px" right="-30px" w="160px" h="160px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
          <Box>
            <Text color="brand.100" fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1}>Current Placement</Text>
            <Text color="white" fontSize="xl" fontWeight="800">{p.organisation_name}</Text>
            <Text color="brand.100" fontSize="sm" mt={1}>{p.department}</Text>
            <HStack mt={2} spacing={1}>
              <Icon as={MdLocationOn} boxSize={3} color="brand.200" />
              <Text color="brand.200" fontSize="xs">{p.location || 'Location not set'}</Text>
            </HStack>
          </Box>
          <Badge colorScheme={cfg.color} px={3} py={1} borderRadius="full"
            bg="whiteAlpha.200" color="white" border="1px solid" borderColor="whiteAlpha.300">
            <HStack spacing={1}><Icon as={cfg.icon} boxSize={3} /><Text fontSize="xs">{cfg.label}</Text></HStack>
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
            {p.days_remaining > 0 ? `${p.days_remaining} days remaining` : 'Placement complete'}
          </Text>
        </Box>
      </Box>

      {/* Quick stats */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        {[
          { label: 'Start Date',     value: p.start_date  || '—'                      },
          { label: 'End Date',       value: p.end_date    || '—'                      },
          { label: 'Days Remaining', value: p.days_remaining ?? '—'                   },
          { label: 'Total Duration', value: p.total_days ? `${p.total_days} days` : '—' },
        ].map(s => (
          <Box key={s.label} bg="white" borderRadius="xl" p={4}
            border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{s.label}</Text>
            <Text fontSize="lg" fontWeight="800" color="gray.800" mt={1}>{s.value}</Text>
          </Box>
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 340px' }} gap={5}>
        <VStack spacing={5} align="stretch">
          {p.description && (
            <Section title="About This Placement">
              <Text fontSize="sm" color="gray.600" lineHeight="1.8" py={3}>{p.description}</Text>
            </Section>
          )}
          <Section title="Milestones">
            {(p.milestones ?? []).length === 0
              ? <Text fontSize="sm" color="gray.400" py={4} textAlign="center">No milestones set.</Text>
              : (p.milestones ?? []).map((m, i) => (
                <Flex key={i} align="center" gap={3} py={3}
                  borderBottom="1px solid" borderColor="gray.50" _last={{ border: 'none' }}>
                  <Icon as={m.done ? MdCheckCircle : MdSchedule}
                    color={m.done ? 'green.400' : 'gray.300'} boxSize={5} flexShrink={0} />
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="500" color={m.done ? 'gray.800' : 'gray.500'}>{m.label}</Text>
                    <Text fontSize="11px" color="gray.400">{m.date}</Text>
                  </Box>
                  {m.done && <Badge colorScheme="green" borderRadius="full" fontSize="9px">Done</Badge>}
                </Flex>
              ))
            }
          </Section>
        </VStack>

        <VStack spacing={5} align="stretch">
          <Section title="Workplace Supervisor">
            <Flex align="center" gap={3} py={3} borderBottom="1px solid" borderColor="gray.50">
              <Avatar size="md" name={p.supervisor?.name} bg="brand.600" color="white" />
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.800">{p.supervisor?.name || '—'}</Text>
                <Text fontSize="xs" color="gray.400">{p.supervisor?.title || 'Supervisor'}</Text>
              </Box>
            </Flex>
            <InfoRow icon={MdEmail} label="Email" value={p.supervisor?.email} />
            <InfoRow icon={MdPhone} label="Phone" value={p.supervisor?.phone} />
          </Section>

          <Section title="Academic Coordinator">
            <Flex align="center" gap={3} py={3} borderBottom="1px solid" borderColor="gray.50">
              <Avatar size="md" name={p.coordinator?.name} bg="purple.500" color="white" />
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.800">{p.coordinator?.name || '—'}</Text>
                <Text fontSize="xs" color="gray.400">Academic Supervisor</Text>
              </Box>
            </Flex>
            <InfoRow icon={MdEmail} label="Email" value={p.coordinator?.email} />
          </Section>
        </VStack>
      </Grid>
    </Box>
  )
}