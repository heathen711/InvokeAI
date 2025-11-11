// src/features/ui/components/mobile/MobileDropdown.tsx
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@invoke-ai/ui-library';
import { memo } from 'react';
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

export const MobileDropdown = memo(<T extends string>({ value, options, onChange, label }: MobileDropdownProps<T>) => {
  const selectedOption = options.find((opt) => opt.value === value);

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
            onClick={() => onChange(option.value)}
            bg={option.value === value ? 'base.700' : undefined}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});

MobileDropdown.displayName = 'MobileDropdown';
