import {
  Box, Flex, Text, HStack, Badge, Icon,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
} from '@chakra-ui/react'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { MdChevronRight } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

// Map routes to readable breadcrumb names
const ROUTE_LABELS = {
  '/dashboard':   'Dashboard',
  '/students':    'Student Registration',
  '/placements':  'Placements',
  '/evaluations': 'Evaluations',
  '/reports':     'Reports',
  '/users':       'User Accounts',
  '/login':       'Sign In',
  '/register':    'Register',
}

const SESSION = '2025/26'

function Navbar({ minimal = false }) {
  const location  = useLocation()
  const { user }  = useAuth()
  const pageLabel = ROUTE_LABELS[location.pathname] || 'ILES'

  return (
    <Box
      h="56px" px={6} flexShrink={0}
      bg="white"
      borderBottom="1px solid" borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
      zIndex={50}
    >
      <Flex h="100%" align="center" justify="space-between">

        {/* Left — breadcrumb (admin) or logo (public pages) */}
        {minimal ? (
          /* Public pages — show ILES logo text */
          <HStack spacing={2}>
            <Text
              fontSize="lg" fontWeight="800"
              color="brand.600" letterSpacing="widest"
              fontFamily="heading"
            >
              ILES
            </Text>
            <Text fontSize="xs" color="gray.400"
              display={{ base: 'none', md: 'block' }}>
              Internship logging & Evaluation System
            </Text>
          </HStack>
        ) : (
          /* Admin pages — breadcrumb */
          <Breadcrumb
            spacing={2}
            separator={<Icon as={MdChevronRight} color="gray.400" boxSize={4} />}
          >
            <BreadcrumbItem>
              <BreadcrumbLink
                as={RouterLink} to="/dashboard"
                fontSize="sm" color="gray.400"
                _hover={{ color: 'brand.600' }}
              >
                ILES
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink
                fontSize="sm" fontWeight="600" color="gray.700"
                cursor="default" _hover={{ textDecoration: 'none' }}
              >
                {pageLabel}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        )}

        {/* Right — session badge + user info */}
        <HStack spacing={3}>
          <Badge
            bg="brand.50" color="brand.700"
            border="1px solid" borderColor="brand.100"
            borderRadius="full" px={3} py={1}
            fontSize="11px" fontWeight="600"
            letterSpacing="wide"
          >
            {SESSION}
          </Badge>

          {user && (
            <HStack
              spacing={2}
              px={3} py={1}
              bg="gray.50"
              borderRadius="full"
              border="1px solid" borderColor="gray.200"
            >
              <Box
                w="22px" h="22px" borderRadius="full"
                bg="brand.600" color="white"
                display="flex" alignItems="center" justifyContent="center"
                fontSize="10px" fontWeight="700"
              >
                {user.name?.[0]?.toUpperCase() || 'A'}
              </Box>
              <Text fontSize="xs" fontWeight="500" color="gray.600"
                display={{ base: 'none', md: 'block' }}>
                {user.name}
              </Text>
              <Badge
                fontSize="9px" colorScheme="green"
                borderRadius="full" px={2} textTransform="capitalize"
                display={{ base: 'none', md: 'block' }}
              >
                {user.role?.replace('_', ' ')}
              </Badge>
            </HStack>
          )}
        </HStack>

      </Flex>
    </Box>
  )
}

export default Navbar