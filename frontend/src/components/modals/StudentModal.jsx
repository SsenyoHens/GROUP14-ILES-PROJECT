import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, Select, Grid, GridItem, FormErrorMessage, VStack,
} from '@chakra-ui/react'

export default function StudentModal({ isOpen, onClose, onSave, student }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (student) {
      // ✅ Map backend field names to form fields when editing
      reset({
        first_name:          student.first_name          || '',
        last_name:           student.last_name           || '',
        email:               student.email               || '',
        phone:               student.phone               || '',
        department:          student.department          || '',
        registration_number: student.profile?.registration_number || '',
        course:              student.profile?.course     || '',
        year_of_study:       student.profile?.year_of_study || '',
        password:            '',
      })
    } else {
      reset({
        first_name:          '',
        last_name:           '',
        email:               '',
        phone:               '',
        department:          '',
        registration_number: '',
        course:              '',
        year_of_study:       '',
        password:            '',
      })
    }
  }, [student, isOpen, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" />
      <ModalContent borderRadius="xl">
        <ModalHeader fontSize="md" color="gray.800"
          borderBottom="1px solid" borderColor="gray.100" pb={4}>
          {student ? 'Edit Student Record' : 'Register New Student'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={5}>
          <VStack spacing={4}>
            <Grid templateColumns="1fr 1fr" gap={4} w="100%">

              {/* First Name */}
              <FormControl isInvalid={!!errors.first_name}>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  First Name
                </FormLabel>
                <Input size="sm" borderRadius="lg"
                  {...register('first_name', { required: 'First name is required' })} />
                <FormErrorMessage fontSize="xs">
                  {errors.first_name?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Last Name */}
              <FormControl isInvalid={!!errors.last_name}>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Last Name
                </FormLabel>
                <Input size="sm" borderRadius="lg"
                  {...register('last_name', { required: 'Last name is required' })} />
                <FormErrorMessage fontSize="xs">
                  {errors.last_name?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Registration Number */}
              <FormControl isInvalid={!!errors.registration_number}>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Registration Number
                </FormLabel>
                <Input size="sm" borderRadius="lg" fontFamily="mono"
                  placeholder="e.g. CS/2026/001"
                  {...register('registration_number', { required: 'Reg number required' })} />
                <FormErrorMessage fontSize="xs">
                  {errors.registration_number?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Year of Study */}
              <FormControl isInvalid={!!errors.year_of_study}>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Year of Study
                </FormLabel>
                <Select size="sm" borderRadius="lg"
                  {...register('year_of_study', { required: 'Year is required' })}>
                  <option value="">Select year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </Select>
                <FormErrorMessage fontSize="xs">
                  {errors.year_of_study?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Email */}
              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Email Address
                </FormLabel>
                <Input size="sm" borderRadius="lg" type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern:  { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })} />
                <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
              </FormControl>

              {/* Phone */}
              <FormControl>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Phone Number
                </FormLabel>
                <Input size="sm" borderRadius="lg" type="tel"
                  {...register('phone')} />
              </FormControl>

              {/* Department */}
              <FormControl isInvalid={!!errors.department}>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Department
                </FormLabel>
                <Input size="sm" borderRadius="lg"
                  {...register('department', { required: 'Department is required' })} />
                <FormErrorMessage fontSize="xs">
                  {errors.department?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Course */}
              <FormControl isInvalid={!!errors.course}>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Course / Programme
                </FormLabel>
                <Input size="sm" borderRadius="lg"
                  {...register('course', { required: 'Course is required' })} />
                <FormErrorMessage fontSize="xs">
                  {errors.course?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Password — only on create */}
              {!student && (
                <GridItem colSpan={2}>
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontSize="xs" color="gray.600"
                      textTransform="uppercase" letterSpacing="wide">
                      Temporary Password
                    </FormLabel>
                    <Input size="sm" borderRadius="lg" type="password"
                      {...register('password', {
                        required: 'Password is required for new student',
                        minLength: { value: 8, message: 'Minimum 8 characters' },
                      })} />
                    <FormErrorMessage fontSize="xs">
                      {errors.password?.message}
                    </FormErrorMessage>
                  </FormControl>
                </GridItem>
              )}

            </Grid>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3} borderTop="1px solid" borderColor="gray.100" pt={4}>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" isLoading={isSubmitting}
            bg="brand.600" color="white" _hover={{ bg: 'brand.700' }}
            borderRadius="lg"
            onClick={handleSubmit(onSave)}>
            {student ? 'Save Changes' : 'Register Student'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}