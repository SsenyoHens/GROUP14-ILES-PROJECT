import {
  Box, VStack, Text, Flex, Icon, Tooltip,
  Avatar, HStack,
} from '@chakra-ui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdPeople, MdStar,
  MdCalendarToday, MdPerson, MdLogout, MdNotifications,
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

// ✅ All paths are absolute
const navItems = [
  { label: 'Dashboard',     path: '/workplace/dashboard',     icon: MdDashboard     },
  { label: 'My Students',   path: '/workplace/students',      icon: MdPeople        },
  { label: 'Evaluations',   path: '/workplace/evaluations',   icon: MdStar          },
  { label: 'Attendance',    path: '/workplace/attendance',    icon: MdCalendarToday },
  { label: 'My Profile',    path: '/workplace/profile',       icon: MdPerson        },
  { label: 'Notifications', path: '/workplace/notifications', icon: MdNotifications },
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

export default function WorkplaceSupervisorSidebar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logoutUser } = useAuth()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Supervisor'
    : 'Supervisor'

  return (
    <Box
      w="240px" minH="100vh" flexShrink={0}
      bg="sidebar.bg"
      borderRight="1px solid" borderColor="sidebar.border"
      display="flex" flexDirection="column"
      position="sticky" top={0} h="100vh" overflowY="auto"
    >
      <Box px={5} py={6} borderBottom="1px solid" borderColor="sidebar.border">
        <Text fontSize="xl" fontWeight="800" color="brand.300"
          letterSpacing="widest" fontFamily="heading">ILES</Text>
        <Text fontSize="10px" color="sidebar.text" mt={1}
          textTransform="uppercase" letterSpacing="wider">Workplace Supervisor</Text>
      </Box>

      <VStack spacing={1} px={2} py={4} flex={1} align="stretch">
        <Text fontSize="10px" color="sidebar.text" px={3} mb={1}
          textTransform="uppercase" letterSpacing="wider" opacity={0.6}>Main Menu</Text>
        {navItems.map(item => (
          <NavItem key={item.path} item={item}
            isActive={location.pathname === item.path ||
                      location.pathname.startsWith(item.path + '/')} />
        ))}
      </VStack>

      <Box px={3} py={4} borderTop="1px solid" borderColor="sidebar.border">
        <HStack spacing={3} mb={3} px={2}>
          <Avatar size="sm" name={displayName} bg="brand.600" color="white" />
          <Box minW={0}>
            <Text fontSize="sm" color="white" fontWeight="600" noOfLines={1}>{displayName}</Text>
            <Text fontSize="10px" color="sidebar.text" noOfLines={1}>Workplace Supervisor</Text>
          </Box>
        </HStack>
        <Flex align="center" gap={3} px={3} py={2} borderRadius="md" cursor="pointer"
          color="sidebar.text" _hover={{ bg: 'sidebar.hover', color: '#fc8181' }}
          transition="all 0.15s" onClick={handleLogout}>
          <Icon as={MdLogout} boxSize={4} />
          <Text fontSize="sm">Sign out</Text>
        </Flex>
      </Box>
    </Box>
  )
}