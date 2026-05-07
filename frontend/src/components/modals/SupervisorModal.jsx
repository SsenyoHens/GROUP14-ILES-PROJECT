import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
    Button, VStack, FormControl, FormLabel, Input, Select
} from '@chakra-ui/react'

function SupervisorModal({ isOpen, onClose, editingId, formData, setFormData, onSave }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {editingId ? 'Edit Supervisor' : 'Add New Supervisor'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">First Name</FormLabel>
                            <Input
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                size="sm"
                                borderRadius="md"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Last Name</FormLabel>
                            <Input
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                size="sm"
                                borderRadius="md"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Email</FormLabel>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                size="sm"
                                borderRadius="md"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Phone</FormLabel>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                size="sm"
                                borderRadius="md"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Organization</FormLabel>
                            <Input
                                value={formData.organization}
                                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                size="sm"
                                borderRadius="md"
                                placeholder="e.g., Tech Company Ltd"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Department</FormLabel>
                            <Select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                size="sm"
                                borderRadius="md"
                            >
                                <option value="">Select department</option>
                                <option value="IT">Information Technology</option>
                                <option value="CS">Computer Science</option>
                                <option value="SE">Software Engineering</option>
                            </Select>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="brand" onClick={onSave}>
                        {editingId ? 'Update' : 'Create'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default SupervisorModal