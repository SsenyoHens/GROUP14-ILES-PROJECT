import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, Select, Textarea, Grid, GridItem, FormErrorMessage, VStack,
} from '@chakra-ui/react'

function EvaluationModal({ isOpen, onClose, onSave, evaluation }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    reset(evaluation || {
      studentId: '', period: '', score: '',
      grade: '', comments: '', status: 'Draft',
    })
  }, [evaluation, isOpen, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" />
      <ModalContent borderRadius="xl">
        <ModalHeader fontSize="md" color="gray.800" fontFamily="heading"
          borderBottom="1px solid" borderColor="gray.100" pb={4}>
          {evaluation ? 'Edit Evaluation' : 'Create Evaluation'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSave)}>
          <ModalBody py={5}>
            <VStack spacing={4}>
              <Grid templateColumns="1fr 1fr" gap={4} w="100%">

                <GridItem colSpan={2}>
                  <FormControl isInvalid={!!errors.studentId}>
                    <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                      Student Reg Number
                    </FormLabel>
                    <Input size="sm" borderRadius="lg" fontFamily="mono"
                      placeholder="e.g. CS/2021/001"
                      {...register('studentId', { required: 'Student is required' })} />
                    <FormErrorMessage fontSize="xs">{errors.studentId?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <FormControl isInvalid={!!errors.period}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Evaluation Period
                  </FormLabel>
                  <Input size="sm" borderRadius="lg" placeholder="e.g. Feb – May 2025"
                    {...register('period', { required: 'Period is required' })} />
                  <FormErrorMessage fontSize="xs">{errors.period?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Score (0–100)
                  </FormLabel>
                  <Input size="sm" borderRadius="lg" type="number" min={0} max={100}
                    {...register('score', { min: 0, max: 100 })} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Grade
                  </FormLabel>
                  <Select size="sm" borderRadius="lg" {...register('grade')}>
                    <option value="">— Select grade —</option>
                    <option value="A">A — Distinction</option>
                    <option value="B">B — Merit</option>
                    <option value="C">C — Pass</option>
                    <option value="D">D — Borderline</option>
                    <option value="F">F — Fail</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Status
                  </FormLabel>
                  <Select size="sm" borderRadius="lg" {...register('status')}>
                    <option>Draft</option>
                    <option>Submitted</option>
                    <option>Graded</option>
                  </Select>
                </FormControl>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                      Comments / Remarks
                    </FormLabel>
                    <Textarea size="sm" borderRadius="lg" rows={3}
                      placeholder="Enter evaluator comments..."
                      {...register('comments')} />
                  </FormControl>
                </GridItem>

              </Grid>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3} borderTop="1px solid" borderColor="gray.100" pt={4}>
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}
              bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} borderRadius="lg">
              {evaluation ? 'Save Changes' : 'Create Evaluation'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EvaluationModal