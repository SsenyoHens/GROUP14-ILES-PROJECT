import { useEffect, useState, useCallback } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  Button, Grid, Box, FormLabel, Input, Select,
  Text, Spinner, Flex, Avatar, HStack, Icon,
  Alert, AlertIcon, AlertDescription, VStack,
} from '@chakra-ui/react'
import { MdPerson, MdBusiness, MdSchool } from 'react-icons/md'
import api from '../../api/axiosInstance'

// ─── small fetch hook ─────────────────────────────────────────────────────────
function useFetch(endpoint) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    try { const r = await api.get(endpoint); setData(r.data) }
    catch { /* silently ignore */ }
    finally { setLoading(false) }
  }, [endpoint])
  useEffect(() => { load() }, [load])
  return { data, loading }
}

const EMPTY = {
  student:              '',   // StudentProfile pk
  academic_supervisor:  '',   // AcademicSupervisorProfile pk
  workplace_supervisor: '',   // WorkplaceSupervisorProfile pk
  company_name:         '',
  position:             '',
  start_date:           '',
  end_date:             '',
  status:               'pending',
}

export default function PlacementModal({ isOpen, onClose, onSave, placement }) {
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [regSearch, setRegSearch] = useState('')
  const [foundStudent, setFoundStudent] = useState(null)
  const [searching,    setSearching]    = useState(false)

  // ✅ Load students and supervisors from real endpoints
  const { data: supervisorsRaw, loading: supLoading } = useFetch('/supervisors/')

  const academicSups  = (supervisorsRaw ?? []).filter(s => s.role === 'academic_supervisor')
  const workplaceSups = (supervisorsRaw ?? []).filter(s => s.role === 'workplace_supervisor')

  // ✅ When editing, pre-fill form
  useEffect(() => {
    if (placement) {
      setForm({
        student:              placement.student              ?? '',
        academic_supervisor:  placement.academic_supervisor?.id ?? '',
        workplace_supervisor: placement.workplace_supervisor?.id ?? '',
        company_name:         placement.company_name         ?? '',
        position:             placement.position             ?? '',
        start_date:           placement.start_date           ?? '',
        end_date:             placement.end_date             ?? '',
        status:               placement.status               ?? 'pending',
      })
      // Show student name when editing
      if (placement.student_name) {
        setFoundStudent({
          display: placement.student_name,
          email:   placement.student_email,
          id:      placement.student,
        })
      }
    } else {
      setForm(EMPTY)
      setFoundStudent(null)
      setRegSearch('')
    }
    setError('')
  }, [placement, isOpen])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ✅ Search student by registration number
  const searchStudent = async () => {
    if (!regSearch.trim()) return
    setSearching(true); setFoundStudent(null); setError('')
    try {
      // Get all students, filter by registration number
      const res = await api.get('/students/')
      const list = Array.isArray(res.data) ? res.data : []
      const match = list.find(s =>
        s.profile?.registration_number?.toLowerCase() === regSearch.trim().toLowerCase()
      )
      if (match) {
        setFoundStudent({
          id:      match.id,
          display: `${match.first_name} ${match.last_name}`.trim() || match.email,
          email:   match.email,
          regNo:   match.profile?.registration_number,
        })
        // ✅ We need the StudentProfile pk, not the user pk
        // student_detail returns { profile: { ... } } but we need StudentProfile pk
        // Fetch the student detail to get profile pk
        const detail = await api.get(`/students/${match.id}/`)
        // StudentProfile pk isn't directly returned — we'll pass user id
        // and update create_placement backend to accept user id too
        set('student', match.id)
      } else {
        setError(`No student found with registration number "${regSearch}"`)
      }
    } catch {
      setError('Failed to search for student.')
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.student) {
      setError('Please search and select a student first.')
      return
    }
    if (!form.company_name.trim()) {
      setError('Company name is required.')
      return
    }
    if (!form.start_date || !form.end_date) {
      setError('Start and end dates are required.')
      return
    }

    setSaving(true); setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => { setError(''); setFoundStudent(null); setRegSearch(''); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader fontSize="md" fontWeight="700" pb={1}>
          {placement ? 'Edit Placement' : 'Create New Placement'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={5} align="stretch">

            {error && (
              <Alert status="error" borderRadius="lg" fontSize="sm">
                <AlertIcon /><AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ── Student lookup ── */}
            <Box>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                Student Registration Number *
              </FormLabel>
              <HStack spacing={2}>
                <Input
                  size="sm" borderRadius="lg" bg="gray.50"
                  placeholder="e.g. CS/2026/003"
                  value={regSearch}
                  onChange={e => setRegSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchStudent()}
                  isReadOnly={!!placement}  // can't change student when editing
                />
                {!placement && (
                  <Button size="sm" colorScheme="brand" borderRadius="lg"
                    onClick={searchStudent} isLoading={searching} px={5}>
                    Search
                  </Button>
                )}
              </HStack>

              {/* Found student preview */}
              {foundStudent && (
                <Flex align="center" gap={3} mt={3} p={3} bg="green.50"
                  borderRadius="xl" border="1px solid" borderColor="green.200">
                  <Avatar size="sm" name={foundStudent.display} bg="brand.600" color="white" />
                  <Box>
                    <Text fontSize="sm" fontWeight="700" color="green.800">
                      {foundStudent.display}
                    </Text>
                    <Text fontSize="11px" color="green.600">
                      {foundStudent.email}
                      {foundStudent.regNo ? ` · ${foundStudent.regNo}` : ''}
                    </Text>
                  </Box>
                </Flex>
              )}
            </Box>

            {/* ── Company details ── */}
            <Grid templateColumns="1fr 1fr" gap={4}>
              <Box>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>Company / Organisation *</FormLabel>
                <Input size="sm" borderRadius="lg" bg="gray.50"
                  placeholder="e.g. MTN Uganda"
                  value={form.company_name}
                  onChange={e => set('company_name', e.target.value)} />
              </Box>
              <Box>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>Position / Role</FormLabel>
                <Input size="sm" borderRadius="lg" bg="gray.50"
                  placeholder="e.g. Software Intern"
                  value={form.position}
                  onChange={e => set('position', e.target.value)} />
              </Box>
            </Grid>

            {/* ── Dates ── */}
            <Grid templateColumns="1fr 1fr" gap={4}>
              <Box>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>Start Date *</FormLabel>
                <Input type="date" size="sm" borderRadius="lg" bg="gray.50"
                  value={form.start_date}
                  onChange={e => set('start_date', e.target.value)} />
              </Box>
              <Box>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>End Date *</FormLabel>
                <Input type="date" size="sm" borderRadius="lg" bg="gray.50"
                  value={form.end_date}
                  onChange={e => set('end_date', e.target.value)} />
              </Box>
            </Grid>

            {/* ── Supervisors ── */}
            <Box>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                <HStack spacing={1}>
                  <Icon as={MdSchool} boxSize={3} />
                  <Text>Academic Supervisor</Text>
                </HStack>
              </FormLabel>
              {supLoading
                ? <Spinner size="sm" color="brand.500" />
                : (
                  <Select size="sm" borderRadius="lg" bg="gray.50"
                    placeholder="Select academic supervisor…"
                    value={form.academic_supervisor}
                    onChange={e => set('academic_supervisor', e.target.value)}>
                    {academicSups.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} — {s.email}
                      </option>
                    ))}
                  </Select>
                )
              }
            </Box>

            <Box>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                <HStack spacing={1}>
                  <Icon as={MdBusiness} boxSize={3} />
                  <Text>Workplace Supervisor</Text>
                </HStack>
              </FormLabel>
              {supLoading
                ? <Spinner size="sm" color="brand.500" />
                : (
                  <Select size="sm" borderRadius="lg" bg="gray.50"
                    placeholder="Select workplace supervisor…"
                    value={form.workplace_supervisor}
                    onChange={e => set('workplace_supervisor', e.target.value)}>
                    {workplaceSups.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} — {s.email}
                      </option>
                    ))}
                  </Select>
                )
              }
            </Box>

            {/* ── Status ── */}
            <Box>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Status</FormLabel>
              <Select size="sm" borderRadius="lg" bg="gray.50"
                value={form.status}
                onChange={e => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </Select>
            </Box>

          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={handleClose} borderRadius="lg">
            Cancel
          </Button>
          <Button size="sm" bg="brand.600" color="white" borderRadius="lg"
            _hover={{ bg: 'brand.700' }} isLoading={saving} onClick={handleSubmit}>
            {placement ? 'Save Changes' : 'Create Placement'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}