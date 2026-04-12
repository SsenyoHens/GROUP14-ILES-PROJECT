import { Box, Text, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react'

function StatCard({ label, value, note, color = 'brand.700' }) {
  return (
    <Box bg="white" borderRadius="lg" p={5} border="1px solid" borderColor="gray.100"
      boxShadow="sm" _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }}
      transition="all 0.2s">
      <Stat>
        <StatLabel fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">
          {label}
        </StatLabel>
        <StatNumber fontSize="3xl" fontWeight="700" color={color} mt={1}>
          {value}
        </StatNumber>
        {note && <StatHelpText fontSize="xs" mt={1}>{note}</StatHelpText>}
      </Stat>
    </Box>
  )
}

export default StatCard