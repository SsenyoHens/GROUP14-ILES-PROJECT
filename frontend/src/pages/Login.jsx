import { useState, useContext } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  Box, Flex, VStack, Heading, Text, FormControl,
  FormLabel, Input, Button, Alert, AlertIcon,
  InputGroup, InputRightElement, IconButton, Link,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

function Login() {
  const { loginUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const success = await loginUser(email, password)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" bg="#0f1f2e">

      {/* ── Left branding panel ── */}
      <Flex
        flex={1} direction="column" justify="center" px={16}
        display={{ base: 'none', lg: 'flex' }}
        bg="linear-gradient(160deg, #0f1f2e 0%, #0d3d2a 100%)"
        borderRight="1px solid rgba(52,196,144,0.15)"
      >
        <Box
          display="inline-block" bg="brand.700" px={4} py={2}
          borderRadius="md" mb={6} w="fit-content"
        >
          <Text fontSize="3xl" fontWeight="900" color="white" letterSpacing="widest">
            ILES
          </Text>
        </Box>

        <Heading size="xl" color="white" fontFamily="heading" mb={4} lineHeight="1.25">
          Welcome<br />Back
        </Heading>

        <Text color="gray.400" fontSize="sm" maxW="320px" lineHeight="1.9">
          Sign in to your Internship Logging & Evaluation System account to
          continue managing your internship activities.
        </Text>

        {/* Decorative feature hints */}
        <VStack align="flex-start" mt={10} spacing={4}>
          {[
            'Track internship logbooks in real time',
            'Manage placements and evaluations',
            'Collaborate with supervisors seamlessly',
          ].map((hint) => (
            <Flex key={hint} align="center" gap={3}>
              <Box w="8px" h="8px" borderRadius="full" bg="brand.400" flexShrink={0} />
              <Text fontSize="sm" color="gray.400">{hint}</Text>
            </Flex>
          ))}
        </VStack>
      </Flex>

      {/* ── Right form panel ── */}
      <Flex
        flex={1} align="center" justify="center"
        px={{ base: 4, md: 8 }} py={8} bg="white" overflowY="auto"
      >
        <Box w="100%" maxW="400px">

          {/* Mobile logo */}
          <Text
            fontSize="2xl" fontWeight="900" color="brand.600"
            letterSpacing="widest" mb={6}
            display={{ base: 'block', lg: 'none' }}
          >
            ILES
          </Text>

          <Box mb={8}>
            <Heading size="md" color="gray.800" fontFamily="heading" mb={1}>
              Sign in to your account
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Enter your credentials to continue
            </Text>
          </Box>

          {error && (
            <Alert status="error" borderRadius="lg" fontSize="sm" mb={4}>
              <AlertIcon />{error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>

              {/* Email */}
              <FormControl>
                <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                  Email Address
                </FormLabel>
                <Input
                  size="sm" borderRadius="lg" bg="gray.50" type="email"
                  placeholder="you@institution.ac.ug"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  _focus={{ bg: 'white', borderColor: 'brand.400' }}
                  required
                />
              </FormControl>

              {/* Password */}
              <FormControl>
                <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                  Password
                </FormLabel>
                <InputGroup size="sm">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    borderRadius="lg" bg="gray.50"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    _focus={{ bg: 'white', borderColor: 'brand.400' }}
                    required
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost" size="xs" aria-label="Toggle password"
                      icon={showPw ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPw((p) => !p)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* Submit */}
              <Button
                type="submit" w="100%" mt={2}
                bg="brand.600" color="white" borderRadius="lg" size="md"
                _hover={{ bg: 'brand.700' }}
                isLoading={loading} loadingText="Signing in..."
              >
                Sign In
              </Button>

            </VStack>
          </form>

          <Text fontSize="sm" color="gray.500" textAlign="center" mt={6}>
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="brand.600" fontWeight="600">
              Create one
            </Link>
          </Text>

        </Box>
      </Flex>
    </Flex>
  )
}

export default Login