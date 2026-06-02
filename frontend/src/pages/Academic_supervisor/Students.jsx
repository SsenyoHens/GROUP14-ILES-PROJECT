import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, HStack, VStack, Icon,
  Badge, Avatar, Input, InputGroup, InputLeftElement,
  Spinner, Alert, AlertIcon, AlertDescription, Button,
  Table, Thead, Tbody, Tr, Th, Td,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader,
  DrawerBody, DrawerCloseButton, useDisclosure, Divider,
} from '@chakra-ui/react'
import {
  MdSearch, MdPeople, MdEmail, MdPhone,
  MdSchool, MdWork, MdBook, MdAssignment,
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

// ── Student detail drawer ──────────────────────────────────────────────────────
function StudentDrawer({ student, isOpen, onClose }) {
  // ✅ Fetch full student detail including placement, log stats
  const { data, loading } = useFetch(student ? `/students/${student.id}/` : null)
  const detail = data ?? {}

  const displayName = student
    ? `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.email
    : ''

  // ✅ Placement from detail response
  const placement = detail.placement ?? null

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md" placement="right">
      <DrawerOverlay bg="blackAlpha.200" backdropFilter="blur(4px)" />
      <DrawerContent overflow="hidden">
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

                {/* Log stats */}
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                  {[
                    { label: 'Total Logs',  value: detail.log_stats?.total,     color: 'brand'  },
                    { label: 'Submitted',   value: detail.log_stats?.submitted,  color: 'teal'   },
                    { label: 'Approved',    value: detail.log_stats?.approved,   color: 'green'  },
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

                {/* Academic info */}
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" mb={3}>
                    Academic Info
                  </Text>
                  {[
                    { icon: MdSchool, label: 'Course',       value: detail.profile?.course              },
                    { icon: MdSchool, label: 'Year',         value: detail.profile?.year_of_study
                        ? `Year ${detail.profile.year_of_study}` : null                                 },
                    { icon: MdSchool, label: 'Reg. Number',  value: detail.profile?.registration_number },
                    { icon: MdEmail,  label: 'Email',        value: student?.email                      },
                    { icon: MdPhone,  label: 'Phone',        value: student?.phone                      },
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

                {/* Placement */}
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" mb={3}>
                    Placement
                  </Text>
                  {placement
                    ? (
                      <Box bg="brand.50" borderRadius="xl" p={4}
                        border="1px solid" borderColor="brand.100">
                        <Text fontSize="sm" fontWeight="700" color="brand.800">
                          {placement.company_name}
                        </Text>
                        <Text fontSize="xs" color="brand.600" mt={0.5}>
                          {placement.position}
                        </Text>
                        <HStack spacing={3} mt={2}>
                          <Badge colorScheme={
                            placement.status === 'active'    ? 'green'  :
                            placement.status === 'completed' ? 'purple' :
                            placement.status === 'rejected'  ? 'red'    : 'orange'
                          } borderRadius="full" fontSize="10px">
                            {placement.status}
                          </Badge>
                          <Text fontSize="10px" color="brand.500">
                            {placement.start_date} → {placement.end_date}
                          </Text>
                        </HStack>
                      </Box>
                    )
                    : (
                      <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                        No placement assigned yet.
                      </Text>
                    )
                  }
                </Box>

                {/* Evaluations count */}
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" mb={2}>
                    Evaluations
                  </Text>
                  <Box bg="gray.50" borderRadius="xl" p={3} textAlign="center">
                    <Text fontSize="2xl" fontWeight="800" color="purple.500">
                      {detail.evaluations_count ?? 0}
                    </Text>
                    <Text fontSize="xs" color="gray.400">evaluations received</Text>
                  </Box>
                </Box>

              </VStack>
            )
          }
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AcademicStudents() {
  // ✅ /students/ returns students filtered by academic supervisor role
  const { data, loading, error, refetch } = useFetch('/students/')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')

  const students = Array.isArray(data) ? data : []

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return !search ||
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q)  ||
      s.email?.toLowerCase().includes(q)       ||
      s.profile?.registration_number?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
  })

  const handleView = (s) => { setSelected(s); onOpen() }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">My Students</Text>
          <Text fontSize="sm" color="gray.400">
            {loading ? 'Loading…' : `${students.length} student${students.length !== 1 ? 's' : ''} assigned to you`}
          </Text>
        </Box>
      </Flex>

      {/* Stats */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={6}>
        {[
          { label: 'Total',    value: students.length,                                        color: 'brand'  },
          { label: 'With Logs', value: students.filter(s => s.id).length,                    color: 'blue'   },
          { label: 'Active',   value: students.length,                                        color: 'green'  },
          { label: 'Dept',     value: [...new Set(students.map(s => s.department))].length,   color: 'purple' },
        ].map(s => (
          <Box key={s.label} bg="white" borderRadius="xl" p={4}
            border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              {s.label}
            </Text>
            <Text fontSize="xl" fontWeight="800" color={`${s.color}.500`} mt={1}>
              {loading ? '—' : s.value}
            </Text>
          </Box>
        ))}
      </Grid>

      {error && (
        <Alert status="error" borderRadius="xl" mb={4}>
          <AlertIcon />
          <AlertDescription flex={1}>{error}</AlertDescription>
          <Button size="xs" ml={3} onClick={refetch} colorScheme="red" variant="outline">
            Retry
          </Button>
        </Alert>
      )}

      {/* Search */}
      <Flex mb={4} gap={3} flexWrap="wrap">
        <InputGroup size="sm" maxW="300px">
          <InputLeftElement pointerEvents="none">
            <Icon as={MdSearch} color="gray.300" boxSize={4} />
          </InputLeftElement>
          <Input pl={8} borderRadius="lg" bg="white"
            placeholder="Search name, email, reg no…"
            value={search} onChange={e => setSearch(e.target.value)}
            border="1px solid" borderColor="gray.200"
            _focus={{ borderColor: 'brand.400' }} />
        </InputGroup>
      </Flex>

      {/* Table */}
      <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100"
        boxShadow="sm" overflow="hidden">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Student</Th>
              <Th>Reg No.</Th>
              <Th>Department</Th>
              <Th>Course</Th>
              <Th>Year</Th>
              <Th>Email</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading
              ? <LoadingRows cols={7} />
              : filtered.length > 0
                ? filtered.map(s => {
                    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email
                    const regNo    = s.profile?.registration_number || '—'
                    const course   = s.profile?.course              || '—'
                    const year     = s.profile?.year_of_study       ?? '—'

                    return (
                      <Tr key={s.id} _hover={{ bg: 'gray.50' }}>
                        <Td py={3} px={4}>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={fullName}
                              bg="brand.600" color="white" fontSize="xs" />
                            <Text fontSize="sm" fontWeight="600" color="gray.800">
                              {fullName}
                            </Text>
                          </HStack>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="xs" color="gray.500" fontFamily="mono">{regNo}</Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="sm" color="gray.600">{s.department || '—'}</Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="sm" color="gray.600">{course}</Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="sm" color="gray.600">
                            {year !== '—' ? `Year ${year}` : '—'}
                          </Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Text fontSize="xs" color="gray.500">{s.email}</Text>
                        </Td>
                        <Td py={3} px={4}>
                          <Button size="xs" colorScheme="brand" variant="outline"
                            borderRadius="lg" fontSize="10px"
                            onClick={() => handleView(s)}>
                            View
                          </Button>
                        </Td>
                      </Tr>
                    )
                  })
                : (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={10} color="gray.400">
                      {search ? 'No students match your search.' : 'No students assigned yet.'}
                    </Td>
                  </Tr>
                )
            }
          </Tbody>
        </Table>
      </Box>

      <StudentDrawer student={selected} isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}