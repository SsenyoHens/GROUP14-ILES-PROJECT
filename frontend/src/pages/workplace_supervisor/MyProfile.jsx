import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Input, FormLabel,
  Alert, AlertIcon, AlertDescription, Divider, useToast,
} from '@chakra-ui/react'
import {
  MdPerson, MdEmail, MdPhone, MdBusiness,
  MdEdit, MdSave, MdClose, MdCalendarToday,
  MdLocationOn, MdWork,
} from 'react-icons/md'
import api from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'

function useFetch(endpoint) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await api.get(endpoint); setData(res.data) }
    catch (err) { setError(err.response?.data?.detail || err.message) }
    finally { setLoading(false) }
  }, [endpoint])
  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

function EditableField({ label, name, value, onChange, type = 'text', readOnly = false }) {
  return (
    <Box>
      <FormLabel fontSize="xs" color="gray.500" mb={1}>{label}</FormLabel>
      <Input size="sm" borderRadius="lg" type={type}
        bg={readOnly ? 'gray.50' : 'white'}
        value={value || ''}
        onChange={e => onChange(name, e.target.value)}
        isReadOnly={readOnly}
        _readOnly={{ cursor: 'not-allowed', opacity: 0.7 }}
        border="1px solid" borderColor="gray.200"
        _focus={{ borderColor: 'blue.400', bg: 'white' }}
      />
    </Box>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <Flex align="center" gap={3} py={3}
      borderBottom="1px solid" borderColor="gray.50" _last={{ border: 'none' }}>
      <Flex w="32px" h="32px" borderRadius="lg" bg="blue.50"
        align="center" justify="center" flexShrink={0}>
        <Icon as={icon} color="blue.500" boxSize={4} />
      </Flex>
      <Box>
        <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="600" color="gray.700">{value || '—'}</Text>
      </Box>
    </Flex>
  )
}

export default function WorkplaceSupervisorProfile() {
  const { data: profile, loading, error, refetch } = useFetch('/profile/')
  const { user } = useAuth()
  const toast    = useToast()
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({})
  const wpProfile = profile?.profile ?? {}

  useEffect(() => {
    if (profile) setForm({
      first_name:   profile.first_name || '',
      last_name:    profile.last_name  || '',
      email:        profile.email      || '',
      phone:        profile.phone      || '',
      position:     wpProfile.position || '',
    })
  }, [profile])

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/profile/update/', form)
      toast({ title: 'Profile updated', status: 'success', duration: 3000, isClosable: true })
      refetch(); setEditing(false)
    } catch (err) {
      toast({
        title: 'Update failed', description: err.message,
        status: 'error', duration: 4000, isClosable: true
      })
    } finally { setSaving(false) }
  }

  const handleCancel = () => {
    setEditing(false)
    if (profile) setForm({
      first_name: profile.first_name || '',
      last_name:  profile.last_name  || '',
      email:      profile.email      || '',
      phone:      profile.phone      || '',
      position:   wpProfile.position || '',
    })
  }

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
    : 'Supervisor'

  if (loading) return (
    <Flex justify="center" align="center" minH="60vh">
      <Spinner size="lg" color="blue.500" />
    </Flex>
  )

  if (error) return (
    <Alert status="error" borderRadius="xl">
      <AlertIcon />
      <AlertDescription>{error}</AlertDescription>
      <Button size="xs" ml={3} onClick={refetch} colorScheme="red" variant="outline">Retry</Button>
    </Alert>
  )

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', lg: '280px 1fr' }} gap={6}>

        {/* Left card */}
        <VStack spacing={5} align="stretch">
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
            <Box bg="blue.600" bgGradient="linear(135deg, blue.600, blue.800)" h="80px" />
            <Flex direction="column" align="center" px={5} pb={5} mt="-40px">
              <Avatar size="xl" name={displayName} bg="blue.600" color="white"
                fontSize="xl" border="4px solid white" mb={3} />
              <Text fontWeight="800" fontSize="md" color="gray.800" textAlign="center">
                {displayName}
              </Text>
              <Text fontSize="xs" color="gray.400" mt={0.5}>
                {wpProfile.position || 'Workplace Supervisor'}
              </Text>
              <Badge mt={2} colorScheme="blue" borderRadius="full" px={3} fontSize="10px">
                Workplace Supervisor
              </Badge>
            </Flex>
          </Box>

          {/* Organisation info */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" p={5}>
            <Text fontWeight="700" fontSize="sm" color="gray.800" mb={3}>Organisation</Text>
            <InfoRow icon={MdBusiness} label="Company"  value={wpProfile.company_name} />
            <InfoRow icon={MdWork}     label="Position" value={wpProfile.position}     />
            <InfoRow icon={MdPhone}    label="Phone"    value={wpProfile.phone_number} />
          </Box>
        </VStack>

        {/* Right: editable details */}
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
          <Flex px={5} py={4} justify="space-between" align="center"
            borderBottom="1px solid" borderColor="gray.100">
            <Box>
              <Text fontWeight="700" fontSize="sm" color="gray.800">Personal Details</Text>
              <Text fontSize="11px" color="gray.400">
                {editing ? 'Editing — save when done' : 'View and update your information'}
              </Text>
            </Box>
            {!editing
              ? (
                <Button size="sm" leftIcon={<Icon as={MdEdit} />} variant="outline"
                  borderRadius="lg" fontSize="xs" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )
              : (
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<Icon as={MdClose} />} variant="ghost"
                    borderRadius="lg" fontSize="xs" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" leftIcon={<Icon as={MdSave} />} bg="blue.600" color="white"
                    borderRadius="lg" fontSize="xs" _hover={{ bg: 'blue.700' }}
                    isLoading={saving} onClick={handleSave}>
                    Save Changes
                  </Button>
                </HStack>
              )
            }
          </Flex>

          <Box px={5} py={5}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
              <EditableField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} readOnly={!editing} />
              <EditableField label="Last Name"  name="last_name"  value={form.last_name}  onChange={handleChange} readOnly={!editing} />
              <EditableField label="Email"      name="email"      value={form.email}      onChange={handleChange} type="email" readOnly={!editing} />
              <EditableField label="Phone"      name="phone"      value={form.phone}      onChange={handleChange} type="tel"   readOnly={!editing} />
              <EditableField label="Company"    name="company"    value={wpProfile.company_name} onChange={() => {}} readOnly />
              <EditableField label="Position"   name="position"   value={wpProfile.position}     onChange={() => {}} readOnly />
            </Grid>

            <Divider my={6} />

            <Text fontSize="xs" fontWeight="600" color="gray.400"
              textTransform="uppercase" letterSpacing="wider" mb={4}>
              Account
            </Text>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
              <Box>
                <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                  letterSpacing="wider" mb={1}>Role</Text>
                <HStack spacing={2}>
                  <Icon as={MdPerson} color="gray.300" boxSize={4} />
                  <Text fontSize="sm" fontWeight="600" color="gray.700">Workplace Supervisor</Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="10px" color="gray.400" textTransform="uppercase"
                  letterSpacing="wider" mb={1}>Email</Text>
                <HStack spacing={2}>
                  <Icon as={MdEmail} color="gray.300" boxSize={4} />
                  <Text fontSize="sm" fontWeight="600" color="gray.700">{profile?.email}</Text>
                </HStack>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Box>
  )
}