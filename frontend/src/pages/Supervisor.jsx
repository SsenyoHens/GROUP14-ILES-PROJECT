import { useEffect, useState } from 'react'
import {
    Box, Spinner, Center, Alert, AlertIcon, useToast, useDisclosure,
} from '@chakra-ui/react'
import PageHeader from '../components/PageHeader'
import { supervisorService } from '../api/services'
import { SupervisorFilters, SupervisorTable, SupervisorModal } from '../components/supervisors'

/*Dashboard for Supervisor*/
function Supervisors() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [supervisors, setSupervisors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDept, setFilterDept] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        organization: '',
    })

    useEffect(() => {
        fetchSupervisors()
    }, [])

    const fetchSupervisors = async () => {
        setLoading(true)
        try {
            const res = await supervisorService.getAll()
            setSupervisors(res.data)
            setError('')
        } catch (err) {
            setError('Failed to load supervisors')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingId(null)
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            department: '',
            organization: '',
        })
        onOpen()
    }

    const handleEdit = (supervisor) => {
        setEditingId(supervisor.id)
        setFormData(supervisor)
        onOpen()
    }

    const handleSave = async () => {
        try {
            if (editingId) {
                await supervisorService.update(editingId, formData)
                toast({
                    title: 'Success',
                    description: 'Supervisor updated successfully',
                    status: 'success',
                    duration: 3000,
                })
            } else {
                await supervisorService.create(formData)
                toast({
                    title: 'Success',
                    description: 'Supervisor created successfully',
                    status: 'success',
                    duration: 3000,
                })
            }
            onClose()
            fetchSupervisors()
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to save supervisor',
                status: 'error',
                duration: 3000,
            })
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supervisor?')) {
            try {
                await supervisorService.delete(id)
                toast({
                    title: 'Success',
                    description: 'Supervisor deleted successfully',
                    status: 'success',
                    duration: 3000,
                })
                fetchSupervisors()
            } catch (err) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete supervisor',
                    status: 'error',
                    duration: 3000,
                })
            }
        }
    }

    const filteredSupervisors = supervisors.filter(sup => {
        const matchesSearch = `${sup.first_name} ${sup.last_name} ${sup.email}`.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDept = !filterDept || sup.department === filterDept
        return matchesSearch && matchesDept
    })

    if (loading) {
        return (
            <Center h="60vh">
                <Spinner size="xl" color="brand.500" thickness="3px" />
            </Center>
        )
    }

    return (
        <Box>
            <PageHeader
                title="Workplace Supervisors"
                subtitle="Manage supervisors from internship host organizations"
            />

            {error && (
                <Alert status="error" borderRadius="lg" mb={4}>
                    <AlertIcon />{error}
                </Alert>
            )}

            {/* Filters and Actions */}
            <SupervisorFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterDept={filterDept}
                setFilterDept={setFilterDept}
                onAdd={handleAdd}
            />

            {/* Supervisors Table */}
            <SupervisorTable
                supervisors={filteredSupervisors}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Add/Edit Modal */}
            <SupervisorModal
                isOpen={isOpen}
                onClose={onClose}
                editingId={editingId}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
            />
        </Box>
    )
}

export default Supervisors