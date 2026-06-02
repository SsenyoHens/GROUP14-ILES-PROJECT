import { Tr, Td, Center, Spinner } from '@chakra-ui/react'

function LoadingTable({ cols }) {
  return (
    <Tr>
      <Td colSpan={cols} py={12}>
        <Center><Spinner color="brand.500" thickness="3px" /></Center>
      </Td>
    </Tr>
  )
}

export default LoadingTable