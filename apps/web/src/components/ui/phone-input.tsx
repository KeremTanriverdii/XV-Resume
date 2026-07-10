"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/utils/cn"

interface Country {
  code: string
  name: string
  dial: string
  flag: string
}

const COUNTRIES: Country[] = [
  { code: "TR", name: "Turkey", dial: "+90", flag: "🇹🇷" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dial: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", dial: "+358", flag: "🇫🇮" },
  { code: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", dial: "+420", flag: "🇨🇿" },
  { code: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "GR", name: "Greece", dial: "+30", flag: "🇬🇷" },
  { code: "RO", name: "Romania", dial: "+40", flag: "🇷🇴" },
  { code: "HU", name: "Hungary", dial: "+36", flag: "🇭🇺" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "AE", name: "UAE", dial: "+971", flag: "🇦🇪" },
  { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  required?: boolean
}

export default function PhoneInput({
  value,
  onChange,
  className,
  placeholder = "5XX XXX XX XX",
  required,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]) // Default: Turkey
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Extract the phone number (strip dial code)
  const phoneNumber = value.startsWith(selectedCountry.dial)
    ? value.slice(selectedCountry.dial.length).trimStart()
    : value

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Detect initial country from value
  useEffect(() => {
    if (value) {
      const match = COUNTRIES.find((c) => value.startsWith(c.dial))
      if (match) setSelectedCountry(match)
    }
  }, []) // Only on mount

  const filteredCountries = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    onChange(`${country.dial} ${phoneNumber}`)
    setIsOpen(false)
    setSearch("")
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value
    onChange(`${selectedCountry.dial} ${newNumber}`)
  }

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
      >
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 border-r border-input hover:bg-accent/50 rounded-l-md transition-colors cursor-pointer shrink-0"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="text-xs text-muted-foreground font-medium">{selectedCountry.dial}</span>
          <svg
            className={cn("h-3 w-3 text-muted-foreground transition-transform", isOpen && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="flex-1 px-3 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Country dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              autoFocus
              className="w-full px-2 py-1.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          {/* Country list */}
          <ul className="max-h-48 overflow-auto py-1">
            {filteredCountries.map((country) => (
              <li
                key={country.code}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent/50",
                  selectedCountry.code === country.code && "bg-accent text-accent-foreground"
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleCountrySelect(country)
                }}
              >
                <span className="text-base leading-none">{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{country.dial}</span>
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground text-center">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
