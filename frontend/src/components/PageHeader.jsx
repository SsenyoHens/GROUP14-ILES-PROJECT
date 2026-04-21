import { Box, Heading, Text, HStack } from '@chakra-ui/react'

function PageHeader({ title, subtitle, children }) {
  return (
    <HStack justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
      <Box>
        <Heading size="md" color="gray.800" fontFamily="heading">{title}</Heading>
        {subtitle && <Text fontSize="sm" color="gray.500" mt={1}>{subtitle}</Text>}
      </Box>
      {children}
    </HStack>
  )
}

export default PageHeader