import {
    Box,
    Button,
    Heading,
    Input,
    Textarea,
    VStack,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge
} from '@chakra-ui/react'

import { useEffect, useState } from 'react'

import { weeklyLogService } from '../api/services'

function StudentDashboard() {

    const [logs, setLogs] = useState([])

    const [formData, setFormData] = useState({
        week_number: '',
        activities_done: '',
        challenges: '',
        skills_gained: ''
    })

    const fetchLogs = async () => {

        try {

            const response = await weeklyLogService.getAll()

            setLogs(response.data)

        } catch (error) {

            console.error(error)

        }

    }

    useEffect(() => {

        fetchLogs()

    }, [])

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })

    }

    const handleSubmit = async (e) => {

        e.preventDefault()

        try {

            await weeklyLogService.create(formData)

            alert('Weekly log submitted!')

            setFormData({
                week_number: '',
                activities_done: '',
                challenges: '',
                skills_gained: ''
            })

            fetchLogs()

        } catch (error) {

            console.error(error)

            alert('Submission failed')

        }

    }

    return (

        <Box p={6}>

            <Heading mb={6}>
                Student Dashboard
            </Heading>

            <Text mb={6}>
                Welcome student 👋
            </Text>

            <VStack
                spacing={4}
                as="form"
                onSubmit={handleSubmit}
                mb={10}
            >

                <Input
                    placeholder="Week Number"
                    name="week_number"
                    value={formData.week_number}
                    onChange={handleChange}
                />

                <Textarea
                    placeholder="Activities Done"
                    name="activities_done"
                    value={formData.activities_done}
                    onChange={handleChange}
                />

                <Textarea
                    placeholder="Challenges Faced"
                    name="challenges"
                    value={formData.challenges}
                    onChange={handleChange}
                />

                <Textarea
                    placeholder="Skills Gained"
                    name="skills_gained"
                    value={formData.skills_gained}
                    onChange={handleChange}
                />

                <Button
                    colorScheme="blue"
                    type="submit"
                >
                    Submit Weekly Log
                </Button>

            </VStack>

            <Heading size="md" mb={4}>
                My Weekly Logs
            </Heading>

            <Table variant="simple">

                <Thead>
                    <Tr>
                        <Th>Week</Th>
                        <Th>Activities</Th>
                        <Th>Status</Th>
                    </Tr>
                </Thead>

                <Tbody>

                    {logs.map((log) => (

                        <Tr key={log.id}>

                            <Td>{log.week_number}</Td>

                            <Td>{log.activities_done}</Td>

                            <Td>

                                <Badge colorScheme="blue">
                                    {log.status}
                                </Badge>

                            </Td>

                        </Tr>

                    ))}

                </Tbody>

            </Table>

        </Box>

    )
}

export default StudentDashboard