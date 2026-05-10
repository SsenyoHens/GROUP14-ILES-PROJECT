import {
  Box, Flex, Text, HStack, Link as ChakraLink,
  Avatar, Button, Menu, MenuButton, MenuList,
  MenuItem, MenuDivider,
} from '@chakra-ui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { ROUTES, ROLES } from '../constants'

// ── Nav links per role ─────────────────────────────────
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
    { path: ROUTES.STUDENTS,             label: 'Students'    },
    { path: ROUTES.ACADEMIC_EVALUATIONS, label: 'Evaluations' },
    { path: ROUTES.ACADEMIC_REPORTS,     label: 'Reports'     },
  ],
  [ROLES.STUDENT]: [
    { path: ROUTES.STUDENT_DASHBOARD,   label: 'Dashboard'   },
    { path: ROUTES.STUDENT_PLACEMENT,   label: 'My Placement' },
    { path: ROUTES.STUDENT_LOGBOOK,     label: 'Logbook'     },
    { path: ROUTES.STUDENT_EVALUATIONS, label: 'Evaluations' },
    { path: ROUTES.STUDENT_PROFILE,     label: 'My Profile'  },
  ],
  [ROLES.WORKPLACE_SUPERVISOR]: [
    { path: ROUTES.WORKPLACE_DASHBOARD,   label: 'Dashboard'   },
    { path: ROUTES.WORKPLACE_STUDENTS,    label: 'My Students' },
    { path: ROUTES.WORKPLACE_EVALUATIONS, label: 'Evaluations' },
    { path: ROUTES.WORKPLACE_ATTENDANCE,  label: 'Attendance'  },
    { path: ROUTES.WORKPLACE_PROFILE,     label: 'My Profile'  },
  ],
}

// ── Portal label per role ──────────────────────────────
const PORTAL_LABEL = {
  [ROLES.ADMIN]:               'Admin Portal',
  [ROLES.ACADEMIC_SUPERVISOR]: 'Academic Supervisor Portal',
  [ROLES.STUDENT]:             'Student Portal',
  [ROLES.WORKPLACE_SUPERVISOR]:'Workplace Supervisor Portal',
}

function Navbar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logoutUser } = useAuth()   // ✅ fixed: logoutUser not logout

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  // ✅ Get nav links based on user role
  const navLinks = NAV_LINKS[user?.role] || []
  const portalLabel = PORTAL_LABEL[user?.role] || 'Portal'

  // ✅ Display name from first_name/last_name
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : 'User'

  return (
    <Box
      bg="brand.700"
      px={7}
      h="60px"
      position="sticky"
      top={0}
      zIndex={100}
      boxShadow="0 2px 8px rgba(0,0,0,0.2)"
    >
      <Flex h="100%" align="center" justify="space-between">

        {/* Brand */}
        <HStack spacing={3}>
          <Text fontSize="xl" fontWeight="800" letterSpacing="widest" color="blue.300">
            ILES
          </Text>
          <Text fontSize="xs" color="blue.200" display={{ base: 'none', md: 'block' }}>
            {portalLabel}  {/* ✅ dynamic portal label */}
          </Text>
        </HStack>

        {/* Nav links — role aware */}
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <ChakraLink
                as={Link}
                to={link.path}
                key={link.path}
                px={4} py={2}
                borderRadius="md"
                fontSize="sm"
                color={isActive ? 'blue.200' : 'blue.300'}
                bg={isActive ? 'whiteAlpha.100' : 'transparent'}
                fontWeight={isActive ? '600' : '400'}
                _hover={{ bg: 'whiteAlpha.100', color: 'white', textDecoration: 'none' }}
                transition="all 0.15s"
              >
                {link.label}
              </ChakraLink>
            )
          })}
        </HStack>

        {/* User menu */}
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            px={2}
            _hover={{ bg: 'whiteAlpha.100' }}
            _active={{ bg: 'whiteAlpha.200' }}
            rightIcon={<ChevronDownIcon color="blue.200" />}
          >
            <HStack spacing={2}>
              <Avatar
                size="sm"
                name={displayName}   // ✅ fixed
                bg="blue.400"
                color="white"
              />
              <Text fontSize="sm" color="blue.100" display={{ base: 'none', md: 'block' }}>
                {displayName}        {/* ✅ fixed */}
              </Text>
            </HStack>
          </MenuButton>

          <MenuList>
            <MenuItem fontSize="sm" isDisabled>
              {user?.email}
            </MenuItem>
            <MenuItem fontSize="xs" isDisabled color="gray.400">
              {user?.role?.replace(/_/g, ' ').toUpperCase()}  {/* ✅ show role */}
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

export default Navbar