import {
  Box, VStack, Text, Flex, Icon, Tooltip,
  Divider, Avatar, HStack, Badge,
} from '@chakra-ui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdPeople, MdWork, MdAssignment,
  MdBarChart, MdManageAccounts, MdLogout,
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Dashboard',            path: '/dashboard',   icon: MdDashboard      },
  { label: 'Student Registration', path: '/students',    icon: MdPeople         },
  { label: 'Placements',           path: '/placements',  icon: MdWork           },
  { label: 'Evaluations',          path: '/evaluations', icon: MdAssignment     },
  { label: 'Reports',              path: '/reports',     icon: MdBarChart       },
  { label: 'User Accounts',        path: '/users',       icon: MdManageAccounts },
]

function NavItem({ item, isActive }) {
  return (
    <Tooltip label={item.label} placement="right" hasArrow>
      <Flex
        as={Link} to={item.path}
        align="center" gap={3} px={4} py={3}
        borderRadius="md" w="100%" cursor="pointer"
        bg={isActive ? 'sidebar.active' : 'transparent'}
        borderLeft={isActive ? '3px solid' : '3px solid transparent'}
        borderColor={isActive ? 'brand.400' : 'transparent'}
        color={isActive ? 'white' : 'sidebar.text'}
        _hover={{ bg: 'sidebar.hover', color: 'white', textDecoration: 'none' }}
        transition="all 0.15s"
      >
        <Icon as={item.icon} boxSize={5} flexShrink={0} />
        <Text fontSize="sm" fontWeight={isActive ? '600' : '400'} noOfLines={1}>
          {item.label}
        </Text>
      </Flex>
    </Tooltip>
  )
}

function Sidebar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Box
      w="240px" minH="100vh" flexShrink={0}
      bg="sidebar.bg"
      borderRight="1px solid" borderColor="sidebar.border"
      display="flex" flexDirection="column"
      position="sticky" top={0} h="100vh" overflowY="auto"
    >
      {/* Logo */}
      <Box px={5} py={6} borderBottom="1px solid" borderColor="sidebar.border">
        <Text fontSize="xl" fontWeight="800" color="brand.300" letterSpacing="widest" fontFamily="heading">
          ILES
        </Text>
        <Text fontSize="10px" color="sidebar.text" mt={1} textTransform="uppercase" letterSpacing="wider">
          Login / Registrar Portal
        </Text>
      </Box>

      {/* Nav */}
      <VStack spacing={1} px={2} py={4} flex={1} align="stretch">
        <Text fontSize="10px" color="sidebar.text" px={3} mb={1}
          textTransform="uppercase" letterSpacing="wider" opacity={0.6}>
          Main Menu
        </Text>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
          />
        ))}
      </VStack>

      {/* Bottom user area */}
      <Box px={3} py={4} borderTop="1px solid" borderColor="sidebar.border">
        <HStack spacing={3} mb={3} px={2}>
          <Avatar size="sm" name={user?.name} bg="brand.600" color="white" />
          <Box minW={0}>
            <Text fontSize="sm" color="white" fontWeight="600" noOfLines={1}>
              {user?.name || 'Admin'}
            </Text>
            <Text fontSize="10px" color="sidebar.text" noOfLines={1}>
              {user?.role || 'Registrar'}
            </Text>
          </Box>
        </HStack>
        <Flex
          align="center" gap={3} px={3} py={2}
          borderRadius="md" cursor="pointer" color="sidebar.text"
          _hover={{ bg: 'sidebar.hover', color: '#fc8181' }}
          transition="all 0.15s"
          onClick={handleLogout}
        >
          <Icon as={MdLogout} boxSize={4} />
          <Text fontSize="sm">Logout</Text>
        </Flex>
      </Box>
    </Box>
  )
}

export default Sidebar