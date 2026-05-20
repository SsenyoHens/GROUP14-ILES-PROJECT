import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Flex, Text, Icon, Badge, VStack, HStack,
  Spinner, Popover, PopoverTrigger, PopoverContent,
  PopoverBody, PopoverHeader, PopoverArrow,
  Button, IconButton,
} from '@chakra-ui/react'
import {
  MdNotifications, MdCheckCircle, MdSchedule,
  MdWarning, MdBook, MdPerson, MdWork,
  MdStar, MdAssignment,
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

// ── Icon mapping ──────────────────────────────────────────────────────────────
const ICON_MAP = {
  check:      { icon: MdCheckCircle, color: 'green'  },
  warning:    { icon: MdWarning,     color: 'red'    },
  book:       { icon: MdBook,        color: 'orange' },
  person:     { icon: MdPerson,      color: 'brand'  },
  work:       { icon: MdWork,        color: 'blue'   },
  star:       { icon: MdStar,        color: 'purple' },
  assignment: { icon: MdAssignment,  color: 'purple' },
  schedule:   { icon: MdSchedule,    color: 'orange' },
}

function timeAgo(isoString) {
  if (!isoString) return ''
  const now  = new Date()
  const then = new Date(isoString)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return then.toLocaleDateString()
}

function NotificationItem({ n }) {
  const cfg   = ICON_MAP[n.icon] || ICON_MAP.schedule
  const color = n.color || cfg.color

  return (
    <Flex gap={3} p={3} borderRadius="lg"
      bg={n.read ? 'transparent' : `${color}.50`}
      border="1px solid"
      borderColor={n.read ? 'transparent' : `${color}.100`}
      _hover={{ bg: 'gray.50' }} transition="all 0.1s">
      <Flex w="36px" h="36px" borderRadius="xl" flexShrink={0}
        bg={`${color}.100`} align="center" justify="center">
        <Icon as={cfg.icon} color={`${color}.600`} boxSize={4} />
      </Flex>
      <Box flex={1} minW={0}>
        <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={1}>
          {n.title}
        </Text>
        <Text fontSize="11px" color="gray.500" noOfLines={2} mt={0.5} lineHeight="1.4">
          {n.message}
        </Text>
        <Text fontSize="10px" color="gray.400" mt={1}>{timeAgo(n.time)}</Text>
      </Box>
      {!n.read && (
        <Box w="7px" h="7px" borderRadius="full"
          bg={`${color}.500`} flexShrink={0} mt={1} />
      )}
    </Flex>
  )
}

export default function NotificationBell({ homePath = '' }) {
  const [notifications, setNotifications] = useState([])
  const [unread,        setUnread]        = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [open,          setOpen]          = useState(false)
  const navigate    = useNavigate()
  const intervalRef = useRef(null)

  const fetchCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/count/')
      setUnread(res.data.unread_count ?? 0)
    } catch {}
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications/')
      setNotifications(res.data.notifications ?? [])
      setUnread(res.data.unread_count ?? 0)
    } catch {}
    finally { setLoading(false) }
  }, [])

  // Poll count every 60s
  useEffect(() => {
    fetchCount()
    intervalRef.current = setInterval(fetchCount, 60000)
    return () => clearInterval(intervalRef.current)
  }, [fetchCount])

  const handleOpen = async () => {
    setOpen(true)
    await fetchAll()
  }

  const BellTrigger = (
    <Box position="relative" cursor="pointer" onClick={handleOpen}>
      <Flex w="36px" h="36px" borderRadius="xl" align="center" justify="center"
        _hover={{ bg: 'whiteAlpha.200' }} transition="all 0.15s">
        <Icon as={MdNotifications} boxSize={5} color="white" />
      </Flex>
      {unread > 0 && (
        <Badge
          position="absolute" top="-4px" right="-4px"
          bg="red.500" color="white" borderRadius="full"
          fontSize="9px" minW="18px" h="18px"
          display="flex" alignItems="center" justifyContent="center"
          border="2px solid" borderColor="brand.600"
        >
          {unread > 9 ? '9+' : unread}
        </Badge>
      )}
    </Box>
  )

  return (
    <Popover
      isOpen={open}
      onClose={() => setOpen(false)}
      placement="bottom-end"
      closeOnBlur
    >
      <PopoverTrigger>{BellTrigger}</PopoverTrigger>
      <PopoverContent
        w="360px" borderRadius="xl"
        boxShadow="0 10px 40px rgba(0,0,0,0.15)"
        border="1px solid" borderColor="gray.100"
        _focus={{ outline: 'none' }}
      >
        <PopoverArrow />
        <PopoverHeader px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Text fontWeight="700" fontSize="sm" color="gray.800">
                Notifications
              </Text>
              {unread > 0 && (
                <Badge colorScheme="red" borderRadius="full" fontSize="10px" px={2}>
                  {unread} new
                </Badge>
              )}
            </HStack>
            <Button size="xs" variant="ghost" colorScheme="brand" fontSize="11px"
              onClick={() => {
                setOpen(false)
                navigate(`${homePath}/notifications`)
              }}>
              See all
            </Button>
          </Flex>
        </PopoverHeader>

        <PopoverBody px={2} py={2} maxH="420px" overflowY="auto">
          {loading
            ? (
              <Flex justify="center" py={8}>
                <Spinner size="md" color="brand.500" />
              </Flex>
            )
            : notifications.length > 0
              ? (
                <VStack spacing={1} align="stretch">
                  {notifications.slice(0, 10).map(n => (
                    <NotificationItem key={n.id} n={n} />
                  ))}
                  {notifications.length > 10 && (
                    <Button size="xs" variant="ghost" w="full" mt={1} color="gray.500"
                      onClick={() => {
                        setOpen(false)
                        navigate(`${homePath}/notifications`)
                      }}>
                      View all {notifications.length} notifications
                    </Button>
                  )}
                </VStack>
              )
              : (
                <Flex direction="column" align="center" py={8} gap={2}>
                  <Icon as={MdNotifications} boxSize={8} color="gray.200" />
                  <Text fontSize="sm" color="gray.400">No notifications</Text>
                </Flex>
              )
          }
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}