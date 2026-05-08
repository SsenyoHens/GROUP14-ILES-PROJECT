import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Button, Spinner, Alert, AlertIcon, AlertDescription,
  Textarea, Input, FormLabel,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, useToast,
} from '@chakra-ui/react'
import { MdBook, MdAdd, MdCheckCircle, MdSchedule, MdCalendarToday, MdEdit, MdSearch } from 'react-icons/md'
import api from '../../api/axiosInstance'

function useFetch(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await api.get(endpoint); setData(res.data) }
    catch (err) { setError(err.response?.data?.detail || err.message) }
    finally { setLoading(false) }
  }, [endpoint])
  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

const EMPTY = { date: '', activities: '', challenges: '', learning: '' }

function EntryModal({ isOpen, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [saving, setSaving] = useState(false)
  useEffect(() => { setForm(initial || EMPTY) }, [initial, isOpen])
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const handleSubmit = async () => {
    setSaving(true)
    try { await onSubmit(form); onClose() } finally { setSaving(false) }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader fontSize="md" fontWeight="700" pb={1}>{initial ? 'Edit Entry' : 'New Logbook Entry'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Date *</FormLabel>
              <Input type="date" size="sm" borderRadius="lg" bg="gray.50" value={form.date} onChange={set('date')} />
            </Box>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Activities Performed *</FormLabel>
              <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={4}
                placeholder="Describe what you did today…" value={form.activities} onChange={set('activities')} />
            </Box>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Challenges Faced</FormLabel>
              <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={2}
                placeholder="Any difficulties?" value={form.challenges} onChange={set('challenges')} />
            </Box>
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Key Learnings</FormLabel>
              <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={2}
                placeholder="What did you learn?" value={form.learning} onChange={set('learning')} />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose} borderRadius="lg">Cancel</Button>
          <Button size="sm" bg="brand.600" color="white" borderRadius="lg" _hover={{ bg: 'brand.700' }}
            isLoading={saving} onClick={handleSubmit} isDisabled={!form.date || !form.activities}>
            {initial ? 'Save Changes' : 'Add Entry'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function EntryCard({ entry, onEdit }) {
  return (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
      _hover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} transition="all 0.15s" overflow="hidden">
      <Flex px={4} py={3} justify="space-between" align="center"
        borderBottom="1px solid" borderColor="gray.50">
        <HStack spacing={2}>
          <Icon as={MdCalendarToday} boxSize={3.5} color="brand.400" />
          <Text fontSize="xs" fontWeight="700" color="gray.700">{entry.date}</Text>
        </HStack>
        <HStack spacing={2}>
          <Badge colorScheme={entry.approved ? 'green' : 'orange'} borderRadius="full" fontSize="9px" px={2}>
            <HStack spacing={1}>
              <Icon as={entry.approved ? MdCheckCircle : MdSchedule} boxSize={2.5} />
              <Text>{entry.approved ? 'Approved' : 'Pending'}</Text>
            </HStack>
          </Badge>
          <Button size="xs" variant="ghost" color="gray.400" _hover={{ color: 'brand.500' }} onClick={() => onEdit(entry)}>
            <Icon as={MdEdit} boxSize={3.5} />
          </Button>
        </HStack>
      </Flex>
      <Box px={4} py={3}>
        <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>Activities</Text>
        <Text fontSize="sm" color="gray.700" lineHeight="1.7" mb={3}>{entry.activities}</Text>
        {entry.challenges && (
          <>
            <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>Challenges</Text>
            <Text fontSize="sm" color="gray.600" lineHeight="1.7" mb={3}>{entry.challenges}</Text>
          </>
        )}
        {entry.learning && (
          <>
            <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>Key Learnings</Text>
            <Text fontSize="sm" color="gray.600" lineHeight="1.7">{entry.learning}</Text>
          </>
        )}
        {entry.supervisor_comment && (
          <Box mt={3} bg="blue.50" borderRadius="lg" p={3} borderLeft="3px solid" borderColor="blue.300">
            <Text fontSize="10px" color="blue.500" fontWeight="600" mb={1}>Supervisor Comment</Text>
            <Text fontSize="xs" color="blue.700">{entry.supervisor_comment}</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function Logbook() {
  // API expects: array of { id, date, activities, challenges, learning, approved, supervisor_comment }
  const { data, loading, error, refetch } = useFetch('/student/logbook/')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const toast = useToast()

  const entries = data ?? []
  const filtered = entries.filter(e =>
    !search || e.activities?.toLowerCase().includes(search.toLowerCase()) || e.date?.includes(search)
  )

  const handleNew  = () => { setEditing(null); onOpen() }
  const handleEdit = (e) => { setEditing(e); onOpen() }

  const handleSubmit = async (form) => {
    try {
      if (editing?.id) {
        await api.put(`/student/logbook/${editing.id}/`, form)
        toast({ title: 'Entry updated', status: 'success', duration: 3000, isClosable: true })
      } else {
        await api.post('/student/logbook/', form)
        toast({ title: 'Entry added', status: 'success', duration: 3000, isClosable: true })
      }
      refetch()
    } catch (err) {
      toast({ title: 'Failed to save', description: err.message, status: 'error', duration: 4000, isClosable: true })
      throw err
    }
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">Logbook</Text>
          <Text fontSize="sm" color="gray.400">
            {loading ? 'Loading…' : `${entries.length} entries · ${entries.filter(e => e.approved).length} approved`}
          </Text>
        </Box>
        <HStack spacing={3}>
          <Box position="relative">
            <Icon as={MdSearch} position="absolute" left={2} top="50%"
              transform="translateY(-50%)" color="gray.300" boxSize={4} pointerEvents="none" />
            <Input pl={8} size="sm" borderRadius="lg" bg="white" w="180px"
              placeholder="Search entries…" border="1px solid" borderColor="gray.200"
              value={search} onChange={e => setSearch(e.target.value)}
              _focus={{ borderColor: 'brand.400' }} />
          </Box>
          <Button size="sm" leftIcon={<Icon as={MdAdd} />} bg="brand.600" color="white"
            borderRadius="lg" _hover={{ bg: 'brand.700' }} fontSize="xs" onClick={handleNew}>
            Add Entry
          </Button>
        </HStack>
      </Flex>

      {/* Stats */}
      <Grid templateColumns="1fr 1fr 1fr" gap={4} mb={6}>
        {[
          { label: 'Total Entries', value: entries.length,                          color: 'brand'  },
          { label: 'Approved',      value: entries.filter(e => e.approved).length,  color: 'green'  },
          { label: 'Pending',       value: entries.filter(e => !e.approved).length, color: 'orange' },
        ].map(s => (
          <Box key={s.label} bg="white" borderRadius="xl" p={4}
            border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{s.label}</Text>
            <Text fontSize="xl" fontWeight="800" color={`${s.color}.500`} mt={1}>{s.value}</Text>
          </Box>
        ))}
      </Grid>

      {error && (
        <Alert status="error" borderRadius="xl" mb={4}>
          <AlertIcon /><AlertDescription>{error}</AlertDescription>
          <Button size="xs" ml={3} onClick={refetch} colorScheme="red" variant="outline">Retry</Button>
        </Alert>
      )}

      {loading
        ? <Flex justify="center" align="center" minH="40vh"><Spinner size="lg" color="brand.500" /></Flex>
        : filtered.length === 0
          ? (
            <Flex direction="column" align="center" justify="center" minH="40vh" gap={3}>
              <Icon as={MdBook} boxSize={14} color="gray.200" />
              <Text color="gray.400" fontWeight="600">
                {search ? 'No entries match your search' : 'No logbook entries yet'}
              </Text>
              {!search && (
                <Button size="sm" colorScheme="brand" onClick={handleNew} leftIcon={<Icon as={MdAdd} />}>
                  Add your first entry
                </Button>
              )}
            </Flex>
          )
          : <VStack spacing={4} align="stretch">{filtered.map(e => <EntryCard key={e.id} entry={e} onEdit={handleEdit} />)}</VStack>
      }

      <EntryModal isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit} initial={editing} />
    </Box>
  )
}