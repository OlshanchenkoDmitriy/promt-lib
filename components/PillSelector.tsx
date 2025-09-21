import React from 'react';

interface PillSelectorProps<T extends string | null> {
  options: { value: T; label: string }[];
  selectedValue: T;
  onChange: (value: T) => void;
}

export const PillSelector = <T extends string | null>({ options, selectedValue, onChange }: PillSelectorProps<T>) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-accent
            ${selectedValue === option.value
              ? 'bg-blue-accent text-white shadow'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          aria-pressed={selectedValue === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
