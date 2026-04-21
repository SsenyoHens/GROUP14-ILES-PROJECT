import { useEffect, useState } from 'react'
import {
  Box, Grid, GridItem, Heading, Text, HStack,
  VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Divider, Spinner, Center, Alert, AlertIcon,
} from '@chakra-ui/react'
import {
  MdPeople, MdWork, MdAssignment, MdPendingActions,
} from 'react-icons/md'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'
import { dashboardService } from '../../api/services'

const statusColor = {
  Placed: 'green', Pending: 'orange', Evaluating: 'blue',
  Completed: 'purple', Active: 'green', Submitted: 'teal',
}

function Dashboard() {
  const [stats,     setStats]     = useState(null)
  const [recent,    setRecent]    = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [s, r, d] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecent(),
          dashboardService.getDeadlines(),
        ])
        setStats(s.data)
        setRecent(r.data)
        setDeadlines(d.data)
      } catch (err) {
        setError('Failed to load dashboard data. Check your API connection.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <Center h="60vh">
      <VStack>
        <Spinner size="xl" color="brand.500" thickness="3px" />
        <Text color="gray.400" fontSize="sm">Loading dashboard...</Text>
      </VStack>
    </Center>
  )

  if (error) return (
    <Alert status="error" borderRadius="lg" mt={4}>
      <AlertIcon />{error}
    </Alert>
  )

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle={`Session overview — ${new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long' })}`}
      />

      {/* Stat cards — data from API */}
      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2,1fr)', xl: 'repeat(4,1fr)' }} gap={4} mb={6}>
        <StatCard label="Total Students"      value={stats?.totalStudents}      helpText={stats?.studentsHelpText}    icon={MdPeople}        color="brand.600" />
        <StatCard label="Active Placements"   value={stats?.activePlacements}   helpText={stats?.placementsHelpText}  icon={MdWork}          color="blue.500"  />
        <StatCard label="Pending Evaluations" value={stats?.pendingEvaluations} helpText="Awaiting submission"        icon={MdPendingActions} color="orange.500" />
        <StatCard label="Completed Internships" value={stats?.completed}        helpText={stats?.completedHelpText}   icon={MdAssignment}    color="purple.500" />
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={4}>

        {/* Recent activity */}
        <GridItem bg="white" borderRadius="xl" p={5}
          border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontWeight="700" fontSize="sm" color="gray.700" mb={4} fontFamily="heading">
            Recent Activity
          </Text>
          {recent.length === 0 ? (
            <Text fontSize="sm" color="gray.400" textAlign="center" py={6}>
              No recent activity
            </Text>
          ) : (
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Action</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recent.map((item, i) => (
                  <Tr key={i} _hover={{ bg: 'gray.50' }}>
                    <Td fontSize="sm" fontWeight="500">{item.studentName}</Td>
                    <Td fontSize="sm" color="gray.500">{item.action}</Td>
                    <Td>
                      <Badge colorScheme={statusColor[item.status] || 'gray'}
                        borderRadius="full" px={2} fontSize="10px">
                        {item.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </GridItem>

        {/* Deadlines */}
        <GridItem bg="white" borderRadius="xl" p={5}
          border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontWeight="700" fontSize="sm" color="gray.700" mb={4} fontFamily="heading">
            Upcoming Deadlines
          </Text>
          {deadlines.length === 0 ? (
            <Text fontSize="sm" color="gray.400" textAlign="center" py={6}>
              No upcoming deadlines
            </Text>
          ) : (
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              {deadlines.map((d, i) => (
                <HStack key={i} justify="space-between" py={3}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="500">{d.title}</Text>
                    <Text fontSize="xs" color="gray.400">{d.description}</Text>
                  </VStack>
                  <Badge colorScheme={d.urgent ? 'red' : 'gray'}
                    borderRadius="full" px={2} fontSize="10px" whiteSpace="nowrap">
                    {d.dueDate}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          )}
        </GridItem>

      </Grid>
    </Box>
  )
}

export default Dashboard