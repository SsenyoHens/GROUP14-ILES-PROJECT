import { Button, Flex, Heading } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

function Navbar() {

    const navigate = useNavigate()

    const handleLogout = () => {

        localStorage.removeItem('user')

        navigate('/login')
    }

    return (

        <Flex
            justify="space-between"
            align="center"
            p={4}
            bg="blue.500"
            color="white"
        >

            <Heading size="md">
                ILES Dashboard
            </Heading>

            <Button
                colorScheme="red"
                onClick={handleLogout}
            >
                Logout
            </Button>

        </Flex>
    )
}

export default Navbar