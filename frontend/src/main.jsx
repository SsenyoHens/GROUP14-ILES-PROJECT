import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider theme={theme}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ChakraProvider>
);