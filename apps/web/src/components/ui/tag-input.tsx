"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import { cn } from "@/utils/cn"

interface TagInputProps {
  suggestions: string[]
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  maxResults?: number
}

export default function TagInput({
  suggestions,
  value,
  onChange,
  placeholder = "Type to search...",
  className,
  maxResults = 8,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = inputValue.trim().length >= 1
    ? suggestions
        .filter((s) =>
          s.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(s) // Don't suggest already-selected tags
        )
        .slice(0, maxResults)
    : []

  const showDropdown = isOpen && filtered.length > 0

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("li")
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" })
    }
  }, [highlightedIndex])

  const handleAddTag = useCallback((tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag])
    }
    setInputValue("")
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }, [value, onChange])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove))
  }, [value, onChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last tag on backspace when input is empty
      handleRemoveTag(value[value.length - 1])
      return
    }

    if (e.key === "Enter" && !showDropdown && inputValue.trim()) {
      // Allow adding custom tags not in suggestions
      e.preventDefault()
      handleAddTag(inputValue.trim())
      return
    }

    if (!showDropdown) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleAddTag(filtered[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "flex flex-wrap gap-1.5 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/20 text-primary px-2.5 py-1.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-150"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveTag(tag)
              }}
              className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
            setHighlightedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          autoComplete="off"
          className="flex-1 min-w-[120px] outline-none bg-transparent placeholder:text-muted-foreground text-sm"
        />
      </div>
      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {filtered.map((item, idx) => {
            const lowerItem = item.toLowerCase()
            const lowerValue = inputValue.toLowerCase()
            const matchIndex = lowerItem.indexOf(lowerValue)

            return (
              <li
                key={item}
                role="option"
                aria-selected={idx === highlightedIndex}
                className={cn(
                  "cursor-pointer select-none px-3 py-2 text-sm transition-colors",
                  idx === highlightedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleAddTag(item)
                }}
              >
                {matchIndex >= 0 ? (
                  <>
                    {item.slice(0, matchIndex)}
                    <span className="font-semibold text-primary">
                      {item.slice(matchIndex, matchIndex + inputValue.length)}
                    </span>
                    {item.slice(matchIndex + inputValue.length)}
                  </>
                ) : (
                  item
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
