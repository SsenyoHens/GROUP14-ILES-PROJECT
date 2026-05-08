import { useEffect, useState } from 'react'
import {
  Box, Grid, GridItem, Text, Select, HStack,
  Spinner, Center, Alert, AlertIcon, VStack,
} from '@chakra-ui/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import PageHeader from '../../components/PageHeader'
import { reportService } from '../../api/services'

function ChartCard({ title, children, isLoading }) {
  return (
    <Box bg="white" borderRadius="xl" p={5} border="1px solid" borderColor="gray.100" boxShadow="sm">
      <Text fontWeight="700" fontSize="sm" color="gray.700" mb={4} fontFamily="heading">{title}</Text>
      {isLoading
        ? <Center h="200px"><Spinner color="brand.500" /></Center>
        : children}
    </Box>
  )
}

const COLORS = ['#16a872', '#3182ce', '#ed8936', '#9f7aea', '#e53e3e']

function Reports() {
  const [summary,   setSummary]   = useState(null)
  const [trend,     setTrend]     = useState([])
  const [byDept,    setByDept]    = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [session,   setSession]   = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true); setError('')
      try {
        const [s, t, d, b] = await Promise.all([
          reportService.getSummary(),
          reportService.getPlacementTrend(),
          reportService.getByDept(),
          reportService.getStatusBreakdown(),
        ])
        setSummary(s.data)
        setTrend(t.data)
        setByDept(d.data)
        setBreakdown(b.data)
      } catch { setError('Could not load report data.') }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [session])

  return (
    <Box>
      <PageHeader title="Reports & Analytics" subtitle="Internship programme performance overview">
        <Select maxW="160px" size="sm" bg="white" borderRadius="lg"
          value={session} onChange={(e) => setSession(e.target.value)}>
          <option value="">All Sessions</option>
          <option value="2025">2025/26</option>
          <option value="2024">2024/25</option>
        </Select>
      </PageHeader>

      {error && <Alert status="error" borderRadius="lg" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(3,1fr)' }} gap={4} mb={4}>
        {[
          { label: 'Total Registered',  value: summary?.totalRegistered  },
          { label: 'Placement Rate',    value: summary?.placementRate ? `${summary.placementRate}%` : undefined },
          { label: 'Average Grade',     value: summary?.averageGrade     },
        ].map((item) => (
          <Box key={item.label} bg="white" borderRadius="xl" p={4}
            border="1px solid" borderColor="gray.100" boxShadow="sm">
            <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={1}>
              {item.label}
            </Text>
            <Text fontSize="2xl" fontWeight="700" color="brand.600">
              {loading ? '—' : item.value ?? '—'}
            </Text>
          </Box>
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={4} mb={4}>
        <ChartCard title="Placement Trend" isLoading={loading}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="placed" stroke="#16a872" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Breakdown" isLoading={loading}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={breakdown} dataKey="value" cx="50%" cy="50%"
                outerRadius={70} fontSize={11}>
                {breakdown.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      <ChartCard title="Students by Department" isLoading={loading}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byDept} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={120} />
            <Tooltip />
            <Bar dataKey="count" fill="#0e8a5e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </Box>
  )
}

export default Reports