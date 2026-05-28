'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Beautiful red/green one-tap visibility toggle.
 * Matches the design system in globals.css.
 * Use everywhere content can be hidden/shown by admin.
 */
export function Toggle({ checked, onChange, label, disabled, className }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'toggle',
        checked ? 'data-[visible=true]' : 'data-[visible=false]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      data-visible={checked}
      aria-pressed={checked}
      aria-label={label || (checked ? 'Visible' : 'Hidden')}
    >
      <div className="toggle-thumb">
        {checked ? 'ON' : 'OFF'}
      </div>
    </button>
  );
}
