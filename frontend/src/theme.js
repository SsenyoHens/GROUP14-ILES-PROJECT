import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
<<<<<<< HEAD
      50:  '#edfdf6',
      100: '#d0f7e7',
      200: '#a3edd0',
      300: '#6addb4',
      400: '#34c490',
      500: '#16a872',
      600: '#0e8a5e',
      700: '#0d6e4c',
      800: '#0d5840',
      900: '#0b4733',
    },
    sidebar: {
      bg:     '#0f1f2e',
      hover:  '#162d40',
      active: '#1a3a52',
      border: '#1e3448',
      text:   '#94b4c8',
      accent: '#34c490',
    },
  },
  fonts: {
    heading: `'Georgia', 'Times New Roman', serif`,
    body:    `'Trebuchet MS', 'Gill Sans', sans-serif`,
  },
  styles: {
    global: {
      body: { bg: '#f4f6f9', color: '#1a2535' },
      '*':  { boxSizing: 'border-box' },
=======
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
>>>>>>> workplace-supervisor
    },
  },
  components: {
    Button: {
<<<<<<< HEAD
      variants: {
        solid: {
          bg: 'brand.600',
          color: 'white',
          _hover: { bg: 'brand.700' },
          _active: { bg: 'brand.800' },
        },
      },
=======
      defaultProps: { colorScheme: 'blue' },
>>>>>>> workplace-supervisor
    },
  },
})

export default theme