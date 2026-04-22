import { Alert, AlertIcon } from '@chakra-ui/react'

function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <Alert status="error" borderRadius="lg" mb={4} fontSize="sm">
      <AlertIcon />{message}
    </Alert>
  )
}

export default ErrorAlert