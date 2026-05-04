import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import {
  Box, Flex, VStack, Heading, Text, FormControl,
  FormLabel, Input, Button, FormErrorMessage,
  Alert, AlertIcon, InputGroup, InputRightElement,
  IconButton, Link
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    try {
      await login(data)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" bg="#0f1f2e">
      {/* Left panel */}
      <Flex
        flex={1} direction="column" justify="center" px={16}
        display={{ base: 'none', lg: 'flex' }}
        bg="linear-gradient(160deg, #0f1f2e 0%, #0d3d2a 100%)"
        borderRight="1px solid rgba(52,196,144,0.15)"
      >
        <Text fontSize="4xl" fontWeight="800" color="brand.300"
          fontFamily="heading" letterSpacing="widest" mb={4}>
          ILES
        </Text>
        <Heading size="lg" color="white" fontFamily="heading" mb={3} lineHeight="1.3">
          Internship Logging &<br />Evaluation System
        </Heading>
        <Text color="gray.400" fontSize="sm" maxW="320px" lineHeight="1.8">
          Manage student internship registrations, workplace placements,
          evaluations and academic reports — all in one place.
        </Text>
        <Box mt={10} p={4} borderRadius="lg"
          bg="rgba(52,196,144,0.08)" border="1px solid rgba(52,196,144,0.2)">
          <Text fontSize="xs" color="brand.300" fontWeight="600" mb={1}>
            LOGIN/ REGISTRAR PORTAL
          </Text>
          
        </Box>
      </Flex>

      {/* Right panel — login form */}
      <Flex flex={1} align="center" justify="center" px={8} bg="white">
        <Box w="100%" maxW="400px">
          <Heading size="lg" color="gray.800" fontFamily="heading" mb={1}>
            Sign In
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={8}>
            Enter your  credentials to continue
          </Text>

          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={5}>
              {apiError && (
                <Alert status="error" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  {apiError}
                </Alert>
              )}

              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="sm" color="gray.700">Email Address</FormLabel>
                <Input
                  type="email"
                  placeholder="you@institution.ac.ug"
                  size="lg" borderRadius="lg"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #16a872' }}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontSize="sm" color="gray.700">Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Your password"
                    borderRadius="lg" borderColor="gray.200"
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #16a872' }}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost" size="sm"
                      icon={showPw ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPw(!showPw)}
                      aria-label="Toggle password"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit" size="lg" w="100%"
                bg="brand.600" color="white"
                _hover={{ bg: 'brand.700' }}
                borderRadius="lg" isLoading={loading}
                loadingText="Signing in..."
                mt={2}
              >
                Sign In
              </Button>

              <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
                Don't have an account?{' '}
                <Link as={RouterLink} to="/register" color="brand.600" fontWeight="600">
                  Register here
                </Link>
              </Text>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Flex>
  )
}

export default Login