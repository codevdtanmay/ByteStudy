import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

export default function ThemeControl({ value, onChange }) {
  const selected = OPTIONS.some((option) => option.value === value) ? value : 'system';

  return (
    <div className="theme-settings-card" aria-label="Appearance settings">
      <div className="theme-settings-heading">
        <span className="theme-settings-label">Appearance</span>
        <span className="theme-settings-caption">Choose how the website looks</span>
      </div>
      <div className="theme-control-label">Theme</div>
      <div className="theme-segmented-control" role="radiogroup" aria-label="Theme preference">
        {OPTIONS.map(({ value: optionValue, label, Icon }) => {
          const active = selected === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Use ${label.toLowerCase()} theme`}
              className={`theme-segment ${active ? 'theme-segment-active' : ''}`}
              onClick={() => onChange(optionValue)}
            >
              <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
