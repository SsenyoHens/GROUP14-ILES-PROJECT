import Navbar from '../components/Navbar'

import {
    Box,
    Heading,
    Spinner,
    Center,
    Input,
    Button,
    SimpleGrid
} from '@chakra-ui/react'

import {
    SupervisorFilters,
    SupervisorTable
} from '../components/supervisors'

import { useEffect, useState } from 'react'

import { supervisorService } from '../api/services'

function Supervisors() {

    const [loading, setLoading] = useState(true)

    const [supervisors, setSupervisors] = useState([])

    const [editingId, setEditingId] = useState(null)

    const [searchTerm, setSearchTerm] = useState('')

    const [departmentFilter, setDepartmentFilter] = useState('')

    const user = JSON.parse(localStorage.getItem('user'))

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'academic_supervisor',
        phone: '',
        organization: '',
        department: '',
    })

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async () => {

        try {

            if (editingId) {

                await supervisorService.update(
                    editingId,
                    formData
                )

                alert('Supervisor updated successfully')

            } else {

                await supervisorService.create(formData)

                alert('Supervisor created successfully')
            }

            await fetchSupervisors()

            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                role: 'academic_supervisor',
                phone: '',
                organization: '',
                department: '',
            })

            setEditingId(null)

        } catch (error) {

            console.error(error)

            alert('Operation failed')
        }
    }

    const fetchSupervisors = async () => {

        try {

            const response = await supervisorService.getAll()

            setSupervisors(response.data)

        } catch (error) {

            console.error(error)

        } finally {

            setLoading(false)
        }
    }

    useEffect(() => {

        fetchSupervisors()

    }, [])

    const handleDelete = async (id) => {

        try {

            await supervisorService.delete(id)

            await fetchSupervisors()

        } catch (error) {

            console.error(error)
        }
    }

    const handleEdit = (supervisor) => {

        setFormData({
            first_name: supervisor.first_name || '',
            last_name: supervisor.last_name || '',
            email: supervisor.email || '',
            password: '',
            role: supervisor.role || 'academic_supervisor',
            phone: supervisor.phone || '',
            organization: supervisor.organization || '',
            department: supervisor.department || '',
        })

        setEditingId(supervisor.id)
    }

    const filteredSupervisors = supervisors.filter((supervisor) => {

        const fullName =
            `${supervisor.first_name} ${supervisor.last_name}`.toLowerCase()

        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase()) ||
            supervisor.email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesDepartment =
            departmentFilter === '' ||
            supervisor.department === departmentFilter

        return matchesSearch && matchesDepartment
    })

    if (loading) {

        return (
            <Center h="60vh">
                <Spinner size="xl" />
            </Center>
        )
    }

    return (

        <>
            <Navbar />

            <Box p={5}>

                <Heading mb={5}>
                    Supervisor Dashboard
                </Heading>

                <SupervisorFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    departmentFilter={departmentFilter}
                    setDepartmentFilter={setDepartmentFilter}
                />

                {user?.role === 'admin' && (

                    <Box mb={5}>

                        <SimpleGrid columns={2} spacing={4}>

                            <Input
                                placeholder="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />

                            <Input
                                placeholder="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />

                            <Input
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <Input
                                placeholder="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />

                            <Input
                                placeholder="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />

                            <Input
                                placeholder="Organization"
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                            />

                            <Input
                                placeholder="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            />

                        </SimpleGrid>

                        <Button
                            mt={4}
                            colorScheme="blue"
                            onClick={handleSubmit}
                        >
                            {editingId
                                ? 'Update Supervisor'
                                : 'Add Supervisor'}
                        </Button>

                    </Box>
                )}

                <SupervisorTable
                    supervisors={filteredSupervisors}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                />

            </Box>
        </>
    )
}

export default Supervisors