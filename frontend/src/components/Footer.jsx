import { Box, Flex, Text, HStack, Link } from '@chakra-ui/react'

function Footer({ minimal = false }) {
  return (
    <Box
      flexShrink={0}
      bg="white"
      borderTop="1px solid" borderColor="gray.100"
      px={6} py={3}
    >
      <Flex
        justify="space-between" align="center"
        flexWrap="wrap" gap={2}
      >
        {/* Left */}
        <HStack spacing={2}>
          <Text fontSize="11px" fontWeight="700" color="brand.600"
            letterSpacing="widest">
            ILES
          </Text>
          <Text fontSize="11px" color="gray.400">
            — Internship Learning & Evaluation System
          </Text>
        </HStack>

        {/* Right */}
        <HStack spacing={4} divider={
          <Box w="1px" h="10px" bg="gray.200" />
        }>
          {!minimal && (
            <>
              <Text fontSize="11px" color="gray.400">
                Session 2025/26
              </Text>
              <Text fontSize="11px" color="gray.400">
                Admin Portal
              </Text>
            </>
          )}
          <Text fontSize="11px" color="gray.400">
            Group 14 © {new Date().getFullYear()}
          </Text>
        </HStack>
      </Flex>
    </Box>
  )
}

export default Footer