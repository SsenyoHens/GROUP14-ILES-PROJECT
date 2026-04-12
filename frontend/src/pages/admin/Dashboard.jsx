import {
  Box, Grid, GridItem, Heading, Text, HStack,
  Table, Thead, Tbody, Tr, Th, Td, Badge,
  VStack, Divider,
} from '@chakra-ui/react'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'

const stats = [
  { label: 'Total Students',       value: 248, note: '↑ 12 this intake',  color: 'brand.700' },
  { label: 'Active Placements',    value: 195, note: '79% placed',         color: 'green.600' },
  { label: 'Supervisors',          value: 43,  note: '31 workplaces',      color: 'purple.600' },
  { label: 'Pending Evaluations',  value: 17,  note: '⚠ Needs attention',  color: 'orange.500' },
]

const recentStudents = [
  { name: 'Aisha Nakato',     reg: 'STU-001', status: 'Placed'     },
  { name: 'Brian Otieno',     reg: 'STU-002', status: 'Pending'    },
  { name: 'Charity Namukasa', reg: 'STU-003', status: 'Placed'     },
  { name: 'David Ssemwanga',  reg: 'STU-004', status: 'Evaluating' },
]

const deadlines = [
  { task: 'Midterm evaluation submission', date: 'Apr 20' },
  { task: 'Workplace visit reports',       date: 'Apr 25' },
  { task: 'Final grading window opens',    date: 'May 10' },
  { task: 'Completion certificates',       date: 'May 30' },
]

const statusColor = {
  Placed:     'green',
  Pending:    'orange',
  Evaluating: 'blue',
}

function Dashboard() {
  const { user } = useAuth()

  return (
    <Box maxW="1200px">
      {/* Header */}
      <Box mb={6}>
        <Heading size="lg" color="brand.700">Welcome, {user?.name || 'Admin'}</Heading>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Internship Learning & Evaluation System — Session 2025/26
        </Text>
      </Box>

      {/* Stat cards */}
      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }} gap={4} mb={6}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </Grid>

      {/* Bottom sections */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={4}>

        {/* Recent students */}
        <GridItem bg="white" borderRadius="lg" p={5} border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Heading size="sm" color="brand.700" mb={4}>Recent Student Registrations</Heading>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Reg No.</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentStudents.map((s) => (
                <Tr key={s.reg} _hover={{ bg: 'gray.50' }}>
                  <Td fontSize="sm">{s.name}</Td>
                  <Td fontSize="sm" color="gray.500">{s.reg}</Td>
                  <Td>
                    <Badge colorScheme={statusColor[s.status]} borderRadius="full" px={2}>
                      {s.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </GridItem>

        {/* Deadlines */}
        <GridItem bg="white" borderRadius="lg" p={5} border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Heading size="sm" color="brand.700" mb={4}>Upcoming Deadlines</Heading>
          <VStack align="stretch" spacing={0} divider={<Divider />}>
            {deadlines.map((d) => (
              <HStack key={d.task} justify="space-between" py={3}>
                <Text fontSize="sm">{d.task}</Text>
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">{d.date}</Text>
              </HStack>
            ))}
          </VStack>
        </GridItem>

      </Grid>
    </Box>
  )
}

export default Dashboard