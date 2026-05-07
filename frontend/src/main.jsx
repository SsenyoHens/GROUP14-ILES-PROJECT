import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'
import theme from './theme.js'
<<<<<<< HEAD

=======
>>>>>>> workplace-supervisor

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ChakraProvider>
  </StrictMode>
)