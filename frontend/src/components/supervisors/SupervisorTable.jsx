import { Box, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Button } from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'

function SupervisorTable({
    supervisors,
    handleDelete,
    handleEdit
}) {
    return (
        <Box bg="white" borderRadius="xl" overflow="hidden"
            border="1px solid" borderColor="gray.100" boxShadow="sm">
            {supervisors.length === 0 ? (
                <Box p={8} textAlign="center" color="gray.500">
                    No supervisors found
                </Box>
            ) : (
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50" borderBottom="2px solid" borderColor="gray.200">
                        <Tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Phone</Th>
                            <Th>Organization</Th>
                            <Th>Department</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {supervisors.map((supervisor) => (
                            <Tr key={supervisor.id} _hover={{ bg: 'gray.50' }}>
                                <Td fontWeight="500">{`${supervisor.first_name} ${supervisor.last_name}`}</Td>
                                <Td fontSize="sm" color="gray.600">{supervisor.email}</Td>
                                <Td fontSize="sm">{supervisor.phone || '-'}</Td>
                                <Td fontSize="sm">{supervisor.organization || '-'}</Td>
                                <Td>
                                    <Badge colorScheme="blue" fontSize="xs">
                                        {supervisor.department || 'N/A'}
                                    </Badge>
                                </Td>
                                <Td>
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="blue"
                                            leftIcon={<EditIcon />}
                                            onClick={() => handleEdit(supervisor)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="red"
                                            leftIcon={<DeleteIcon />}
                                            onClick={() => handleDelete(supervisor.id)}
                                        >
                                            Delete
                                        </Button>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </Box>
    )
}

export default SupervisorTable