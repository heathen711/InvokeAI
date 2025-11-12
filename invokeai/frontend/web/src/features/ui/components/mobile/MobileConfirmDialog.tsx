import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@invoke-ai/ui-library';
import { memo } from 'react';

interface MobileConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColorScheme?: string;
  cancelLabel?: string;
}

/**
 * Mobile confirmation dialog (PLACEHOLDER - will be properly implemented in Task 3)
 * Touch-friendly confirmation for destructive actions
 */
export const MobileConfirmDialog = memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    confirmColorScheme = 'red',
    cancelLabel = 'Cancel',
  }: MobileConfirmDialogProps) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="lg">{title}</ModalHeader>
          <ModalBody>
            <Text>{message}</Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button onClick={onClose} variant="ghost" flex={1} size="lg">
              {cancelLabel}
            </Button>
            <Button onClick={onConfirm} colorScheme={confirmColorScheme} flex={1} size="lg">
              {confirmLabel}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

MobileConfirmDialog.displayName = 'MobileConfirmDialog';
