// src/features/ui/components/mobile/MobileDropdown.tsx
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@invoke-ai/ui-library';
import { memo, useCallback, useMemo } from 'react';
import { PiCaretDown } from 'react-icons/pi';

export interface MobileDropdownOption<T extends string> {
  value: T;
  label: string;
}

interface MobileDropdownProps<T extends string> {
  value: T;
  options: MobileDropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
}

function MobileDropdownComponent<T extends string>({ value, options, onChange, label }: MobileDropdownProps<T>) {
  const selectedOption = useMemo(() => options.find((opt) => opt.value === value), [options, value]);

  const createClickHandler = useCallback(
    (optionValue: T) => {
      return () => onChange(optionValue);
    },
    [onChange]
  );

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<PiCaretDown />}
        width="full"
        justifyContent="space-between"
        aria-label={label}
      >
        {selectedOption?.label || 'Select...'}
      </MenuButton>
      <MenuList width="full">
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={createClickHandler(option.value)}
            bg={option.value === value ? 'base.700' : undefined}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

export const MobileDropdown = memo(MobileDropdownComponent) as typeof MobileDropdownComponent;
