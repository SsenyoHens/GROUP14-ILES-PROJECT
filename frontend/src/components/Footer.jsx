import { Box, Flex, Text, HStack, Link, Grid, VStack } from '@chakra-ui/react'

function Footer({ minimal = false }) {
  // ── Dark footer for Home page (no prop needed — auto-detected via minimal=false)
  // ── Light footer for admin pages (minimal=true passed from PublicLayout/AdminLayout)
  const isDark = !minimal

  const bg          = isDark ? '#0a1929'                         : 'white'
  const borderColor = isDark ? 'rgba(255,255,255,0.06)'          : 'gray.100'
  const brandColor  = isDark ? 'brand.300'                       : 'blue.600'
  const subtitleClr = isDark ? 'rgba(255,255,255,0.35)'          : 'gray.400'
  const bodyClr     = isDark ? 'rgba(255,255,255,0.45)'          : 'gray.500'
  const headingClr  = isDark ? 'rgba(255,255,255,0.25)'          : 'gray.400'
  const tagBorder   = isDark ? 'rgba(52,196,144,0.25)'           : 'gray.200'
  const tagClr      = isDark ? 'brand.300'                       : 'gray.400'
  const linkHover   = isDark ? 'white'                           : 'gray.800'
  const bottomClr   = isDark ? 'rgba(255,255,255,0.25)'          : 'gray.400'
  const bottomBdr   = isDark ? 'rgba(255,255,255,0.06)'          : 'gray.100'

  return (
    <Box
      as="footer"
      bg={bg}
      borderTop="1px solid"
      borderColor={borderColor}
      pt={minimal ? 6 : 10}
    >
      <Box maxW="1100px" mx="auto" px={8}>
        {!minimal && (
          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={12} pb={9}>
            {/* Brand */}
            <Box>
              <HStack spacing={2} mb={3}>
                <Text fontSize="15px" fontWeight="700" letterSpacing="widest" color={brandColor}>
                  ILES
                </Text>
                <Box w="1px" h="14px" bg={borderColor} />
                <Text fontSize="12px" color={subtitleClr}>
                  Internship Logging &amp; Evaluation System
                </Text>
              </HStack>
              <Text fontSize="13px" color={bodyClr} lineHeight="1.75" mb={5} maxW="300px">
                A platform that connects students, internship administrators, academic supervisors,
                and workplace supervisors to streamline internship management and evaluation.
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {['Students', 'Academic Supervisors', 'Workplace Supervisors'].map(role => (
                  <Text
                    key={role} fontSize="11px" px={3} py="3px"
                    border="1px solid" borderColor={tagBorder}
                    borderRadius="full" color={tagClr}
                  >
                    {role}
                  </Text>
                ))}
              </HStack>
            </Box>

            {/* About */}
            <Box>
              <Text
                fontSize="11px" fontWeight="600" letterSpacing="widest"
                textTransform="uppercase" mb={4} color={headingClr}
              >
                About
              </Text>
              <VStack align="start" spacing={2}>
                {['What is ILES?', 'How it works', 'FAQs', 'Contact us'].map(link => (
                  <Link key={link} href="#" fontSize="13px" color={bodyClr}
                    _hover={{ color: linkHover }} transition="color 0.15s">
                    {link}
                  </Link>
                ))}
              </VStack>
            </Box>

            {/* Access */}
            <Box>
              <Text
                fontSize="11px" fontWeight="600" letterSpacing="widest"
                textTransform="uppercase" mb={4} color={headingClr}
              >
                Access
              </Text>
              <VStack align="start" spacing={2}>
                {['Sign in', 'Request access', 'User guide', 'Accessibility'].map(link => (
                  <Link key={link} href="#" fontSize="13px" color={bodyClr}
                    _hover={{ color: linkHover }} transition="color 0.15s">
                    {link}
                  </Link>
                ))}
              </VStack>
            </Box>
          </Grid>
        )}

        {/* Bottom bar */}
        <Flex
          borderTop="1px solid" borderColor={bottomBdr}
          py={4} justify="space-between" align="center" flexWrap="wrap" gap={3}
        >
          <Text fontSize="12px" color={bottomClr}>
            © {new Date().getFullYear()} ILES · Group 14 · Session 2025/26
          </Text>
          <HStack spacing={4}>
            {['Privacy Policy', 'Terms of Use'].map(label => (
              <Link key={label} href="#" fontSize="12px" color={bottomClr}
                _hover={{ color: linkHover }} transition="color 0.15s">
                {label}
              </Link>
            ))}
          </HStack>
        </Flex>
      </Box>
    </Box>
  )
}

export default Footer