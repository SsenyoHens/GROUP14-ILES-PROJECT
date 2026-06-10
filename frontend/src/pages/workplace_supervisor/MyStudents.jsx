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
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
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
          <Text fontSize="10px" color="gray.400" textTransform="uppercase"
            letterSpacing="wider" mb={1}>{label}</Text>
          {loading
            ? <Box h="28px" w="50px" bg="gray.100" borderRadius="md" mt={1} />
            : <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight={1}>
                {value ?? '—'}
              </Text>
          }
        </Box>
        <Flex w="44px" h="44px" borderRadius="xl" bg={`${color}.50`}
          align="center" justify="center">
          <Icon as={icon} boxSize={5} color={`${color}.500`} />
        </Flex>
      </Flex>
    </Box>
  )
}


function StudentDrawer({ student, isOpen, onClose }) {
  const { data, loading } = useFetch(student ? `/students/${student.id}/` : null)
  const detail = data ?? {}

  const displayName = student
    ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
    : ''

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md" placement="right">
      <DrawerOverlay bg="blackAlpha.200" backdropFilter="blur(4px)" />
      <DrawerContent borderRadius="2xl 0 0 2xl" overflow="hidden">
        <DrawerCloseButton mt={2} />
        <DrawerHeader borderBottom="1px solid" borderColor="gray.100" pb={4}>
          {student && (
            <HStack spacing={3}>
              <Avatar size="md" name={displayName} bg="brand.600" color="white" />
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.800">{displayName}</Text>
                <Text fontSize="xs" color="gray.400">{student.email}</Text>
              </Box>
            </HStack>
          )}
        </DrawerHeader>
        <DrawerBody px={5} py={4}>
          {loading
            ? <Flex justify="center" align="center" h="200px"><Spinner color="brand.500" /></Flex>
            : (
              <VStack spacing={5} align="stretch">
                {/* Personal info */}
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" mb={3}>
                    Contact Info
                  </Text>
                  {[
                    { icon: MdEmail,  label: 'Email',      value: student?.email      },
                    { icon: MdPhone,  label: 'Phone',      value: student?.phone      },
                    { icon: MdPerson, label: 'Department', value: student?.department },
                  ].filter(r => r.value).map(r => (
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

                {/* Profile details */}
                {detail.profile && (
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="gray.400"
                      textTransform="uppercase" letterSpacing="wider" mb={3}>
                      Academic Info
                    </Text>
                    {[
                      { label: 'Course',       value: detail.profile.course            },
                      { label: 'Year',         value: detail.profile.year_of_study ? `Year ${detail.profile.year_of_study}` : null },
                      { label: 'Reg. Number',  value: detail.profile.registration_number },
                    ].filter(r => r.value).map(r => (
                      <Flex key={r.label} justify="space-between" py={2}
                        borderBottom="1px solid" borderColor="gray.50" _last={{ border: 'none' }}>
                        <Text fontSize="xs" color="gray.400">{r.label}</Text>
                        <Text fontSize="xs" fontWeight="600" color="gray.700">{r.value}</Text>
                      </Flex>
                    ))}
                  </Box>
                )}

                {/* Log stats */}
				{detail.weekly_logs?.length > 0 && (
					<Box>
						<Text
							fontSize="xs"
							fontWeight="600"
							color="gray.400"
							textTransform="uppercase"
							letterSpacing="wider"
							mb={3}
						>
							Weekly Logs
						</Text>

						<VStack spacing={3} align="stretch">
							{detail.weekly_logs.map(log => (
								<Box
									key={log.id}
									p={3}
								bg="gray.50"
								borderRadius="lg"
								border="1px solid"
								borderColor="gray.100"
							>
								<Flex justify="space-between">
									<Text fontWeight="600">
										Week {log.week_number}
									</Text>

								<Badge
									colorScheme={
										log.status === 'approved'
											? 'green'
											: log.status === 'rejected'
											? 'red'
											: 'orange'
								}
							>
								{log.status}
							</Badge>
						</Flex>

						<Text mt={2} fontSize="sm">
							{log.activities_done}
						</Text>
					</Box>
				))}
			</VStack>
		</Box>
	)}
                {detail.log_stats && (
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="gray.400"
                      textTransform="uppercase" letterSpacing="wider" mb={3}>
                      Log Stats
                    </Text>
                    <Grid templateColumns="repeat(3,1fr)" gap={3}>
                      {[
                        { label: 'Total',     value: detail.log_stats.total,     color: 'brand'  },
                        { label: 'Submitted', value: detail.log_stats.submitted, color: 'teal'   },
                        { label: 'Approved',  value: detail.log_stats.approved,  color: 'green'  },
                      ].map(s => (
                        <Box key={s.label} bg="gray.50" borderRadius="xl" p={3} textAlign="center">
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                            letterSpacing="wider">{s.label}</Text>
                          <Text fontSize="lg" fontWeight="800" color={`${s.color}.500`} mt={1}>
                            {s.value ?? '—'}
                          </Text>
                        </Box>
                      ))}
                    </Grid>
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
  
  const { data, loading, error, refetch } = useFetch('/students/')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selected,     setSelected]     = useState(null)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const students = Array.isArray(data) ? data : []

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    return matchSearch
  })

  const handleView = (s) => { setSelected(s); onOpen() }

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="xl" fontWeight="800" color="gray.800">My Students</Text>
        <Text fontSize="sm" color="gray.400">
          {loading ? 'Loading…' : `${students.length} interns assigned to you`}
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        <StatCard label="Total Students" value={students.length} icon={MdPeople}      color="brand"  loading={loading} />
        <StatCard label="Total"          value={students.length} icon={MdCheckCircle} color="green"  loading={loading} />
        <StatCard label="This Month"     value={students.length} icon={MdWarning}     color="red"    loading={loading} />
        <StatCard label="Evaluated"      value={0}               icon={MdAssignment}  color="purple" loading={loading} />
      </Grid>

      {error && (
        <Alert status="error" borderRadius="xl" mb={4}>
          <AlertIcon /><AlertDescription>{error}</AlertDescription>
          <Button size="xs" ml={3} onClick={refetch} colorScheme="red" variant="outline">Retry</Button>
        </Alert>
      )}

      <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">

        <Flex px={5} py={4} justify="space-between" align="center"
          borderBottom="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
          <Text fontWeight="700" fontSize="sm" color="gray.800">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </Text>
          <Box position="relative">
            <Icon as={MdSearch} position="absolute" left={2} top="50%"
              transform="translateY(-50%)" color="gray.300" boxSize={4} pointerEvents="none" />
            <Input pl={8} size="sm" borderRadius="lg" bg="gray.50" w="180px"
              placeholder="Search…"
              value={search} onChange={e => setSearch(e.target.value)}
              _focus={{ bg: 'white', borderColor: 'brand.400' }} />
          </Box>
        </Flex>

        <Box overflowX="auto">
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr bg="gray.50">
                {['Student', 'Email', 'Department', 'Action'].map(h => (
                  <Th key={h} px={4} py={3} fontSize="10px" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" fontWeight="600">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {loading
                ? <LoadingRows cols={4} />
                : filtered.length > 0
                  ? filtered.map(s => (
                      <Tr key={s.id} _hover={{ bg: 'gray.50' }}
                        borderBottom="1px solid" borderColor="gray.50">
                        <Td py={3} px={4}>
                          <HStack spacing={3}>
                            <Avatar size="sm"
                              name={`${s.first_name} ${s.last_name}`}
                              bg="brand.600" color="white" fontSize="xs" />
                            <Box>
                              <Text fontSize="sm" fontWeight="600" color="gray.800">
                                {s.first_name} {s.last_name}
                              </Text>
                            </Box>
                          </HStack>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="sm" color="gray.600">{s.email}</Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="sm" color="gray.600">{s.department || '—'}</Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Button size="xs" variant="outline" borderRadius="lg"
                            fontSize="10px" colorScheme="brand"
                            onClick={() => handleView(s)}>
                            View
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  : (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={10} color="gray.400" fontSize="sm">
                        {search ? 'No students match your search.' : 'No students assigned yet.'}
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