import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Button, Spinner, Progress, Divider,
  Alert, AlertIcon, AlertDescription,
  CircularProgress, CircularProgressLabel,
} from '@chakra-ui/react'
import { MdAssignment, MdCheckCircle, MdSchedule, MdStar, MdInfo } from 'react-icons/md'
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
  submitted: { color: 'teal',   label: 'Submitted', icon: MdCheckCircle },
  pending:   { color: 'orange', label: 'Pending',   icon: MdSchedule    },
  graded:    { color: 'green',  label: 'Graded',    icon: MdStar        },
  draft:     { color: 'gray',   label: 'Draft',     icon: MdInfo        },
}

const CRITERIA_LABELS = {
  punctuality:   'Punctuality & Attendance',
  attitude:      'Work Attitude',
  technical:     'Technical Skills',
  communication: 'Communication',
  teamwork:      'Teamwork',
  initiative:    'Initiative',
}

function ScoreBar({ label, value }) {
  const color = value >= 80 ? 'green' : value >= 60 ? 'blue' : value >= 40 ? 'orange' : 'red'
  return (
    <Box>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs" color="gray.600">{label}</Text>
        <Text fontSize="xs" fontWeight="700" color={`${color}.500`}>{value}/100</Text>
      </Flex>
      <Progress value={value} size="sm" colorScheme={color} borderRadius="full" bg="gray.100" />
    </Box>
  )
}

function EvalCard({ ev, onSelect, selected }) {
  const cfg = STATUS_CONFIG[ev.status?.toLowerCase()] || STATUS_CONFIG.pending
  return (
    <Box bg="white" borderRadius="xl" p={4}
      border="2px solid" borderColor={selected ? 'brand.400' : 'gray.100'}
      boxShadow={selected ? '0 0 0 3px rgba(66,153,225,0.15)' : '0 1px 3px rgba(0,0,0,0.04)'}
      cursor="pointer" onClick={() => onSelect(ev)} transition="all 0.15s"
      _hover={{ borderColor: 'brand.300', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box>
          <Text fontSize="sm" fontWeight="700" color="gray.800">{ev.title}</Text>
          <Text fontSize="11px" color="gray.400" mt={0.5}>{ev.week ? `Week ${ev.week}` : ev.date}</Text>
        </Box>
        <Badge colorScheme={cfg.color} borderRadius="full" px={2} fontSize="9px">
          <HStack spacing={1}><Icon as={cfg.icon} boxSize={2.5} /><Text>{cfg.label}</Text></HStack>
        </Badge>
      </Flex>
      {ev.score != null && (
        <Flex align="center" gap={3}>
          <CircularProgress value={ev.score} size="44px" thickness="8px"
            color={ev.score >= 70 ? 'green.400' : 'orange.400'} trackColor="gray.100">
            <CircularProgressLabel fontSize="10px" fontWeight="800" color="gray.700">{ev.score}</CircularProgressLabel>
          </CircularProgress>
          <Box>
            <Text fontSize="xs" color="gray.400">Overall Score</Text>
            <Text fontSize="sm" fontWeight="700" color="gray.700">{ev.score}/100</Text>
          </Box>
        </Flex>
      )}
    </Box>
  )
}

export default function MyEvaluations() {
  // API expects array of: { id, title, week, date, status, score, comments,
  //   scores: { punctuality, attitude, technical, communication, teamwork, initiative },
  //   evaluator_name }
  const { data, loading, error, refetch } = useFetch('/student/evaluations/')
  const [selected, setSelected] = useState(null)

  const evalList = data ?? []
  const avg = evalList.filter(e => e.score != null).length > 0
    ? Math.round(evalList.filter(e => e.score != null).reduce((s, e) => s + e.score, 0)
        / evalList.filter(e => e.score != null).length)
    : null

  useEffect(() => {
    if (evalList.length > 0 && !selected) {
      setSelected(evalList.find(e => e.status === 'graded') || evalList[0])
    }
  }, [evalList])

  if (loading) return <Flex justify="center" align="center" minH="60vh"><Spinner size="lg" color="brand.500" /></Flex>

  if (error) return (
    <Alert status="error" borderRadius="xl">
      <AlertIcon /><AlertDescription>{error}</AlertDescription>
      <Button size="xs" ml={3} onClick={refetch} colorScheme="red" variant="outline">Retry</Button>
    </Alert>
  )

  return (
    <Box>
      {/* Summary bar */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        {[
          { label: 'Total',   value: evalList.length,                                     color: 'brand'  },
          { label: 'Graded',  value: evalList.filter(e => e.status === 'graded').length,  color: 'green'  },
          { label: 'Pending', value: evalList.filter(e => e.status === 'pending').length, color: 'orange' },
          { label: 'Avg Score', value: avg != null ? `${avg}%` : '—',                    color: 'purple' },
        ].map(s => (
          <Box key={s.label} bg="white" borderRadius="xl" p={4}
            border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{s.label}</Text>
            <Text fontSize="xl" fontWeight="800" color={`${s.color}.500`} mt={1}>{s.value}</Text>
          </Box>
        ))}
      </Grid>

      {evalList.length === 0
        ? (
          <Flex direction="column" align="center" justify="center" minH="40vh" gap={3}>
            <Icon as={MdAssignment} boxSize={14} color="gray.200" />
            <Text color="gray.400" fontWeight="600">No evaluations yet</Text>
            <Text color="gray.300" fontSize="sm">Your supervisor will submit evaluations during placement.</Text>
          </Flex>
        )
        : (
          <Grid templateColumns={{ base: '1fr', lg: '340px 1fr' }} gap={5}>
            {/* List */}
            <VStack spacing={3} align="stretch">
              <Text fontSize="xs" color="gray.400" fontWeight="600"
                textTransform="uppercase" letterSpacing="wider" px={1}>All Evaluations</Text>
              {evalList.map(ev => (
                <EvalCard key={ev.id} ev={ev} selected={selected?.id === ev.id} onSelect={setSelected} />
              ))}
            </VStack>

            {/* Detail panel */}
            {selected && (
              <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
                boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
                <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="700" fontSize="md" color="gray.800">{selected.title}</Text>
                      <Text fontSize="11px" color="gray.400" mt={0.5}>
                        By {selected.evaluator_name || 'Supervisor'} · {selected.date}
                      </Text>
                    </Box>
                    {selected.score != null && (
                      <CircularProgress value={selected.score} size="64px" thickness="8px"
                        color={selected.score >= 70 ? 'green.400' : 'orange.400'} trackColor="gray.100">
                        <CircularProgressLabel fontSize="sm" fontWeight="800" color="gray.800">
                          {selected.score}
                        </CircularProgressLabel>
                      </CircularProgress>
                    )}
                  </Flex>
                </Box>
                <Box px={5} py={5}>
                  {selected.scores && Object.keys(selected.scores).length > 0 && (
                    <>
                      <Text fontSize="xs" fontWeight="600" color="gray.500"
                        textTransform="uppercase" letterSpacing="wider" mb={4}>Breakdown</Text>
                      <VStack spacing={3} align="stretch" mb={6}>
                        {Object.entries(selected.scores).map(([key, val]) => (
                          <ScoreBar key={key} label={CRITERIA_LABELS[key] || key} value={val} />
                        ))}
                      </VStack>
                      <Divider mb={5} />
                    </>
                  )}
                  {selected.comments && (
                    <>
                      <Text fontSize="xs" fontWeight="600" color="gray.500"
                        textTransform="uppercase" letterSpacing="wider" mb={2}>Supervisor Comments</Text>
                      <Box bg="gray.50" borderRadius="xl" p={4}>
                        <Text fontSize="sm" color="gray.600" lineHeight="1.8">{selected.comments}</Text>
                      </Box>
                    </>
                  )}
                  {!selected.scores && !selected.comments && (
                    <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>
                      {selected.status === 'pending' ? 'Evaluation not yet submitted.' : 'No details available.'}
                    </Text>
                  )}
                </Box>
              </Box>
            )}
          </Grid>
        )
      }
    </Box>
  )
}