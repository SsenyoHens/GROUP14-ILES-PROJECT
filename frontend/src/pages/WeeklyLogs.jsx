import {
    Box,
    Heading,
    VStack,
    Input,
    Textarea,
    Button
} from '@chakra-ui/react'

import { useState } from 'react'

import Navbar from '../components/Navbar'

import { weeklyLogService } from '../api/services'

function WeeklyLogs() {

    const [formData, setFormData] = useState({
        week_number: '',
        activities_done: '',
        challenges: '',
        skills_gained: ''
    })

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async () => {

        try {

            const response = await weeklyLogService.create(formData)

            console.log(response.data)

            alert('Weekly log submitted successfully')

            setFormData({
                week_number: '',
                activities_done: '',
                challenges: '',
                skills_gained: ''
            })

        } catch (error) {

            console.error(error)

            alert('Submission failed')
        }
    }

    return (

        <>
            <Navbar />

            <Box p={5}>

                <Heading mb={5}>
                    Weekly Log Submission
                </Heading>

                <VStack spacing={4}>

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
                        onClick={handleSubmit}
                    >
                        Submit Weekly Log
                    </Button>

                </VStack>

            </Box>
        </>
    )
}

export default WeeklyLogs