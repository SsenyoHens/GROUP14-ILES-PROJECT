import { Box, Icon, Text, Button } from '@chakra-ui/react'

function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <Box textAlign="center" py={12} px={6}>
      {icon && (
        <Box mb={4} color="gray.300">
          <Icon as={icon} boxSize={12} />
        </Box>
      )}
      <Text fontWeight="600" fontSize="md" color="gray.600" mb={1}>{title}</Text>
      {message && <Text fontSize="sm" color="gray.400" mb={4}>{message}</Text>}
      {actionLabel && onAction && (
        <Button size="sm" bg="brand.600" color="white"
          _hover={{ bg: 'brand.700' }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

export default EmptyState