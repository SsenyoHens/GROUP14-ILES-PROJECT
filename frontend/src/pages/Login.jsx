import {
    Box,
    Button,
    Heading,
    Input,
    VStack
} from '@chakra-ui/react'

import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { authService } from '../api/services'

function Login() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })

    }

    const handleSubmit = async (e) => {

        e.preventDefault()

        try {

            const response = await authService.login(formData)

            console.log("FULL RESPONSE:", response)
            console.log("DATA:", response.data)
			
			localStorage.setItem(
                'user',
                JSON.stringify(response.data)
            )

            if (response.data.role === 'admin') {

                navigate('/')

            } else if (
                response.data.role === 'student'
            ) {

                navigate('/student')

            } else if (
                response.data.role === 'academic_supervisor'
            ) {

                navigate('/academic')
            }

        } catch (error) {

            console.error(error)

            alert('Login failed')

        }

    }

    return (

        <Box
            maxW="400px"
            mx="auto"
            mt="100px"
            p={8}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="lg"
        >

            <Heading mb={6} textAlign="center">
                Login
            </Heading>

            <VStack spacing={4} as="form" onSubmit={handleSubmit}>

                <Input
                    placeholder="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <Input
                    placeholder="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <Button
                    colorScheme="blue"
                    width="full"
                    type="submit"
                >
                    Login
                </Button>

            </VStack>

        </Box>

    )
}

export default Login