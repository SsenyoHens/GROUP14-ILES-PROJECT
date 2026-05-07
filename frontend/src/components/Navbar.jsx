import {
  Box,
  Flex,
  Text,
  HStack,
  Link as ChakraLink,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronDownIcon } from '@chakra-ui/icons'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/students', label: 'Students' },
  { path: '/supervisors', label: 'Supervisors' },
  { path: '/placements', label: 'Placements' },
  { path: '/reports', label: 'Reports' },
]

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
          <Text
            fontSize="xl"
            fontWeight="800"
            letterSpacing="widest"
            color="blue.300"
          >
            ILES
          </Text>

          <Text
            fontSize="xs"
            color="blue.200"
            display={{ base: 'none', md: 'block' }}
          >
            Admin Portal
          </Text>
        </HStack>

        {/* Nav links */}
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path

            return (
              <ChakraLink
                as={Link}
                to={link.path}
                key={link.path}
                px={4}
                py={2}
                borderRadius="md"
                fontSize="sm"
                color={isActive ? 'blue.200' : 'blue.300'}
                bg={isActive ? 'whiteAlpha.100' : 'transparent'}
                fontWeight={isActive ? '600' : '400'}
                _hover={{
                  bg: 'whiteAlpha.100',
                  color: 'white',
                  textDecoration: 'none',
                }}
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
                name={user?.name || 'Admin'}
                bg="blue.400"
                color="white"
              />

              <Text
                fontSize="sm"
                color="blue.100"
                display={{ base: 'none', md: 'block' }}
              >
                {user?.name || 'Admin'}
              </Text>
            </HStack>
          </MenuButton>

          <MenuList>
            <MenuItem fontSize="sm" isDisabled>
              {user?.email}
            </MenuItem>

            <MenuDivider />

            <MenuItem
              fontSize="sm"
              color="red.500"
              onClick={handleLogout}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>

      </Flex>
    </Box>
  )
}

export default Navbar