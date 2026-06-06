import { useEffect, useState } from 'react'
import { Box, Grid, Text, Spinner, Center, Flex, Button, Progress, Alert, AlertIcon } from '@chakra-ui/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import PageHeader from '../../components/PageHeader'
import { reportService } from '../../api/services' // Integrated with your backend API service

const COMPLIANCE_COLORS = ['#3182ce', '#ed8936', '#16a872']

export default function AcademicReports() {
  const [summary, setSummary] = useState(null)
  const [breakdown, setBreakdown] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAcademicData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Pull supervisor-specific summary metrics from backend
      const summaryRes = await reportService.getSummary()
      setSummary(summaryRes.data)
      
      // Pull course/stream breakdown configurations from backend
      const detailsRes = await reportService.getByDept()
      setBreakdown(Array.isArray(detailsRes.data) ? detailsRes.data : [])
    } catch (e) {
      console.error('Academic cohort metrics loading exception:', e)
      setError('Could not update your student roster analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAcademicData() }, [])

  // Maps backend counts into data objects for the Logbook Pie Chart
  const logStatusPieData = [
    { name: 'Draft Logs', value: summary?.draft_logs_count || 0 },
    { name: 'Awaiting Action', value: summary?.total_evaluations || 0 },
    { name: 'Approved Milestones', value: summary?.approved_logs_count || 0 },
  ].filter(item => item.value > 0) // Prevents rendering completely empty slices

  return (
    <Box>
      <PageHeader title="Academic Cohort Assessment" subtitle="Assigned streams, logbook submission tracking, and evaluation status">
        <Button size="sm" variant="solid" colorScheme="teal" onClick={fetchAcademicData} borderRadius="lg">
          Refresh Roster
        </Button>
      </PageHeader>

      {error && (
        <Alert status="error" mb={4} borderRadius="lg">
          <AlertIcon />{error}
        </Alert>
      )}

      {/* KPI Row — Fixed with as="div" wrapper layers to eliminate DOM hydration errors */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={6}>
        <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="11px" color="gray.400" textTransform="uppercase" fontWeight="bold">Assigned Mapped Mentees</Text>
          <Text as="div" fontSize="3xl" fontWeight="800" color="brand.500" mt={1}>
            {loading ? <Spinner size="sm"/> : summary?.total_students ?? 0}
          </Text>
          <Text fontSize="11px" color="gray.400" mt={1}>Active students allocated to your portfolio</Text>
        </Box>
        
        <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="11px" color="gray.400" textTransform="uppercase" fontWeight="bold">Unreviewed Appraisals</Text>
          <Text as="div" fontSize="3xl" fontWeight="800" color="orange.500" mt={1}>
            {loading ? <Spinner size="sm"/> : summary?.total_evaluations ?? 0}
          </Text>
          <Text fontSize="11px" color="gray.400" mt={1}>Forms requiring academic grading actions</Text>
        </Box>
        
        <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="11px" color="gray.400" textTransform="uppercase" fontWeight="bold">Active Training Placements</Text>
          <Text as="div" fontSize="3xl" fontWeight="800" color="green.500" mt={1}>
            {loading ? <Spinner size="sm"/> : summary?.active_placements ?? 0}
          </Text>
          <Text fontSize="11px" color="gray.400" mt={1}>Students currently verified in host companies</Text>
        </Box>
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={4}>
        {/* Logbook Status Graph */}
        <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontWeight="700" fontSize="sm" color="gray.700" mb={2}>Logbook Status Share</Text>
          {loading ? (
            <Center h="200px"><Spinner color="teal.500" /></Center>
          ) : logStatusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={logStatusPieData} dataKey="value" cx="50%" cy="50%" outerRadius={65}>
                  {logStatusPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COMPLIANCE_COLORS[index % COMPLIANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Center h="200px"><Text color="gray.300" fontSize="xs">No structural logs recorded yet.</Text></Center>
          )}
        </Box>

        {/* Progress Bars Stream Metrics */}
        <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontWeight="700" fontSize="sm" color="gray.700" mb={4}>Placement Performance By Class/Course Stream</Text>
          {loading ? (
            <Center h="150px"><Spinner color="teal.500" /></Center>
          ) : breakdown.length > 0 ? (
            <Box overflowY="auto" maxH="240px" pr={2}>
              {breakdown.map((stream, idx) => {
                const total = stream.total_students ?? 0;
                const placed = stream.total_placements ?? stream.active_placements ?? 0;
                const rate = total > 0 ? Math.round((placed / total) * 100) : 0;

                return (
                  <Box key={idx} mb={4} borderBottom="1px solid" borderColor="gray.50" pb={3}>
                    <Flex justify="space-between" mb={1} align="center">
                      <Text fontSize="xs" fontWeight="600" color="gray.700">{stream.department || 'General Stream'}</Text>
                      <Text fontSize="xs" fontWeight="bold" color="teal.600" ml="auto">{placed}/{total} Placed ({rate}%)</Text>
                    </Flex>
                    <Progress value={rate} size="xs" colorScheme={rate > 75 ? 'green' : rate > 40 ? 'blue' : 'orange'} borderRadius="full" />
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Center h="150px"><Text color="gray.400">No allocated student streams mapped.</Text></Center>
          )}
        </Box>
      </Grid>
    </Box>
  )
}