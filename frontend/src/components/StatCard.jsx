import { Box, Stat, StatLabel, StatNumber, StatHelpText, Icon, HStack } from '@chakra-ui/react'

function StatCard({ label, value, helpText, icon, color = 'brand.600', isLoading }) {
  return (
    <Box
      bg="white" borderRadius="xl" p={5}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.06)"
      _hover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <HStack justify="space-between" align="flex-start">
        <Stat>
          <StatLabel fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">
            {label}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="700" color={color} mt={1}>
            {isLoading ? '—' : value ?? '—'}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" mt={1} color="gray.400">{helpText}</StatHelpText>
          )}
        </Stat>
        {icon && (
          <Box p={2} bg={`${color.split('.')[0]}.50`} borderRadius="lg">
            <Icon as={icon} boxSize={5} color={color} />
          </Box>
        )}
      </HStack>
    </Box>
  )
}

export default StatCard