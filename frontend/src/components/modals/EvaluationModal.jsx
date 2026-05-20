import { useEffect, useState, useCallback } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  Button, Grid, Box, FormLabel, Input, Select,
  Textarea, VStack, Alert, AlertIcon, AlertDescription,
  Spinner, Avatar, Flex, Text, HStack,
} from '@chakra-ui/react'
import { studentService } from '../../api/services'

const GRADE_OPTIONS = [
  { value: 'A', label: 'A — Distinction' },
  { value: 'B', label: 'B — Merit'       },
  { value: 'C', label: 'C — Credit'      },
  { value: 'D', label: 'D — Pass'        },
  { value: 'F', label: 'F — Fail'        },
]

const EMPTY = {
  student:     '',
  total_score: '',
  grade:       '',
  status:      'submitted',
  feedback:    '',
}

export default function EvaluationModal({ isOpen, onClose, onSave, evaluation }) {
  const [form,       setForm]       = useState(EMPTY)
  const [students,   setStudents]   = useState([])
  const [loadingSt,  setLoadingSt]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  // ✅ Load students for dropdown
  const loadStudents = useCallback(async () => {
    setLoadingSt(true)
    try {
      const res = await studentService.getAll()
      setStudents(Array.isArray(res.data) ? res.data : [])
    } catch {
      setStudents([])
    } finally {
      setLoadingSt(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) loadStudents()
  }, [isOpen, loadStudents])

  // ✅ Pre-fill when editing
  useEffect(() => {
    if (evaluation) {
      setForm({
        student:     evaluation.student     ?? '',
        total_score: evaluation.total_score ?? '',
        grade:       evaluation.grade       ?? '',
        status:      evaluation.status      ?? 'submitted',
        feedback:    evaluation.feedback    ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setError('')
  }, [evaluation, isOpen])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ✅ Auto-compute grade from score
  const handleScoreChange = (v) => {
    const n = parseFloat(v)
    let grade = ''
    if (!isNaN(n)) {
      if      (n >= 80) grade = 'A'
      else if (n >= 70) grade = 'B'
      else if (n >= 60) grade = 'C'
      else if (n >= 50) grade = 'D'
      else              grade = 'F'
    }
    setForm(f => ({ ...f, total_score: v, grade }))
  }

  const handleSubmit = async () => {
    if (!form.student) {
      setError('Please select a student.')
      return
    }
    setSaving(true); setError('')
    try {
      await onSave({
        student:     form.student,
        total_score: form.total_score !== '' ? parseFloat(form.total_score) : undefined,
        grade:       form.grade,
        status:      form.status,
        feedback:    form.feedback,
      })
      onClose()
    } catch (err) {
      setError(
        err.response?.data?.error   ||
        err.response?.data?.message ||
        'Save failed. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => { setError(''); onClose() }

  // Find selected student for preview
  const selectedStudent = students.find(s => String(s.id) === String(form.student))

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" mx={4}>
        <ModalHeader fontSize="md" fontWeight="700" pb={1}>
          {evaluation ? 'Edit Evaluation' : 'Create Evaluation'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>

            {error && (
              <Alert status="error" borderRadius="lg" fontSize="sm">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ── Student selector ── */}
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                Student *
              </FormLabel>
              {loadingSt
                ? <Spinner size="sm" color="brand.500" />
                : (
                  <Select size="sm" borderRadius="lg" bg="gray.50"
                    placeholder="Select student…"
                    value={form.student}
                    onChange={e => set('student', e.target.value)}
                    isDisabled={!!evaluation}>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} — {s.email}
                      </option>
                    ))}
                  </Select>
                )
              }

              {/* Student preview */}
              {selectedStudent && (
                <Flex align="center" gap={3} mt={2} p={3}
                  bg="brand.50" borderRadius="xl"
                  border="1px solid" borderColor="brand.100">
                  <Avatar size="sm"
                    name={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                    bg="brand.600" color="white" />
                  <Box>
                    <Text fontSize="sm" fontWeight="700" color="brand.800">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </Text>
                    <Text fontSize="11px" color="brand.500">
                      {selectedStudent.email}
                      {selectedStudent.profile?.registration_number
                        ? ` · ${selectedStudent.profile.registration_number}`
                        : ''}
                    </Text>
                  </Box>
                </Flex>
              )}
            </Box>

            {/* ── Score + Grade ── */}
            <Grid templateColumns="1fr 1fr" gap={4} w="full">
              <Box>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>Score (0–100)</FormLabel>
                <Input size="sm" borderRadius="lg" bg="gray.50"
                  type="number" min={0} max={100} placeholder="e.g. 75"
                  value={form.total_score}
                  onChange={e => handleScoreChange(e.target.value)} />
              </Box>
              <Box>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>Grade</FormLabel>
                <Select size="sm" borderRadius="lg" bg="gray.50"
                  value={form.grade}
                  onChange={e => set('grade', e.target.value)}>
                  <option value="">Auto from score</option>
                  {GRADE_OPTIONS.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </Select>
              </Box>
            </Grid>

            {/* ── Status ── */}
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>Status</FormLabel>
              <Select size="sm" borderRadius="lg" bg="gray.50"
                value={form.status}
                onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
              </Select>
            </Box>

            {/* ── Feedback ── */}
            <Box w="full">
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                Comments / Remarks
              </FormLabel>
              <Textarea size="sm" borderRadius="lg" bg="gray.50" rows={3}
                placeholder="Overall feedback, strengths, areas for improvement…"
                value={form.feedback}
                onChange={e => set('feedback', e.target.value)} />
            </Box>

          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={handleClose} borderRadius="lg">
            Cancel
          </Button>
          <Button size="sm" bg="brand.600" color="white" borderRadius="lg"
            _hover={{ bg: 'brand.700' }} isLoading={saving} onClick={handleSubmit}>
            {evaluation ? 'Save Changes' : 'Create Evaluation'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}