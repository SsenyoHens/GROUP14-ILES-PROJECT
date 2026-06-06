import { useEffect, useState } from 'react'
import { 
  Box, Grid, Text, Spinner, Center, Alert, AlertIcon, 
  Flex, Button 
} from '@chakra-ui/react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, LineChart, Line 
} from 'recharts'
import PageHeader from '../../components/PageHeader'
import { reportService } from '../../api/services'

export default function AdminReports() {
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [byDept, setByDept] = useState([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  const fetchAdminData = async () => {
    setLoading(true)
    const errs = {}
    await Promise.allSettled([
      reportService.getSummary()
        .then(r => setSummary(r.data))
        .catch(() => { errs.summary = 'Could not load system summary.' }),
        
      reportService.getPlacementTrend()
        .then(r => {
          const rawData = Array.isArray(r.data) ? r.data : []
          const formattedTrend = rawData.map(item => ({
            month: item.month_name || item.month || 'Jan',
            placed: item.placed ?? item.total_placements ?? item.count ?? 0,
            registered: item.registered ?? item.total_students ?? 0
          }))
          setTrend(formattedTrend)
        })
        .catch(() => { errs.trend = 'Could not load trend details.' }),
        
      reportService.getByDept()
        .then(r => setByDept(Array.isArray(r.data) ? r.data : []))
        .catch(() => { errs.byDept = 'Could not load departments.' })
    ])
    setErrors(errs)
    setLoading(false)
  }

  useEffect(() => { fetchAdminData() }, [])

  return (
    <Box>
      <PageHeader title="System Reports & Analytics" subtitle="Full platform-wide internship program overview">
        <Button size="sm" variant="outline" onClick={fetchAdminData} borderRadius="lg">
          Refresh Overview
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={6}>
        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="10px" color="gray.400" textTransform="uppercase" fontWeight="bold">Total Registered Students</Text>
          <Text as="div" fontSize="2xl" fontWeight="800" color="brand.600" mt={1}>
            {loading ? <Spinner size="xs"/> : summary?.total_students ?? 0}
          </Text>
        </Box>
        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="10px" color="gray.400" textTransform="uppercase" fontWeight="bold">Total Approved Placements</Text>
          <Text as="div" fontSize="2xl" fontWeight="800" color="blue.600" mt={1}>
            {loading ? <Spinner size="xs"/> : summary?.total_placements ?? 0}
          </Text>
        </Box>
        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="10px" color="gray.400" textTransform="uppercase" fontWeight="bold">Active In-Field Interns</Text>
          <Text as="div" fontSize="2xl" fontWeight="800" color="green.600" mt={1}>
            {loading ? <Spinner size="xs"/> : summary?.active_placements ?? 0}
          </Text>
        </Box>
        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="10px" color="gray.400" textTransform="uppercase" fontWeight="bold">Total Submitted Evaluations</Text>
          <Text as="div" fontSize="2xl" fontWeight="800" color="purple.600" mt={1}>
            {loading ? <Spinner size="xs"/> : summary?.total_evaluations ?? 0}
          </Text>
        </Box>
      </Grid>

      {/* Trend Analysis Graph */}
      <Grid templateColumns="1fr" gap={4} mb={4}>
        <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontWeight="700" fontSize="sm" color="gray.700" mb={4}>Platform Registration vs Field Placement Growth</Text>
          {errors.trend ? (
            <Alert status="error" borderRadius="lg"><AlertIcon />{errors.trend}</Alert>
          ) : loading ? (
            <Center h="250px"><Spinner color="brand.500" /></Center>
          ) : trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="placed" stroke="#16a872" strokeWidth={2} name="Placed Enrolment" />
                <Line type="monotone" dataKey="registered" stroke="#3182ce" strokeWidth={2} name="Total Registered Users" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Center h="250px"><Text color="gray.400">No macro-level trends gathered yet.</Text></Center>
          )}
        </Box>
      </Grid>

      {/* Department Allocation Chart — Refactored to Vertical Bar Chart Layout */}
      <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
        <Text fontWeight="700" fontSize="sm" color="gray.700" mb={4}>University Department Allocation Metrics</Text>
        {errors.byDept ? (
          <Alert status="error" borderRadius="lg"><AlertIcon />{errors.byDept}</Alert>
        ) : loading ? (
          <Center h="300px"><Spinner color="brand.500" /></Center>
        ) : byDept.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byDept} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {/* Rounded top edges applied via radius prop */}
              <Bar dataKey="total_students" fill="#3182ce" name="Enrolled Students" radius={[4, 4, 0, 0]} />
              <Bar dataKey="active_placements" fill="#16a872" name="Secured Internships" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Center h="300px"><Text color="gray.400">No departmental entries recorded.</Text></Center>
        )}
      </Box>
    </Box>
  )
}