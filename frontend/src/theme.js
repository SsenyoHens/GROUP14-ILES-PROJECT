import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50:  '#e6f0fb',
      100: '#b5d4f4',
      200: '#85b7eb',
      500: '#1560a8',
      700: '#0f2d52',
      800: '#0a1f3a',
      900: '#060f1d',
    },
  },
  fonts: {
    heading: `'Segoe UI', sans-serif`,
    body:    `'Segoe UI', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'blue' },
    },
  },
})

export default theme