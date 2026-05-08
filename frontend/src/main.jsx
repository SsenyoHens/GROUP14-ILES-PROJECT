import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'   // ← add this
import App from './App.jsx'
import theme from './theme.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>          {/* ← wrap App in this */}
        <App />
      </AuthProvider>
    </ChakraProvider>
  </StrictMode>
)