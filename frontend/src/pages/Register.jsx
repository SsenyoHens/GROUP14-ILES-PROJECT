import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../api/services'
import {
  Box, Flex, VStack, HStack, Heading, Text, FormControl,
  FormLabel, Input, Button, FormErrorMessage, Alert, AlertIcon,
  Select, InputGroup, InputRightElement, IconButton,
  Progress, useSteps, Link, Grid, GridItem, Badge,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, CheckCircleIcon } from '@chakra-ui/icons'
import {
  MdSchool, MdAdminPanelSettings, MdBusiness, MdSupervisorAccount
} from 'react-icons/md'

// ── Role cards ─────────────────────────────────────────
const ROLES = [
  {
    value: 'student',
    label: 'Student',
    icon:  MdSchool,
    desc:  'Register as an intern student',
    color: 'brand',
    badge: 'Intern',
  },
  {
    value: 'academic_supervisor',
    label: 'Academic Supervisor',
    icon:  MdAdminPanelSettings,
    desc:  'School-side staff managing internships',
    color: 'purple',
    badge: 'Staff',
  },
  {
    value: 'workplace_supervisor',
    label: 'Workplace Supervisor',
    icon:  MdBusiness,
    desc:  'Organisation supervisor for interns',
    color: 'blue',
    badge: 'Employer',
  },
  {
    value: 'admin',                           
    label: 'Internship Administrator',
    icon:  MdSupervisorAccount,
    desc:  'Overall system and placement coordinator',
    color: 'orange',
    badge: 'Admin',
  },
]

// ── Step 1: Role selection ─────────────────────────────
function RoleStep({ selected, onSelect }) {
  return (
    <VStack spacing={4} w="100%">
      <Box textAlign="center" mb={2}>
        <Heading size="md" color="gray.800" fontFamily="heading" mb={1}>
          Select your role to continue
        </Heading>
      </Box>

      {ROLES.map((role) => {
        const isSelected = selected === role.value
        return (
          <Box
            key={role.value}
            w="100%" p={4} borderRadius="xl" cursor="pointer"
            border="2px solid"
            borderColor={isSelected ? `${role.color}.400` : 'gray.200'}
            bg={isSelected ? `${role.color}.50` : 'white'}
            onClick={() => onSelect(role.value)}
            _hover={{ borderColor: `${role.color}.300`, bg: `${role.color}.50` }}
            transition="all 0.15s"
          >
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Flex
                  w="40px" h="40px" borderRadius="lg" align="center" justify="center"
                  bg={isSelected ? `${role.color}.400` : 'gray.100'}
                  transition="all 0.15s"
                >
                  <Box
                    as={role.icon}
                    fontSize="20px"
                    color={isSelected ? 'white' : 'gray.400'}
                  />
                </Flex>
                <Box>
                  <Text fontWeight="600" fontSize="sm" color="gray.800">
                    {role.label}
                  </Text>
                  <Text fontSize="xs" color="gray.500">{role.desc}</Text>
                </Box>
              </HStack>
              <Badge
                colorScheme={role.color} borderRadius="full"
                px={2} fontSize="10px"
              >
                {role.badge}
              </Badge>
            </HStack>
          </Box>
        )
      })}
    </VStack>
  )
}

// ── Step 2: Fields per role ────────────────────────────
function FieldsStep({ role, register, errors, showPw, setShowPw, showConfirm, setShowConfirm, watch }) {
  const pw = watch('password', '')

  return (
    <VStack spacing={4} w="100%">
      <Grid templateColumns="1fr 1fr" gap={4} w="100%">

        {/* ── Common: Full Name ── */}
        <GridItem colSpan={2}>
          <FormControl isInvalid={!!errors.fullName}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Full Name
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50"
              placeholder="As it appears on official documents"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('fullName', { required: 'Full name is required' })}
            />
            <FormErrorMessage fontSize="xs">{errors.fullName?.message}</FormErrorMessage>
          </FormControl>
        </GridItem>

        {/* ── Student fields ── */}
        {role === 'student' && <>
          <FormControl isInvalid={!!errors.regNumber}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Registration Number
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50" fontFamily="mono"
              placeholder="e.g. CS/2021/001"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('regNumber', { required: 'Registration number is required' })}
            />
            <FormErrorMessage fontSize="xs">{errors.regNumber?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.yearOfStudy}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Year of Study
            </FormLabel>
            <Select
              size="sm" borderRadius="lg" bg="gray.50"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('yearOfStudy', { required: 'Year of study is required' })}
            >
              <option value="">Select year</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </Select>
            <FormErrorMessage fontSize="xs">{errors.yearOfStudy?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.department}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Department
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50"
              placeholder="e.g. Computer Science"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('department', { required: 'Department is required' })}
            />
            <FormErrorMessage fontSize="xs">{errors.department?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.course}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Course / Programme
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50"
              placeholder="e.g. BSc Software Engineering"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('course', { required: 'Course is required' })}
            />
            <FormErrorMessage fontSize="xs">{errors.course?.message}</FormErrorMessage>
          </FormControl>
        </>}

        {/* ── Academic supervisor fields ── */}
        {role === 'academic_supervisor' && <>
          <FormControl isInvalid={!!errors.staffId}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Staff ID
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50" fontFamily="mono"
              placeholder="e.g. STAFF/001"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('staffId', { required: 'Staff ID is required' })}
            />
            <FormErrorMessage fontSize="xs">{errors.staffId?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.department}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Department
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50"
              placeholder="e.g. Faculty of Computing"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('department', { required: 'Department is required' })}
            />
            <FormErrorMessage fontSize="xs">{errors.department?.message}</FormErrorMessage>
          </FormControl>

          <GridItem colSpan={2}>
            <FormControl isInvalid={!!errors.officeNumber}>
              <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                Office Number
              </FormLabel>
              <Input
                size="sm" borderRadius="lg" bg="gray.50"
                placeholder="e.g. Room 12, Block A"
                _focus={{ bg: 'white', borderColor: 'brand.400' }}
                {...register('officeNumber', { required: 'Office number is required' })}
              />
              <FormErrorMessage fontSize="xs">{errors.officeNumber?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>
        </>}

        {/* ── Workplace supervisor fields ── */}
        {role === 'workplace_supervisor' && <>
          <FormControl isInvalid={!!errors.companyName}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Organisation / Company
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50"
              placeholder="e.g. MTN Uganda"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('companyName', { required: 'Organisation is required' })}
            />
            <FormErrorMessage fontSize="xs">{errors.companyName?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.position}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Job Title / Position
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50"
              placeholder="e.g. IT Manager"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('position', { required: 'Position is required' })}
            />
            <FormErrorMessage fontSize="xs">{errors.position?.message}</FormErrorMessage>
          </FormControl>
        </>}

        {/* ── Admin fields ── */}
        {role === 'admin' && <>
          <GridItem colSpan={2}>
            <FormControl isInvalid={!!errors.department}>
              <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                Department / Unit
              </FormLabel>
              <Input
                size="sm" borderRadius="lg" bg="gray.50"
                placeholder="e.g. Internship Coordination Office"
                _focus={{ bg: 'white', borderColor: 'brand.400' }}
                {...register('department', { required: 'Department is required' })}
              />
              <FormErrorMessage fontSize="xs">{errors.department?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>
        </>}

        {/* ── Common: Email ── */}
        <GridItem colSpan={2}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Email Address
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50" type="email"
              placeholder={
                role === 'student'             ? 'student@institution.ac.ug'  :
                role === 'academic_supervisor' ? 'staff@institution.ac.ug'    :
                role === 'admin'               ? 'admin@institution.ac.ug'    :
                                                 'supervisor@company.com'
              }
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Enter a valid email address' },
              })}
            />
            <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
          </FormControl>
        </GridItem>

        {/* ── Common: Phone ── */}
        <GridItem colSpan={2}>
          <FormControl isInvalid={!!errors.phone}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Phone Number
            </FormLabel>
            <Input
              size="sm" borderRadius="lg" bg="gray.50" type="tel"
              placeholder="e.g. 0701000000"
              _focus={{ bg: 'white', borderColor: 'brand.400' }}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^[0-9+\s]{9,15}$/, message: 'Enter a valid phone number' },
              })}
            />
            <FormErrorMessage fontSize="xs">{errors.phone?.message}</FormErrorMessage>
          </FormControl>
        </GridItem>

        {/* ── Common: Password ── */}
        <GridItem colSpan={{ base: 2, md: 1 }}>
          <FormControl isInvalid={!!errors.password}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Password
            </FormLabel>
            <InputGroup size="sm">
              <Input
                type={showPw ? 'text' : 'password'}
                borderRadius="lg" bg="gray.50"
                placeholder="Min. 8 characters"
                _focus={{ bg: 'white', borderColor: 'brand.400' }}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Must include uppercase, lowercase and a number',
                  },
                })}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost" size="xs" aria-label="Toggle password"
                  icon={showPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPw((p) => !p)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage fontSize="xs">{errors.password?.message}</FormErrorMessage>
          </FormControl>
        </GridItem>

        {/* ── Common: Confirm Password ── */}
        <GridItem colSpan={{ base: 2, md: 1 }}>
          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
              Confirm Password
            </FormLabel>
            <InputGroup size="sm">
              <Input
                type={showConfirm ? 'text' : 'password'}
                borderRadius="lg" bg="gray.50"
                placeholder="Repeat password"
                _focus={{ bg: 'white', borderColor: 'brand.400' }}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === pw || 'Passwords do not match',
                })}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost" size="xs" aria-label="Toggle confirm password"
                  icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowConfirm((p) => !p)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage fontSize="xs">{errors.confirmPassword?.message}</FormErrorMessage>
          </FormControl>
        </GridItem>

      </Grid>
    </VStack>
  )
}

// ── Step 3: Success ────────────────────────────────────
function SuccessStep({ role }) {
  const navigate = useNavigate()
  const roleLabel = ROLES.find((r) => r.value === role)?.label || 'User'

  return (
    <VStack spacing={5} textAlign="center" py={4}>
      <Flex w="70px" h="70px" borderRadius="full" bg="brand.50"
        align="center" justify="center">
        <CheckCircleIcon boxSize={10} color="brand.500" />
      </Flex>
      <Box>
        <Heading size="md" color="gray.800" fontFamily="heading" mb={2}>
          Registration Successful!
        </Heading>
        <Text fontSize="sm" color="gray.500" maxW="320px" lineHeight="1.8">
          Your <Text as="span" fontWeight="600" color="brand.600">{roleLabel}</Text> account
          has been created. You can now sign in using your email and password.
        </Text>
      </Box>
      <Alert status="info" borderRadius="lg" fontSize="xs" textAlign="left">
        <AlertIcon />
        {role === 'student'
          ? 'Your account is pending approval from the administration.'
          : role === 'academic_supervisor'
          ? 'Staff accounts require manual verification before full system access is granted.'
          : role === 'admin'
          ? 'Administrator account created. You can now manage internship placements.'
          : 'Your account is active. Sign in to start supervising interns.'}
      </Alert>
      <Button
        w="100%" bg="brand.600" color="white" borderRadius="lg" size="md"
        _hover={{ bg: 'brand.700' }}
        onClick={() => navigate('/login')}
      >
        Go to Sign In
      </Button>
    </VStack>
  )
}

// ── Main Register page ─────────────────────────────────
const STEPS = ['Select Role', 'Your Details', 'Done']

function Register() {
  const { activeStep, setActiveStep } = useSteps({ index: 0, count: STEPS.length })
  const [selectedRole, setSelectedRole] = useState('')
  const [apiError,     setApiError]     = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [loading,      setLoading]      = useState(false)

  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm()

  const handleRoleNext = () => {
    if (!selectedRole) return
    setActiveStep(1)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    try {
      const { confirmPassword, fullName, ...rest } = data

      
      const nameParts  = (fullName || '').trim().split(' ')
      const first_name = nameParts[0] || ''
      const last_name  = nameParts.slice(1).join(' ') || ''

      
      const payload = {
        email:        rest.email,
        username:     rest.email,
        password:     rest.password,
        role:         selectedRole,
        first_name,
        last_name,
        phone_number: rest.phone,

        // Student
        registration_number: rest.regNumber    || undefined,
        year_of_study:       rest.yearOfStudy  || undefined,
        course:              rest.course       || undefined,
        department:          rest.department   || undefined,

        // Academic supervisor
        staff_id:      rest.staffId      || undefined,
        office_number: rest.officeNumber || undefined,

        // Workplace supervisor
        company_name: rest.companyName || undefined,
        position:     rest.position    || undefined,
      }

      await authService.register(payload)
      setActiveStep(2)

    } catch (err) {
      // ✅ Show all backend validation errors
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ')
        setApiError(messages)
      } else {
        setApiError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" bg="#0f1f2e">

      {/* ── Left branding panel ── */}
      <Flex
        flex={1} direction="column" justify="center" px={16}
        display={{ base: 'none', lg: 'flex' }}
        bg="linear-gradient(160deg, #0f1f2e 0%, #0d3d2a 100%)"
        borderRight="1px solid rgba(52,196,144,0.15)"
      >
        <Box
          display="inline-block" bg="brand.700" px={4} py={2}
          borderRadius="md" mb={6} w="fit-content"
        >
          <Text fontSize="3xl" fontWeight="900" color="white" letterSpacing="widest">
            ILES
          </Text>
        </Box>

        <Heading size="xl" color="white" fontFamily="heading" mb={4} lineHeight="1.25">
          Create Your<br />Account
        </Heading>

        <Text color="gray.400" fontSize="sm" maxW="320px" lineHeight="1.9">
          Join the Internship Logging & Evaluation System. Select your role
          and fill in your details to get started.
        </Text>

        <Box mt={10}>
          {STEPS.map((step, i) => (
            <Flex key={step} align="center" gap={3} mb={4}>
              <Flex
                w="28px" h="28px" borderRadius="full" flexShrink={0}
                align="center" justify="center" fontSize="12px" fontWeight="700"
                bg={activeStep >= i ? 'brand.500' : 'rgba(255,255,255,0.1)'}
                color={activeStep >= i ? 'white' : 'gray.500'}
                transition="all 0.2s"
              >
                {activeStep > i ? '✓' : i + 1}
              </Flex>
              <Text
                fontSize="sm"
                color={activeStep === i ? 'white' : activeStep > i ? 'brand.300' : 'gray.500'}
                fontWeight={activeStep === i ? '600' : '400'}
              >
                {step}
              </Text>
            </Flex>
          ))}
        </Box>
      </Flex>

      {/* ── Right form panel ── */}
      <Flex
        flex={1} align="center" justify="center"
        px={{ base: 4, md: 8 }} py={8} bg="white" overflowY="auto"
      >
        <Box w="100%" maxW="480px">

          {/* Mobile logo */}
          <Text
            fontSize="2xl" fontWeight="900" color="brand.600"
            letterSpacing="widest" mb={6}
            display={{ base: 'block', lg: 'none' }}
          >
            ILES
          </Text>

          {/* Progress bar */}
          {activeStep < 2 && (
            <Box mb={6}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.400">
                  Step {activeStep + 1} of {STEPS.length - 1}
                </Text>
                <Text fontSize="xs" color="brand.600" fontWeight="600">
                  {STEPS[activeStep]}
                </Text>
              </HStack>
              <Progress
                value={(activeStep / (STEPS.length - 1)) * 100}
                size="xs" colorScheme="green" borderRadius="full"
                bg="gray.100"
              />
            </Box>
          )}

          {/* ── Step content ── */}
          {activeStep === 0 && (
            <>
              <RoleStep selected={selectedRole} onSelect={setSelectedRole} />
              <Button
                mt={6} w="100%" bg="brand.600" color="white" borderRadius="lg"
                size="md" _hover={{ bg: 'brand.700' }}
                isDisabled={!selectedRole}
                onClick={handleRoleNext}
              >
                Continue
              </Button>
            </>
          )}

          {activeStep === 1 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4}>

                {apiError && (
                  <Alert status="error" borderRadius="lg" fontSize="sm">
                    <AlertIcon />{apiError}
                  </Alert>
                )}

                <FieldsStep
                  role={selectedRole}
                  register={register}
                  errors={errors}
                  showPw={showPw}
                  setShowPw={setShowPw}
                  showConfirm={showConfirm}
                  setShowConfirm={setShowConfirm}
                  watch={watch}
                />

                <HStack w="100%" spacing={3} pt={2}>
                  <Button
                    variant="outline" size="md" borderRadius="lg" flex={1}
                    onClick={() => setActiveStep(0)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit" size="md" borderRadius="lg" flex={2}
                    bg="brand.600" color="white" _hover={{ bg: 'brand.700' }}
                    isLoading={loading} loadingText="Creating account..."
                  >
                    Create Account
                  </Button>
                </HStack>

              </VStack>
            </form>
          )}

          {activeStep === 2 && <SuccessStep role={selectedRole} />}

          {activeStep < 2 && (
            <Text fontSize="sm" color="gray.500" textAlign="center" mt={5}>
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="brand.600" fontWeight="600">
                Sign in
              </Link>
            </Text>
          )}

        </Box>
      </Flex>
    </Flex>
  )
}

export default Register