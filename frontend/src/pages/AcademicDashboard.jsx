import {
    Box,
    Heading,
    Text
} from '@chakra-ui/react'

import Navbar from '../components/Navbar'

function AcademicDashboard() {

    return (

        <>
            <Navbar />

            <Box p={5}>

                <Heading mb={4}>
                    Academic Supervisor Dashboard
                </Heading>

                <Text>
                    Welcome academic supervisor 👋
                </Text>

            </Box>
        </>
    )
}

export default AcademicDashboard