import { Box, Flex, VStack, Text, Icon, Avatar, Divider, Tooltip } from '@chakra-ui/react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  MdDashboard, MdWork, MdAssignment,
  MdBook, MdPerson, MdLogout,
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { label: 'Dashboard',    icon: MdDashboard,  to: '/student/dashboard'   },
  { label: 'My Placement', icon: MdWork,       to: '/student/placement'   },
  { label: 'Evaluations',  icon: MdAssignment, to: '/student/evaluations' },
  { label: 'Logbook',      icon: MdBook,       to: '/student/logbook'     },
  { label: 'My Profile',   icon: MdPerson,     to: '/student/profile'     },
]

function SidebarLink({ to, icon, label }) {
  const location = useLocation()
  const active   = location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <Tooltip label={label} placement="right" hasArrow openDelay={600}>
      <Box
        as={NavLink}
        to={to}
        w="full"
        display="flex"
        alignItems="center"
        gap={3}
        px={3}
        py={2.5}
        borderRadius="xl"
        fontSize="sm"
        fontWeight={active ? '700' : '500'}
        color={active ? 'brand.600' : 'gray.500'}
        bg={active ? 'brand.50' : 'transparent'}
        _hover={{ bg: active ? 'brand.50' : 'gray.100', color: active ? 'brand.600' : 'gray.700' }}
        transition="all 0.15s"
        textDecoration="none"
      >
        <Icon as={icon} boxSize={5} flexShrink={0} />
        <Text noOfLines={1}>{label}</Text>
        {active && (
          <Box ml="auto" w="4px" h="16px" bg="brand.500" borderRadius="full" />
        )}
      </Box>
    </Tooltip>
  )
}

export default function StudentSidebar() {
  const { user, logout } = useAuth()

  return (
    <Box
      w="220px"
      minW="220px"
      bg="white"
      h="100vh"
      position="sticky"
      top={0}
      borderRight="1px solid"
      borderColor="gray.100"
      display="flex"
      flexDirection="column"
      py={5}
      px={3}
      boxShadow="1px 0 4px rgba(0,0,0,0.03)"
    >
      {/* Logo / brand */}
      <Flex align="center" gap={2} px={2} mb={6}>
        <Box
          w="32px" h="32px" borderRadius="lg"
          bg="brand.600" display="flex" alignItems="center" justifyContent="center"
          flexShrink={0}
        >
          <Text color="white" fontWeight="800" fontSize="sm">IP</Text>
        </Box>
        <Box>
          <Text fontSize="12px" fontWeight="700" color="gray.800" lineHeight={1}>Intern Portal</Text>
          <Text fontSize="10px" color="brand.500" fontWeight="600">Student</Text>
        </Box>
      </Flex>

      {/* Navigation links */}
      <VStack spacing={1} align="stretch" flex={1}>
        {LINKS.map(l => <SidebarLink key={l.to} {...l} />)}
      </VStack>

      <Divider my={3} />

      {/* User info + logout */}
      <Box px={1}>
        <Flex align="center" gap={2} mb={3}>
          <Avatar size="sm" name={user?.name} bg="brand.600" color="white" fontSize="xs" />
          <Box minW={0}>
            <Text fontSize="xs" fontWeight="600" color="gray.700" noOfLines={1}>{user?.name}</Text>
            <Text fontSize="10px" color="gray.400" noOfLines={1}>{user?.registration_number}</Text>
          </Box>
        </Flex>
        <Box
          as="button"
          onClick={logout}
          w="full"
          display="flex"
          alignItems="center"
          gap={2}
          px={3}
          py={2}
          borderRadius="xl"
          fontSize="sm"
          color="gray.400"
          _hover={{ bg: 'red.50', color: 'red.500' }}
          transition="all 0.15s"
        >
          <Icon as={MdLogout} boxSize={4} />
          <Text fontSize="xs">Sign out</Text>
        </Box>
      </Box>
    </Box>
  )
}