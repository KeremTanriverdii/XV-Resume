'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';

interface AutocompleteInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  maxResults?: number;
}

export default function AutocompleteInput({
  suggestions,
  value,
  onChange,
  maxResults = 8,
  className,
  ...props
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered =
    value.trim().length >= 1
      ? suggestions
          .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
          .slice(0, maxResults)
      : [];

  const showDropdown = isOpen && filtered.length > 0;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (item: string) => {
      onChange(item);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {filtered.map((item, idx) => {
            // Highlight matching substring
            const lowerItem = item.toLowerCase();
            const lowerValue = value.toLowerCase();
            const matchIndex = lowerItem.indexOf(lowerValue);

            return (
              <li
                key={item}
                role="option"
                aria-selected={idx === highlightedIndex}
                className={cn(
                  'cursor-pointer select-none px-3 py-2 text-sm transition-colors',
                  idx === highlightedIndex
                    ? 'bg-blue-500/20 text-accent-foreground'
                    : 'hover:bg-red-500/20',
                )}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur before selection
                  handleSelect(item);
                }}
              >
                {matchIndex >= 0 ? (
                  <>
                    {item.slice(0, matchIndex)}
                    <span className="font-semibold text-primary">
                      {item.slice(matchIndex, matchIndex + value.length)}
                    </span>
                    {item.slice(matchIndex + value.length)}
                  </>
                ) : (
                  item
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
