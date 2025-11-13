// src/features/ui/components/mobile/generate/MobilePromptEditor.tsx
import { Button, Flex } from '@invoke-ai/ui-library';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { PiCheckBold, PiX } from 'react-icons/pi';

interface MobilePromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Full-screen mobile prompt editor
 * Provides a distraction-free editing experience for prompts
 * Uses native textarea for better iOS text selection support
 */
export const MobilePromptEditor = memo(
  ({ isOpen, onClose, label, value, onChange, placeholder }: MobilePromptEditorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [editedValue, setEditedValue] = useState(value);
    const originalValueRef = useRef(value);

    // Update edited value when prop changes or when opening
    useEffect(() => {
      if (isOpen) {
        setEditedValue(value);
        originalValueRef.current = value;
      }
    }, [isOpen, value]);

    // Focus textarea when opened
    useEffect(() => {
      if (isOpen && textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }, [isOpen]);

    const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
      setEditedValue(e.target.value);
    }, []);

    const handleDone = useCallback(() => {
      onChange(editedValue);
      onClose();
    }, [editedValue, onChange, onClose]);

    const handleCancel = useCallback(() => {
      // Discard changes by reverting to original value
      setEditedValue(originalValueRef.current);
      onChange(originalValueRef.current);
      onClose();
    }, [onChange, onClose]);

    if (!isOpen) {
      return null;
    }

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'var(--invoke-colors-base-900)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Flex
          px={4}
          py={3}
          bg="base.850"
          borderBottomWidth={1}
          borderColor="base.700"
          justifyContent="center"
          alignItems="center"
        >
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--invoke-colors-base-100)',
            }}
          >
            {label}
          </span>
        </Flex>

        {/* Native textarea for better iOS support */}
        <textarea
          ref={textareaRef}
          value={editedValue}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            width: '100%',
            border: 'none',
            outline: 'none',
            padding: '1rem',
            fontSize: '1rem',
            fontFamily: 'inherit',
            backgroundColor: 'var(--invoke-colors-base-900)',
            color: 'var(--invoke-colors-base-100)',
            resize: 'none',
            WebkitUserSelect: 'text',
            userSelect: 'text',
            WebkitTouchCallout: 'default',
            touchAction: 'manipulation',
          }}
        />

        {/* Bottom action bar for one-handed use */}
        <Flex
          px={4}
          py={3}
          bg="base.850"
          borderTopWidth={1}
          borderColor="base.700"
          gap={3}
          justifyContent="stretch"
        >
          <Button onClick={handleCancel} variant="ghost" size="lg" w="full" leftIcon={<PiX />}>
            Cancel
          </Button>
          <Button onClick={handleDone} colorScheme="invokeBlue" size="lg" w="full" leftIcon={<PiCheckBold />}>
            Done
          </Button>
        </Flex>
      </div>
    );
  }
);

MobilePromptEditor.displayName = 'MobilePromptEditor';
