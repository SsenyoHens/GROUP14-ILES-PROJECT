import { Box, HStack, Input, Select, Button } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'

function SupervisorFilters({
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter
}) {
    return (
        <Box bg="white" borderRadius="xl" p={4} mb={6}
            border="1px solid" borderColor="gray.100" boxShadow="sm">
            <HStack spacing={4} mb={4}>
                <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="sm"
                    borderRadius="md"
                    flex={1}
                />
                <Select
                    placeholder="Filter by department"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    size="sm"
                    borderRadius="md"
                    w="200px"
                >
                    <option value="IT">IT</option>
                    <option value="CS">Computer Science</option>
                    <option value="SE">Software Engineering</option>
					<option value="">All Departments</option>
                    <option value="IT SUPPORT">IT SUPPORT</option>
                    <option value="IT ENGINEER">IT ENGINEER</option>
                    <option value="IT ANALYSTS">IT ANALYSTS</option>
                </Select>
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="brand"
                    size="sm"
                >
                    Add Supervisor
                </Button>
            </HStack>
        </Box>
    )
}

export default SupervisorFilters