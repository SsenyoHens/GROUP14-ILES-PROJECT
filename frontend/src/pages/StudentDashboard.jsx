import {
    Box,
    Heading,
    Text
} from '@chakra-ui/react'

import Navbar from '../components/Navbar'

function StudentDashboard() {

    return (

        <>
            <Navbar />

            <Box p={5}>

                <Heading mb={4}>
                    Student Dashboard
                </Heading>

                <Text>
                    Welcome student 👋
                </Text>

            </Box>
        </>
    )
}

export default StudentDashboard