import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, Select, Grid, GridItem, FormErrorMessage, VStack,
} from '@chakra-ui/react'

function StudentModal({ isOpen, onClose, onSave, student }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    // Always reset to empty unless editing existing student
    reset(student || {
      fullName: '', regNumber: '', email: '', phone: '',
      department: '', course: '', yearOfStudy: '', status: 'Pending',
    })
  }, [student, isOpen, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" />
      <ModalContent borderRadius="xl">
        <ModalHeader fontSize="md" color="gray.800" fontFamily="heading" borderBottom="1px solid" borderColor="gray.100" pb={4}>
          {student ? 'Edit Student Record' : 'Register New Student'}
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSave)}>
          <ModalBody py={5}>
            <VStack spacing={4}>
              <Grid templateColumns="1fr 1fr" gap={4} w="100%">

                <GridItem colSpan={2}>
                  <FormControl isInvalid={!!errors.fullName}>
                    <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                      Full Name
                    </FormLabel>
                    <Input size="sm" borderRadius="lg"
                      {...register('fullName', { required: 'Full name is required' })} />
                    <FormErrorMessage fontSize="xs">{errors.fullName?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <FormControl isInvalid={!!errors.regNumber}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Registration Number
                  </FormLabel>
                  <Input size="sm" borderRadius="lg" fontFamily="mono"
                    {...register('regNumber', { required: 'Reg number required' })} />
                  <FormErrorMessage fontSize="xs">{errors.regNumber?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.yearOfStudy}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Year of Study
                  </FormLabel>
                  <Select size="sm" borderRadius="lg"
                    {...register('yearOfStudy', { required: 'Year is required' })}>
                    <option value="">Select year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </Select>
                  <FormErrorMessage fontSize="xs">{errors.yearOfStudy?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Email Address
                  </FormLabel>
                  <Input size="sm" borderRadius="lg" type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                    })} />
                  <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Phone Number
                  </FormLabel>
                  <Input size="sm" borderRadius="lg" type="tel"
                    {...register('phone')} />
                </FormControl>

                <FormControl isInvalid={!!errors.department}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Department
                  </FormLabel>
                  <Input size="sm" borderRadius="lg"
                    {...register('department', { required: 'Department is required' })} />
                  <FormErrorMessage fontSize="xs">{errors.department?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.course}>
                  <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    Course / Programme
                  </FormLabel>
                  <Input size="sm" borderRadius="lg"
                    {...register('course', { required: 'Course is required' })} />
                  <FormErrorMessage fontSize="xs">{errors.course?.message}</FormErrorMessage>
                </FormControl>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                      Status
                    </FormLabel>
                    <Select size="sm" borderRadius="lg" {...register('status')}>
                      <option value="Pending">Pending</option>
                      <option value="Placed">Placed</option>
                      <option value="Evaluating">Evaluating</option>
                      <option value="Completed">Completed</option>
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
              {student ? 'Save Changes' : 'Register Student'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default StudentModal