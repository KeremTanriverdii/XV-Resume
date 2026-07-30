"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";

export interface DatePickerProps {
  value?: string | null; // Expected YYYY-MM-DD or ISO string
  onChange: (dateStr: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Tarih Seçin",
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parse current selected date
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  // Current viewed month/year in calendar
  const [viewDate, setViewDate] = React.useState<Date>(() => selectedDate || new Date());

  // Update view date when selectedDate changes
  React.useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Days in month calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0: Sun, 1: Mon...
  // Convert Sun-based (0) to Mon-based (0) if desired: (firstDayOfWeek + 6) % 7
  const startingOffset = (firstDayOfWeek + 6) % 7;

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    // Format YYYY-MM-DD string
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, "0");
    const dd = String(selected.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setViewDate(new Date(newYear, viewMonth, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setViewDate(new Date(viewYear, newMonth, 1));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  // Generate years list (from 1960 to current year + 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1960 + 15 }, (_, i) => 1960 + i);

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Trigger Button (Shadcn style) */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors hover:bg-accent/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          !selectedDate && "text-muted-foreground",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-70 text-primary" />
          <span className="truncate">
            {selectedDate ? formatDate(selectedDate.toISOString()) : placeholder}
          </span>
        </div>
        {selectedDate && !disabled && (
          <span
            role="button"
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[270px] rounded-xl border border-border bg-popover text-popover-foreground p-3 shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={handleMonthChange}
                className="bg-transparent text-xs font-semibold rounded-md border border-input px-1.5 py-0.5 focus:outline-none cursor-pointer"
              >
                {monthNames.map((name, i) => (
                  <option key={name} value={i} className="bg-popover text-foreground">
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={handleYearChange}
                className="bg-transparent text-xs font-semibold rounded-md border border-input px-1.5 py-0.5 focus:outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-popover text-foreground">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-muted-foreground mb-1">
            <span>Pzt</span>
            <span>Sal</span>
            <span>Çar</span>
            <span>Per</span>
            <span>Cum</span>
            <span>Cmt</span>
            <span>Paz</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty slots for starting day offset */}
            {Array.from({ length: startingOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === viewMonth &&
                new Date().getFullYear() === viewYear;

              const isSelected =
                selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getFullYear() === viewYear;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer font-medium",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs scale-105"
                      : isToday
                      ? "border border-primary text-primary font-bold"
                      : "hover:bg-accent hover:text-accent-foreground text-foreground"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
