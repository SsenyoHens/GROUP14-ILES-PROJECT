import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, Select, Grid, GridItem, FormErrorMessage, VStack,
} from '@chakra-ui/react'

function PlacementModal({ isOpen, onClose, onSave, placement }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    reset(placement || {
      studentId: '', workplace: '', supervisorName: '',
      supervisorEmail: '', startDate: '', endDate: '', status: 'Pending',
    })
  }, [placement, isOpen, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" />
      <ModalContent borderRadius="xl">
        <ModalHeader fontSize="md" color="gray.800" fontFamily="heading"
          borderBottom="1px solid" borderColor="gray.100" pb={4}>
          {placement ? 'Edit Placement' : 'Create New Placement'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSave)}>
          <ModalBody py={5}>
            <VStack spacing={4}>
              <Grid templateColumns="1fr 1fr" gap={4} w="100%">

                <GridItem colSpan={2}>
                  <FormControl isInvalid={!!errors.studentId}>
                    <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                      Student Registration Number
                    </FormLabel>
                    <Input size="sm" borderRadius="lg" fontFamily="mono"
                      placeholder="e.g. CS/2021/001"
                      {...register('studentId', { required: 'Student reg number is required' })} />
                    <FormErrorMessage fontSize="xs">{errors.studentId?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isInvalid={!!errors.workplace}>
                    <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                      Workplace / Organisation
                    </FormLabel>
                    <Input size="sm" borderRadius="lg"
                      {...register('workplace', { required: 'Workplace is required' })} />
                    <FormErrorMessage fontSize="xs">{errors.workplace?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <FormControl isInvalid={!!errors.supervisorName}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Supervisor Name
                  </FormLabel>
                  <Input size="sm" borderRadius="lg"
                    {...register('supervisorName', { required: 'Supervisor name is required' })} />
                  <FormErrorMessage fontSize="xs">{errors.supervisorName?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Supervisor Email
                  </FormLabel>
                  <Input size="sm" borderRadius="lg" type="email"
                    {...register('supervisorEmail')} />
                </FormControl>

                <FormControl isInvalid={!!errors.startDate}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Start Date
                  </FormLabel>
                  <Input size="sm" borderRadius="lg" type="date"
                    {...register('startDate', { required: 'Start date is required' })} />
                  <FormErrorMessage fontSize="xs">{errors.startDate?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.endDate}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    End Date
                  </FormLabel>
                  <Input size="sm" borderRadius="lg" type="date"
                    {...register('endDate', { required: 'End date is required' })} />
                  <FormErrorMessage fontSize="xs">{errors.endDate?.message}</FormErrorMessage>
                </FormControl>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                      Status
                    </FormLabel>
                    <Select size="sm" borderRadius="lg" {...register('status')}>
                      <option>Pending</option>
                      <option>Active</option>
                      <option>Evaluating</option>
                      <option>Completed</option>
                      <option>Terminated</option>
                    </Select>
                  </FormControl>
                </GridItem>

              </Grid>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3} borderTop="1px solid" borderColor="gray.100" pt={4}>
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}
              bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} borderRadius="lg">
              {placement ? 'Save Changes' : 'Create Placement'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default PlacementModal