import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Select,
  Alert, AlertIcon, AlertDescription,
  Textarea, FormLabel, Divider,
  CircularProgress, CircularProgressLabel,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Table, Thead, Tbody, Tr, Th, Td,
  useToast, Tabs, TabList, Tab, TabPanels, TabPanel,
} from '@chakra-ui/react'
import {
  MdStar, MdAssignment, MdCheckCircle,
  MdPerson, MdHistory, MdSend,
} from 'react-icons/md'
import api from '../../api/axiosInstance'

function useFetch(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const load = useCallback(async () => {
    if (!endpoint) return
    setLoading(true); setError(null)
    try { const res = await api.get(endpoint); setData(res.data) }
    catch (err) { setError(err.response?.data?.detail || err.message) }
    finally { setLoading(false) }
  }, [endpoint])
  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

const CRITERIA = [
  { key: 'punctuality',   label: 'Punctuality & Attendance', desc: 'Reports on time, consistent attendance'   },
  { key: 'attitude',      label: 'Work Attitude',            desc: 'Enthusiasm, professionalism, work ethic'  },
  { key: 'technical',     label: 'Technical Skills',         desc: 'Applies relevant technical knowledge'     },
  { key: 'communication', label: 'Communication',            desc: 'Written and verbal communication skills'  },
  { key: 'teamwork',      label: 'Teamwork',                 desc: 'Collaborates and supports colleagues'     },
  { key: 'initiative',    label: 'Initiative',               desc: 'Takes ownership, proactive problem-solving'},
]

const WEEK_OPTIONS = [
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Week ${i + 1}` })),
  { value: 'mid',   label: 'Mid-term Evaluation' },
  { value: 'final', label: 'Final Evaluation'    },
]

function ScoreSlider({ criterion, value, onChange }) {
  const color = value >= 80 ? 'green' : value >= 60 ? 'brand' : value >= 40 ? 'orange' : 'red'
  return (
    <Box bg="gray.50" borderRadius="xl" p={4}>
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box>
          <Text fontSize="sm" fontWeight="600" color="gray.700">{criterion.label}</Text>
          <Text fontSize="11px" color="gray.400" mt={0.5}>{criterion.desc}</Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="xl" fontWeight="800" color={`${color}.500`} lineHeight={1}>{value}</Text>
          <Text fontSize="10px" color="gray.400">/ 100</Text>
        </Box>
      </Flex>
      <Slider value={value} onChange={onChange} min={0} max={100} step={5}>
        <SliderTrack bg="gray.200" borderRadius="full" h="6px">
          <SliderFilledTrack bg={`${color}.400`} borderRadius="full" />
        </SliderTrack>
        <SliderThumb boxSize={5} boxShadow="md" border="2px solid" borderColor={`${color}.400`} />
      </Slider>
      <Flex justify="space-between" mt={1}>
        <Text fontSize="9px" color="gray.300">0 — Poor</Text>
        <Text fontSize="9px" color="gray.300">100 — Excellent</Text>
      </Flex>
    </Box>
  )
}

export default function SubmitEvaluation() {
  // /workplace-supervisor/students/ → [{ id, name, registration_number }]
  // /workplace-supervisor/evaluations/ → history array
  const students = useFetch('/workplace-supervisor/students/')
  const history  = useFetch('/workplace-supervisor/evaluations/')
  const toast    = useToast()

  const [studentId, setStudentId] = useState('')
  const [week,      setWeek]      = useState('')
  const [scores, setScores] = useState(Object.fromEntries(CRITERIA.map(c => [c.key, 70])))
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIA.length)
  const grade   = overall >= 80 ? 'A' : overall >= 70 ? 'B' : overall >= 60 ? 'C' : overall >= 50 ? 'D' : 'F'
  const gradeColor = { A: 'green', B: 'teal', C: 'blue', D: 'orange', F: 'red' }[grade]

  const selectedStudent = (students.data ?? []).find(s => String(s.id) === String(studentId))

  const handleSubmit = async () => {
    if (!studentId || !week) {
      toast({ title: 'Please select a student and evaluation period', status: 'warning', duration: 3000, isClosable: true })
      return
    }
    setSubmitting(true)
    try {
      await api.post('/workplace-supervisor/evaluations/', {
        student_id: studentId, week, scores, comments, overall, grade,
      })
      toast({ title: 'Evaluation submitted successfully', status: 'success', duration: 3000, isClosable: true })
      setStudentId(''); setWeek(''); setComments('')
      setScores(Object.fromEntries(CRITERIA.map(c => [c.key, 70])))
      history.refetch()
    } catch (err) {
      toast({ title: 'Submission failed', description: err.message, status: 'error', duration: 4000, isClosable: true })
    } finally {
      setSubmitting(false)
    }
  }

  const evalHistory = history.data ?? []

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="xl" fontWeight="800" color="gray.800">Submit Evaluation</Text>
        <Text fontSize="sm" color="gray.400">Assess your assigned interns by period</Text>
      </Box>

      <Tabs variant="unstyled">
        <TabList mb={5} bg="white" borderRadius="xl" p={1}
          border="1px solid" borderColor="gray.100" display="inline-flex" gap={1}>
          {['New Evaluation', 'History'].map(t => (
            <Tab key={t} borderRadius="lg" fontSize="sm" fontWeight="600" px={5} py={2}
              color="gray.400"
              _selected={{ bg: 'brand.600', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              {t}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {/* ── New Evaluation ── */}
          <TabPanel p={0}>
            <Grid templateColumns={{ base: '1fr', xl: '1fr 300px' }} gap={5}>

              {/* Form */}
              <VStack spacing={5} align="stretch">

                {/* Step 1: Select student + period */}
                <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
                  boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
                  <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontWeight="700" fontSize="sm" color="gray.800">Step 1 — Select Student & Period</Text>
                  </Box>
                  <Box px={5} py={4}>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      <Box>
                        <FormLabel fontSize="xs" color="gray.500" mb={1}>Student *</FormLabel>
                        {students.loading
                          ? <Spinner size="sm" color="brand.500" />
                          : (
                            <Select size="sm" borderRadius="lg" bg="gray.50"
                              placeholder="Select student…"
                              value={studentId} onChange={e => setStudentId(e.target.value)}
                              _focus={{ bg: 'white', borderColor: 'brand.400' }}>
                              {(students.data ?? []).map(s => (
                                <option key={s.id} value={s.id}>{s.name} — {s.registration_number}</option>
                              ))}
                            </Select>
                          )
                        }
                      </Box>
                      <Box>
                        <FormLabel fontSize="xs" color="gray.500" mb={1}>Evaluation Period *</FormLabel>
                        <Select size="sm" borderRadius="lg" bg="gray.50"
                          placeholder="Select period…"
                          value={week} onChange={e => setWeek(e.target.value)}
                          _focus={{ bg: 'white', borderColor: 'brand.400' }}>
                          {WEEK_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </Select>
                      </Box>
                    </Grid>

                    {/* Selected student preview */}
                    {selectedStudent && (
                      <Flex align="center" gap={3} mt={4} p={3} bg="brand.50" borderRadius="xl">
                        <Avatar size="sm" name={selectedStudent.name} bg="brand.600" color="white" fontSize="xs" />
                        <Box>
                          <Text fontSize="sm" fontWeight="600" color="brand.800">{selectedStudent.name}</Text>
                          <Text fontSize="11px" color="brand.500">{selectedStudent.registration_number} · {selectedStudent.department}</Text>
                        </Box>
                      </Flex>
                    )}
                  </Box>
                </Box>

                {/* Step 2: Criteria scoring */}
                <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
                  boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
                  <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontWeight="700" fontSize="sm" color="gray.800">Step 2 — Rate Each Criterion</Text>
                    <Text fontSize="11px" color="gray.400" mt={0.5}>Drag sliders to set scores (0–100)</Text>
                  </Box>
                  <Box px={5} py={4}>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      {CRITERIA.map(c => (
                        <ScoreSlider
                          key={c.key}
                          criterion={c}
                          value={scores[c.key]}
                          onChange={v => setScores(s => ({ ...s, [c.key]: v }))}
                        />
                      ))}
                    </Grid>
                  </Box>
                </Box>

                {/* Step 3: Comments */}
                <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
                  boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
                  <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontWeight="700" fontSize="sm" color="gray.800">Step 3 — Comments</Text>
                  </Box>
                  <Box px={5} py={4}>
                    <Textarea rows={4} borderRadius="lg" bg="gray.50" fontSize="sm"
                      placeholder="Overall feedback, strengths, areas for improvement…"
                      value={comments} onChange={e => setComments(e.target.value)}
                      _focus={{ bg: 'white', borderColor: 'brand.400' }} />
                  </Box>
                </Box>

                <Button
                  leftIcon={<Icon as={MdSend} />}
                  bg="brand.600" color="white" borderRadius="xl" size="md"
                  _hover={{ bg: 'brand.700' }} isLoading={submitting}
                  onClick={handleSubmit}
                  isDisabled={!studentId || !week}
                  alignSelf="flex-end" px={8}>
                  Submit Evaluation
                </Button>
              </VStack>

              {/* Right: score summary */}
              <Box position="sticky" top="80px" alignSelf="flex-start">
                <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
                  boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
                  <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontWeight="700" fontSize="sm" color="gray.800">Score Summary</Text>
                  </Box>
                  <Box px={5} py={5}>
                    <Flex align="center" justify="center" direction="column" mb={5}>
                      <CircularProgress value={overall} size="100px" thickness="8px"
                        color={`${gradeColor}.400`} trackColor="gray.100">
                        <CircularProgressLabel>
                          <Text fontSize="xl" fontWeight="800" color="gray.800">{overall}</Text>
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Badge colorScheme={gradeColor} borderRadius="full" px={4} py={1} fontSize="md" mt={3}>
                        Grade {grade}
                      </Badge>
                      <Text fontSize="11px" color="gray.400" mt={1}>Overall Score</Text>
                    </Flex>
                    <Divider mb={4} />
                    <VStack spacing={2} align="stretch">
                      {CRITERIA.map(c => {
                        const val = scores[c.key]
                        const col = val >= 80 ? 'green' : val >= 60 ? 'brand' : val >= 40 ? 'orange' : 'red'
                        return (
                          <Flex key={c.key} justify="space-between" align="center">
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>{c.label}</Text>
                            <Text fontSize="xs" fontWeight="700" color={`${col}.500`}>{val}</Text>
                          </Flex>
                        )
                      })}
                    </VStack>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </TabPanel>

          {/* ── History ── */}
          <TabPanel p={0}>
            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
              <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
                <Text fontWeight="700" fontSize="sm" color="gray.800">Evaluation History</Text>
                <Text fontSize="11px" color="gray.400">{evalHistory.length} evaluations submitted</Text>
              </Box>
              {history.loading
                ? <Flex justify="center" py={10}><Spinner color="brand.500" /></Flex>
                : evalHistory.length === 0
                  ? (
                    <Flex direction="column" align="center" py={12} gap={2}>
                      <Icon as={MdHistory} boxSize={10} color="gray.200" />
                      <Text fontSize="sm" color="gray.400">No evaluations submitted yet.</Text>
                    </Flex>
                  )
                  : (
                    <Box overflowX="auto">
                      <Table size="sm" variant="unstyled">
                        <Thead>
                          <Tr bg="gray.50">
                            {['Student', 'Period', 'Score', 'Grade', 'Date', 'Status'].map(h => (
                              <Th key={h} px={4} py={3} fontSize="10px" color="gray.400"
                                textTransform="uppercase" letterSpacing="wider">{h}</Th>
                            ))}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {evalHistory.map((ev, i) => {
                            const g = ev.grade || 'B'
                            const gc = { A: 'green', B: 'teal', C: 'blue', D: 'orange', F: 'red' }[g] || 'gray'
                            return (
                              <Tr key={i} _hover={{ bg: 'gray.50' }} borderBottom="1px solid" borderColor="gray.50">
                                <Td py={3} px={4}>
                                  <HStack spacing={2}>
                                    <Avatar size="xs" name={ev.student_name} bg="brand.600" color="white" />
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">{ev.student_name}</Text>
                                  </HStack>
                                </Td>
                                <Td py={3} px={4}><Text fontSize="sm" color="gray.600">{ev.week}</Text></Td>
                                <Td py={3} px={4}><Text fontSize="sm" fontWeight="700" color="gray.700">{ev.overall}/100</Text></Td>
                                <Td py={3} px={4}>
                                  <Badge colorScheme={gc} borderRadius="full" px={2} fontSize="10px">Grade {g}</Badge>
                                </Td>
                                <Td py={3} px={4}><Text fontSize="xs" color="gray.400">{ev.date}</Text></Td>
                                <Td py={3} px={4}>
                                  <Badge colorScheme="green" borderRadius="full" px={2} fontSize="10px">Submitted</Badge>
                                </Td>
                              </Tr>
                            )
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  )
              }
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}