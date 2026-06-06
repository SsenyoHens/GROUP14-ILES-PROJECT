import { Box, Flex, Heading, Text, Button, Icon } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { MdSearchOff } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../constants'

function NotFound() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const goHome = () => {
    const home = user ? (ROLE_HOME[user.role] || '/login') : '/login'
    navigate(home, { replace: true })
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box textAlign="center" maxW="400px" p={8}>
        <Icon as={MdSearchOff} boxSize={16} color="gray.300" mb={4} />
        <Heading size="xl" color="gray.700" fontFamily="heading" mb={2}>404</Heading>
        <Heading size="md" color="gray.600" fontFamily="heading" mb={3}>
          Page Not Found
        </Heading>
        <Text fontSize="sm" color="gray.400" mb={6}>
          The page you're looking for doesn't exist or you don't have permission to view it.
        </Text>
        <Button bg="brand.600" color="white" _hover={{ bg: 'brand.700' }}
          borderRadius="lg" onClick={goHome}>
          Go to Dashboard
        </Button>
      </Box>
    </Flex>
  )
}

export default NotFound