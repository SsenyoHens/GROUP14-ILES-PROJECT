import { useCallback, useEffect, useState } from 'react'
import {
  Box, Flex, Grid, Text, VStack, HStack, Icon,
  Badge, Avatar, Button, Spinner, Input, FormLabel,
  Alert, AlertIcon, AlertDescription, Divider, useToast,
} from '@chakra-ui/react'
import {
  MdPerson, MdEmail, MdPhone, MdSchool, MdEdit,
  MdSave, MdClose, MdBadge, MdCalendarToday, MdWork,
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

function InfoRow({ label, value, icon }) {
  return (
    <Flex justify="space-between" align="center" py={2.5}
      borderBottom="1px solid" borderColor="gray.50" _last={{ border: 'none' }}>
      <HStack spacing={2}>
        {icon && <Icon as={icon} color="gray.300" boxSize={4} />}
        <Text fontSize="xs" color="gray.400">{label}</Text>
      </HStack>
      <Text fontSize="sm" fontWeight="600" color="gray.700">{value || '—'}</Text>
    </Flex>
  )
}

function Field({ label, name, value, onChange, type = 'text', readOnly = false }) {
  return (
    <Box>
      <FormLabel fontSize="xs" color="gray.500" mb={1}>{label}</FormLabel>
      <Input size="sm" borderRadius="lg" type={type}
        bg={readOnly ? 'gray.50' : 'white'}
        value={value || ''} onChange={e => onChange(name, e.target.value)}
        isReadOnly={readOnly}
        _readOnly={{ cursor: 'not-allowed', opacity: 0.6 }}
        border="1px solid" borderColor="gray.200"
        _focus={{ borderColor: 'brand.400', bg: 'white' }} />
    </Box>
  )
}

export default function StudentProfile() {
  const { data: profile, loading, error, refetch } = useFetch('/profile/')
  const { user } = useAuth()
  const toast    = useToast()
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({})
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (profile) setForm({
      first_name: profile.first_name || '',
      last_name:  profile.last_name  || '',
      email:      profile.email      || '',
      phone:      profile.phone      || '',
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
    })
  }

  if (loading) return (
    <Flex justify="center" align="center" minH="60vh">
      <Spinner size="lg" color="brand.500" />
    </Flex>
  )

  if (error) return (
    <Alert status="error" borderRadius="xl">
      <AlertIcon />
      <AlertDescription>{error}</AlertDescription>
      <Button size="xs" ml={3} onClick={refetch} colorScheme="red" variant="outline">Retry</Button>
    </Alert>
  )

  const studentProfile = profile?.profile || {}
  const displayName    = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.email

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', lg: '280px 1fr' }} gap={6}>

        {/* Left: avatar + academic info */}
        <VStack spacing={5} align="stretch">
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" overflow="hidden">
            <Box bg="brand.600" bgGradient="linear(135deg, brand.600, brand.800)" h="80px" />
            <Flex direction="column" align="center" px={5} pb={5} mt="-40px">
              <Avatar size="xl" name={displayName} bg="brand.600" color="white"
                fontSize="xl" border="4px solid white" mb={3} />
              <Text fontWeight="800" fontSize="md" color="gray.800" textAlign="center">
                {displayName}
              </Text>
              <Text fontSize="xs" color="gray.400" mt={0.5}>
                {studentProfile.registration_number || profile?.email}
              </Text>
              <Badge mt={2} colorScheme="brand" borderRadius="full" px={3} fontSize="10px">
                Student
              </Badge>
            </Flex>
          </Box>

          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 3px rgba(0,0,0,0.04)" p={5}>
            <Text fontWeight="700" fontSize="sm" color="gray.800" mb={4}>Academic Info</Text>
            <InfoRow label="Course"        value={studentProfile.course}                                       icon={MdSchool}        />
            <InfoRow label="Department"    value={profile?.department}                                         icon={MdBadge}         />
            <InfoRow label="Year of Study" value={studentProfile.year_of_study ? `Year ${studentProfile.year_of_study}` : null} icon={MdCalendarToday} />
            <InfoRow label="Reg. Number"   value={studentProfile.registration_number}                          icon={MdWork}          />
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
                  <Button size="sm" leftIcon={<Icon as={MdSave} />} bg="brand.600" color="white"
                    borderRadius="lg" fontSize="xs" _hover={{ bg: 'brand.700' }}
                    isLoading={saving} onClick={handleSave}>
                    Save Changes
                  </Button>
                </HStack>
              )
            }
          </Flex>

          <Box px={5} py={5}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
              <Field label="First Name"   name="first_name" value={form.first_name} onChange={handleChange} readOnly={!editing} />
              <Field label="Last Name"    name="last_name"  value={form.last_name}  onChange={handleChange} readOnly={!editing} />
              <Field label="Email"        name="email"      value={form.email}      onChange={handleChange} type="email" readOnly={!editing} />
              <Field label="Phone"        name="phone"      value={form.phone}      onChange={handleChange} type="tel"   readOnly={!editing} />
              <Field label="Reg. Number"  name="reg"        value={studentProfile.registration_number} onChange={() => {}} readOnly />
              <Field label="Course"       name="course"     value={studentProfile.course}              onChange={() => {}} readOnly />
            </Grid>

            <Divider my={6} />

            <Text fontSize="xs" fontWeight="600" color="gray.400"
              textTransform="uppercase" letterSpacing="wider" mb={4}>Account</Text>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
              <InfoRow label="Role"  value="Student Intern" icon={MdPerson}        />
              <InfoRow label="Email" value={profile?.email} icon={MdEmail}         />
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Box>
  )
}