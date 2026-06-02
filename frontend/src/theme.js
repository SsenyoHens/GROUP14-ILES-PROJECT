import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {

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


    },
  },
  components: {
    Button: {

      variants: {
        solid: {
          bg: 'brand.600',
          color: 'white',
          _hover: { bg: 'brand.700' },
          _active: { bg: 'brand.800' },
        },
      },

    },
  },
})

export default theme