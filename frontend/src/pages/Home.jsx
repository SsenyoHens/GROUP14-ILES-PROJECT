import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Flex, VStack, HStack, Text, Heading, Button,
  Icon, Grid, Badge, Link,
} from '@chakra-ui/react'
import {
  MdSchool, MdBusiness, MdAdminPanelSettings, MdSupervisorAccount,
  MdCheckCircle, MdArrowForward, MdLock,
} from 'react-icons/md'
import Footer from '../components/Footer'

const FEATURES = [
  { icon: MdSchool,             label: 'Student Tracking',      desc: 'Monitor intern progress, logs and attendance in real time.'        },
  { icon: MdBusiness,           label: 'Placement Management',  desc: 'Coordinate organisations, assign supervisors and track placements.' },
  { icon: MdAdminPanelSettings, label: 'Evaluation Tools',      desc: 'Run structured mid-term and final evaluations with grading.'        },
  { icon: MdSupervisorAccount,  label: 'Multi-Role Access',     desc: 'Dedicated portals for administrators, supervisors and students.'    },
]

const ROLES_INFO = [
  { role: 'Internship Administrator', color: 'brand',  desc: 'Manage placements, users and system-wide reports.'    },
  { role: 'Academic Supervisor',      color: 'purple', desc: 'Monitor assigned students, schedule visits, evaluate.' },
  { role: 'Workplace Supervisor',     color: 'blue',   desc: 'Review intern logs and provide workplace feedback.'    },
  { role: 'Student',                  color: 'orange', desc: 'Submit logs, view evaluations and track progress.'     },
]

function Home() {
  const navigate = useNavigate()

  return (
    <Flex minH="100vh" direction="column" bg="#0f1f2e">

      {/* ── Navbar ── */}
      <Flex
        px={{ base: 5, md: 10 }} py={4}
        align="center" justify="space-between"
        borderBottom="1px solid rgba(52,196,144,0.12)"
      >
        <Text fontSize="xl" fontWeight="900" color="brand.300"
          letterSpacing="widest" fontFamily="heading">
          ILES
        </Text>
        <HStack spacing={3}>
          <Button
            as={RouterLink} to="/register"
            size="sm" variant="ghost" color="gray.400"
            _hover={{ color: 'white' }} fontSize="sm"
          >
            Register
          </Button>
          <Button
            as={RouterLink} to="/login"
            size="sm" bg="brand.600" color="white"
            borderRadius="lg" _hover={{ bg: 'brand.500' }}
            leftIcon={<Icon as={MdLock} boxSize={3} />}
          >
            Sign In
          </Button>
        </HStack>
      </Flex>

      {/* ── Hero ── */}
      <Flex
        flex={1} direction="column" align="center" justify="center"
        px={{ base: 5, md: 10 }} py={16} textAlign="center"
        position="relative" overflow="hidden"
      >
        {/* Background orbs */}
        <Box position="absolute" top="10%" left="5%" w="300px" h="300px"
          borderRadius="full" bg="rgba(52,196,144,0.04)" filter="blur(60px)" />
        <Box position="absolute" bottom="10%" right="5%" w="250px" h="250px"
          borderRadius="full" bg="rgba(66,153,225,0.05)" filter="blur(60px)" />

        <Badge
          borderRadius="full" px={4} py={1}
          fontSize="11px" letterSpacing="wider" mb={5}
          bg="rgba(52,196,144,0.12)" color="brand.300"
          border="1px solid rgba(52,196,144,0.25)"
        >
          Session 2025 / 26
        </Badge>

        <Heading
          fontSize={{ base: '3xl', md: '5xl' }} fontWeight="900"
          color="white" fontFamily="heading" lineHeight="1.15" mb={5}
          maxW="680px"
        >
          Internship Logging &{' '}
          <Text as="span" color="brand.300">Evaluation</Text>{' '}
          System
        </Heading>

        <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.400"
          maxW="480px" lineHeight="1.9" mb={8}>
          A centralised platform connecting students, academic supervisors,
          workplace supervisors and internship administrators to streamline
          every stage of the internship lifecycle.
        </Text>

        <HStack spacing={4} flexWrap="wrap" justify="center">
          <Button
            size="lg" bg="brand.600" color="white" borderRadius="xl"
            px={8} _hover={{ bg: 'brand.500', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
            rightIcon={<Icon as={MdArrowForward} />}
            onClick={() => navigate('/login')}
          >
            Sign In to Portal
          </Button>
          <Button
            size="lg" variant="outline"
            borderColor="rgba(52,196,144,0.35)" color="brand.300"
            borderRadius="xl" px={8}
            _hover={{ bg: 'rgba(52,196,144,0.08)', borderColor: 'brand.400' }}
            transition="all 0.2s"
            onClick={() => navigate('/register')}
          >
            Create Account
          </Button>
        </HStack>
      </Flex>

      {/* ── Features ── */}
      <Box px={{ base: 5, md: 10 }} pb={14}>
        <Text fontSize="11px" color="gray.600" textTransform="uppercase"
          letterSpacing="wider" textAlign="center" mb={6}>
          What ILES covers
        </Text>
        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4}>
          {FEATURES.map(f => (
            <Box
              key={f.label} p={5} borderRadius="2xl"
              bg="rgba(255,255,255,0.03)"
              border="1px solid rgba(255,255,255,0.07)"
              _hover={{ bg: 'rgba(52,196,144,0.06)', borderColor: 'rgba(52,196,144,0.2)' }}
              transition="all 0.2s"
            >
              <Flex
                w="38px" h="38px" borderRadius="lg" mb={3}
                bg="rgba(52,196,144,0.1)" align="center" justify="center"
              >
                <Icon as={f.icon} color="brand.400" boxSize={5} />
              </Flex>
              <Text fontSize="sm" fontWeight="700" color="white" mb={1}>{f.label}</Text>
              <Text fontSize="12px" color="gray.500" lineHeight="1.7">{f.desc}</Text>
            </Box>
          ))}
        </Grid>
      </Box>

      {/* ── Roles ── */}
      <Box
        px={{ base: 5, md: 10 }} py={10}
        borderTop="1px solid rgba(255,255,255,0.05)"
        bg="rgba(0,0,0,0.2)"
      >
        <Text fontSize="11px" color="gray.600" textTransform="uppercase"
          letterSpacing="wider" textAlign="center" mb={6}>
          Who uses ILES
        </Text>
        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={3}>
          {ROLES_INFO.map(r => (
            <Flex
              key={r.role} direction="column" gap={2} p={4} borderRadius="xl"
              bg="rgba(255,255,255,0.02)"
              border="1px solid rgba(255,255,255,0.06)"
              _hover={{ bg: 'rgba(255,255,255,0.04)' }}
              transition="all 0.2s"
            >
              <HStack>
                <Icon as={MdCheckCircle} color={`${r.color}.400`} boxSize={4} />
                <Text fontSize="sm" fontWeight="700" color="white">{r.role}</Text>
              </HStack>
              <Text fontSize="11px" color="gray.500" lineHeight="1.6">{r.desc}</Text>
            </Flex>
          ))}
        </Grid>
      </Box>

      {/* ── Footer ── */}
      <Footer />

    </Flex>
  )
}

export default Home