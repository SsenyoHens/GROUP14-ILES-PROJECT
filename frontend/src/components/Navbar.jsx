import {
  Box, Flex, Text, HStack,
  Avatar, Button, Menu, MenuButton, MenuList,
  MenuItem, MenuDivider, Icon,
} from '@chakra-ui/react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { ROUTES, ROLES } from '../constants'
import NotificationBell from './NotificationBell'

//Nav links are plain objects only — NotificationBell handled separately
const NAV_LINKS = {
  [ROLES.ADMIN]: [
    { path: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard'   },
    { path: ROUTES.STUDENTS,        label: 'Students'    },
    { path: ROUTES.PLACEMENTS,      label: 'Placements'  },
    { path: ROUTES.EVALUATIONS,     label: 'Evaluations' },
    { path: ROUTES.REPORTS,         label: 'Reports'     },
    { path: ROUTES.USERS,           label: 'Users'       },
  ],
  [ROLES.ACADEMIC_SUPERVISOR]: [
    { path: ROUTES.ACADEMIC_DASHBOARD,   label: 'Dashboard'   },
    { path: ROUTES.ACADEMIC_STUDENTS,    label: 'Students'    },
    { path: ROUTES.ACADEMIC_EVALUATIONS, label: 'Evaluations' },
    { path: ROUTES.ACADEMIC_REPORTS,     label: 'Reports'     },
  ],
  [ROLES.STUDENT]: [
    { path: ROUTES.STUDENT_DASHBOARD,   label: 'Dashboard'    },
    { path: ROUTES.STUDENT_PLACEMENT,   label: 'My Placement' },
    { path: ROUTES.STUDENT_LOGBOOK,     label: 'Logbook'      },
    { path: ROUTES.STUDENT_EVALUATIONS, label: 'Evaluations'  },
    { path: ROUTES.STUDENT_PROFILE,     label: 'My Profile'   },
  ],
  [ROLES.WORKPLACE_SUPERVISOR]: [
    { path: ROUTES.WORKPLACE_DASHBOARD,   label: 'Dashboard'   },
    { path: ROUTES.WORKPLACE_STUDENTS,    label: 'My Students' },
    { path: ROUTES.WORKPLACE_EVALUATIONS, label: 'Evaluations' },
    { path: ROUTES.WORKPLACE_ATTENDANCE,  label: 'Attendance'  },
    { path: ROUTES.WORKPLACE_PROFILE,     label: 'My Profile'  },
  ],
}


const NOTIFICATION_HOME = {
  [ROLES.ADMIN]:               '/admin',
  [ROLES.ACADEMIC_SUPERVISOR]: '/academic',
  [ROLES.STUDENT]:             '/student',
  [ROLES.WORKPLACE_SUPERVISOR]:'/workplace',
}

const PORTAL_LABEL = {
  [ROLES.ADMIN]:               'Admin Portal',
  [ROLES.ACADEMIC_SUPERVISOR]: 'Academic Supervisor Portal',
  [ROLES.STUDENT]:             'Student Portal',
  [ROLES.WORKPLACE_SUPERVISOR]:'Workplace Supervisor Portal',
}

export default function Navbar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logoutUser } = useAuth()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  const navLinks    = NAV_LINKS[user?.role]       || []
  const portalLabel = PORTAL_LABEL[user?.role]    || 'Portal'
  const homePath    = NOTIFICATION_HOME[user?.role] || ''

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : 'User'

  return (
    <Box
      bg="brand.700"
      px={7} h="60px"
      position="sticky" top={0} zIndex={100}
      boxShadow="0 2px 8px rgba(0,0,0,0.2)"
    >
      <Flex h="100%" align="center" justify="space-between">

        {/* Brand */}
        <HStack spacing={3}>
          <Text fontSize="xl" fontWeight="800" letterSpacing="widest" color="blue.300">
            ILES
          </Text>
          <Text fontSize="xs" color="blue.200" display={{ base: 'none', md: 'block' }}>
            {portalLabel}
          </Text>
        </HStack>

        {/* ✅ Nav links — plain objects only, no React elements */}
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.path ||
                             location.pathname.startsWith(link.path + '/')
            return (
              <Box
                as={Link} to={link.path}
                key={link.path}
                px={4} py={2}
                borderRadius="md"
                fontSize="sm"
                color={isActive ? 'white' : 'blue.200'}
                bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                fontWeight={isActive ? '600' : '400'}
                _hover={{ bg: 'whiteAlpha.100', color: 'white', textDecoration: 'none' }}
                transition="all 0.15s"
              >
                {link.label}
              </Box>
            )
          })}

          {/* ✅ NotificationBell as a separate element — not in the map */}
          {user && <NotificationBell homePath={homePath} />}
        </HStack>

        {/* User menu */}
        <Menu>
          <MenuButton
            as={Button} variant="ghost" px={2}
            _hover={{ bg: 'whiteAlpha.100' }}
            _active={{ bg: 'whiteAlpha.200' }}
            rightIcon={<ChevronDownIcon color="blue.200" />}
          >
            <HStack spacing={2}>
              <Avatar size="sm" name={displayName} bg="blue.400" color="white" />
              <Text fontSize="sm" color="blue.100" display={{ base: 'none', md: 'block' }}>
                {displayName}
              </Text>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem fontSize="sm" isDisabled>{user?.email}</MenuItem>
            <MenuItem fontSize="xs" isDisabled color="gray.400">
              {user?.role?.replace(/_/g, ' ').toUpperCase()}
            </MenuItem>
            <MenuDivider />
            <MenuItem fontSize="sm" color="red.500" onClick={handleLogout}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>

      </Flex>
    </Box>
  )
}