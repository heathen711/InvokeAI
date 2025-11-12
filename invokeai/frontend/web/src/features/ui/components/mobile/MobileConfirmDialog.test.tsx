import { ChakraProvider } from '@invoke-ai/ui-library';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MobileConfirmDialog } from './MobileConfirmDialog';

describe('MobileConfirmDialog', () => {
  it('renders when open', () => {
    render(
      <ChakraProvider>
        <MobileConfirmDialog
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Title"
          message="Test message"
          confirmLabel="Confirm"
        />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test message')).toBeDefined();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ChakraProvider>
        <MobileConfirmDialog
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={onConfirm}
          title="Test"
          message="Test"
          confirmLabel="Confirm"
        />
      </ChakraProvider>
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(
      <ChakraProvider>
        <MobileConfirmDialog
          isOpen={true}
          onClose={onClose}
          onConfirm={vi.fn()}
          title="Test"
          message="Test"
          confirmLabel="Confirm"
        />
      </ChakraProvider>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });
});
