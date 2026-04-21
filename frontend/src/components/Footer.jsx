import { Box, Flex, Text, HStack, Link } from '@chakra-ui/react'
function Footer() {
  return (
    <Box as="footer" bg="white" borderTop="0.5px solid" borderColor="gray.100" pt={10}>
      <Box maxW="1100px" mx="auto" px={8}>

        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={12} pb={9}>

          {/* Brand */}
          <Box>
            <HStack spacing={2} mb={3}>
              <Text fontSize="15px" fontWeight="500" letterSpacing="widest" color="blue.600">ILES</Text>
              <Box w="1px" h="14px" bg="gray.200" />
              <Text fontSize="12px" color="gray.400">Internship Learning & Evaluation System</Text>
            </HStack>
            <Text fontSize="13px" color="gray.500" lineHeight="1.75" mb={5} maxW="300px">
              A platform that connects students, academic supervisors, and workplace
              supervisors to streamline internship management and evaluation.
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {["Students", "Academic Supervisors", "Workplace Supervisors"].map(role => (
                <Text key={role} fontSize="11px" px={3} py="3px"
                  border="0.5px solid" borderColor="gray.200"
                  borderRadius="full" color="gray.400">
                  {role}
                </Text>
              ))}
            </HStack>
          </Box>

          {/* About */}
          <Box>
            <Text fontSize="11px" fontWeight="500" letterSpacing="widest"
              textTransform="uppercase" mb={4}>About</Text>
            <VStack align="start" spacing={2}>
              {["What is ILES?", "How it works", "FAQs", "Contact us"].map(link => (
                <Link key={link} href="#" fontSize="13px" color="gray.500"
                  _hover={{ color: "gray.800" }}>{link}</Link>
              ))}
            </VStack>
          </Box>

          {/* Access */}
          <Box>
            <Text fontSize="11px" fontWeight="500" letterSpacing="widest"
              textTransform="uppercase" mb={4}>Access</Text>
            <VStack align="start" spacing={2}>
              {["Sign in", "Request access", "User guide", "Accessibility"].map(link => (
                <Link key={link} href="#" fontSize="13px" color="gray.500"
                  _hover={{ color: "gray.800" }}>{link}</Link>
              ))}
            </VStack>
          </Box>

        </Grid>

        {/* Bottom bar */}
        <Flex borderTop="0.5px solid" borderColor="gray.100"
          py={4} justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Text fontSize="12px" color="gray.400">
            © {new Date().getFullYear()} ILES · Group 14 · Session 2025/26
          </Text>
          <HStack spacing={4}>
            {["Privacy Policy", "Terms of Use"].map(label => (
              <Link key={label} href="#" fontSize="12px" color="gray.400"
                _hover={{ color: "gray.600" }}>{label}</Link>
            ))}
          </HStack>
        </Flex>

      </Box>
    </Box>
  )
}

export default Footer