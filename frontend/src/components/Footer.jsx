import { Box, Flex, Text } from '@chakra-ui/react'

function Footer() {
  return (
    <Box bg="brand.700" px={7} py={3}>
      <Flex justify="space-between" align="center">
        <Text fontSize="xs" color="blue.300">
          ILES — Internship Learning & Evaluation System
        </Text>
        <Text fontSize="xs" color="blue.400">
          © {new Date().getFullYear()} Admin Panel • 
        </Text>
      </Flex>
    </Box>
  )
}

export default Footer