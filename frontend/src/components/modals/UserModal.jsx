import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, Select, Grid, GridItem, FormErrorMessage,
  VStack, Switch, HStack, Text,
} from '@chakra-ui/react'

export default function UserModal({ isOpen, onClose, onSave, user }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (user) {
      reset({
        first_name:  user.first_name  || '',
        last_name:   user.last_name   || '',
        email:       user.email       || '',
        role:        user.role        || 'academic_supervisor',
        department:  user.department  || '',
        is_active:   user.is_active   ?? true,
      })
    } else {
      reset({
        first_name:  '',
        last_name:   '',
        email:       '',
        role:        'academic_supervisor',
        department:  '',
        password:    '',
        is_active:   true,
      })
    }
  }, [user, isOpen, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" />
      <ModalContent borderRadius="xl">
        <ModalHeader fontSize="md" color="gray.800"
          borderBottom="1px solid" borderColor="gray.100" pb={4}>
          {user ? 'Edit User Account' : 'Create User Account'}
        </ModalHeader>
        <ModalCloseButton />

        {/* ✅ No <form> tag — use onClick instead */}
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

              {/* Email */}
              <GridItem colSpan={2}>
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
              </GridItem>

              {/* Role */}
              <FormControl isInvalid={!!errors.role}>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Role
                </FormLabel>
                <Select size="sm" borderRadius="lg"
                  {...register('role', { required: true })}>
                  <option value="student">Student</option>
                  <option value="academic_supervisor">Academic Supervisor</option>
                  <option value="workplace_supervisor">Workplace Supervisor</option>
                  <option value="admin">Internship Administrator</option>
                </Select>
              </FormControl>

              {/* Department */}
              <FormControl>
                <FormLabel fontSize="xs" color="gray.600"
                  textTransform="uppercase" letterSpacing="wide">
                  Department
                </FormLabel>
                <Input size="sm" borderRadius="lg" {...register('department')} />
              </FormControl>

              {/* Password — only on create */}
              {!user && (
                <GridItem colSpan={2}>
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontSize="xs" color="gray.600"
                      textTransform="uppercase" letterSpacing="wide">
                      Temporary Password
                    </FormLabel>
                    <Input size="sm" borderRadius="lg" type="password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Minimum 8 characters' },
                      })} />
                    <FormErrorMessage fontSize="xs">
                      {errors.password?.message}
                    </FormErrorMessage>
                  </FormControl>
                </GridItem>
              )}

              {/* Active toggle */}
              <GridItem colSpan={2}>
                <FormControl>
                  <HStack justify="space-between">
                    <FormLabel fontSize="xs" color="gray.600"
                      textTransform="uppercase" letterSpacing="wide" mb={0}>
                      Account Active
                    </FormLabel>
                    <Switch colorScheme="green"
                      {...register('is_active')} defaultChecked />
                  </HStack>
                </FormControl>
              </GridItem>

            </Grid>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3} borderTop="1px solid" borderColor="gray.100" pt={4}>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" isLoading={isSubmitting}
            bg="brand.600" color="white" _hover={{ bg: 'brand.700' }}
            borderRadius="lg"
            onClick={handleSubmit(onSave)}>
            {user ? 'Save Changes' : 'Create Account'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}