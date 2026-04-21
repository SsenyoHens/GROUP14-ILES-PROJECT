import {
  AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'
import { useRef } from 'react'

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', colorScheme = 'red' }) {
  const cancelRef = useRef()

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent borderRadius="xl">
          <AlertDialogHeader fontSize="md" fontWeight="700" color="gray.800">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody fontSize="sm" color="gray.500">
            {message}
          </AlertDialogBody>
          <AlertDialogFooter gap={3}>
            <Button ref={cancelRef} variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme={colorScheme} size="sm" borderRadius="lg" onClick={() => { onConfirm(); onClose() }}>
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default ConfirmDialog