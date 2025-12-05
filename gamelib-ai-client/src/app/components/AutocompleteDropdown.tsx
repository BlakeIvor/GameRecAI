'use client';

import { useState, useRef, useEffect } from 'react';

interface AutocompleteDropdownProps {
  label: string;
  description: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
  tagColor?: 'blue' | 'green' | 'purple';
}

export default function AutocompleteDropdown({
  label,
  description,
  options,
  selectedValues,
  onToggle,
  placeholder = 'Type to search...',
  tagColor = 'blue',
}: AutocompleteDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleOption = (option: string) => {
    onToggle(option);
    setSearchTerm('');
  };

  const colorClasses = {
    blue: {
      tag: 'bg-blue-600/30 text-blue-300',
      highlight: 'bg-blue-600/20',
    },
    green: {
      tag: 'bg-green-600/30 text-green-300',
      highlight: 'bg-green-600/20',
    },
    purple: {
      tag: 'bg-purple-600/30 text-purple-300',
      highlight: 'bg-purple-600/20',
    },
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <p className="text-xs text-gray-500 mb-3">{description}</p>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-left text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between hover:bg-gray-750"
      >
        <span className="text-gray-400">
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : placeholder}
        </span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <div className="p-2">
                {filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleToggleOption(option)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                        isSelected
                          ? `${colorClasses[tagColor].highlight} text-white font-medium`
                          : 'hover:bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-600'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No results found for "{searchTerm}"
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedValues.length > 0 && (
            <div className="p-3 border-t border-gray-700 bg-gray-850 flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {selectedValues.length} selected
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Tags */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedValues.map((value) => (
            <span
              key={value}
              className={`${colorClasses[tagColor].tag} text-xs px-3 py-1 rounded-full flex items-center gap-1`}
            >
              {value}
              <button
                type="button"
                onClick={() => onToggle(value)}
                className="hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
