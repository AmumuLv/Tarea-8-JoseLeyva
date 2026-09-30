import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function DatePicker({ value, onChange, placeholder = 'dd/mm/aaaa', required: _required, min, max, disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => value ? formatDateDisplay(value) : '');
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      setViewDate({ year: y, month: m - 1 });
      setInputValue(formatDateDisplay(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowYearPicker(false);
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropUp(spaceBelow < 340);
  }, [open]);

  const today = new Date();
  const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

  const days = useMemo(() => {
    const { year, month } = viewDate;
    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevDays = getDaysInMonth(year, month - 1 < 0 ? year - 1 : year, );
    const prevMonth = month - 1 < 0 ? 11 : month - 1;
    const prevYear = month - 1 < 0 ? year - 1 : year;

    const result: Array<{ day: number; month: number; year: number; currentMonth: boolean; date: string }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      result.push({ day: d, month: prevMonth, year: prevYear, currentMonth: false, date: toISODate(prevYear, prevMonth, d) });
    }

    for (let d = 1; d <= totalDays; d++) {
      result.push({ day: d, month, year, currentMonth: true, date: toISODate(year, month, d) });
    }

    const remaining = 42 - result.length;
    const nextMonth = month + 1 > 11 ? 0 : month + 1;
    const nextYear = month + 1 > 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      result.push({ day: d, month: nextMonth, year: nextYear, currentMonth: false, date: toISODate(nextYear, nextMonth, d) });
    }

    return result;
  }, [viewDate]);

  const yearRange = useMemo(() => {
    const start = today.getFullYear() - 100;
    const end = today.getFullYear() + 10;
    const years: number[] = [];
    for (let y = end; y >= start; y--) years.push(y);
    return years;
  }, []);

  const prevMonth = () => {
    setViewDate(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 });
  };

  const nextMonth = () => {
    setViewDate(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 });
  };

  const selectDate = (date: string) => {
    if (min && date < min) return;
    if (max && date > max) return;
    onChange(date);
    setInputValue(formatDateDisplay(date));
    setOpen(false);
    setShowYearPicker(false);
    setShowMonthPicker(false);
  };

  const goToday = () => {
    const now = new Date();
    const dateStr = toISODate(now.getFullYear(), now.getMonth(), now.getDate());
    setViewDate({ year: now.getFullYear(), month: now.getMonth() });
    onChange(dateStr);
    setInputValue(formatDateDisplay(dateStr));
    setOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setInputValue('');
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length === 8) {
      const d = cleaned.slice(0, 2);
      const m = cleaned.slice(2, 4);
      const y = cleaned.slice(4, 8);
      const isoDate = `${y}-${m}-${d}`;
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      if (
        dateObj.getFullYear() === Number(y) &&
        dateObj.getMonth() === Number(m) - 1 &&
        dateObj.getDate() === Number(d) &&
        Number(m) >= 1 && Number(m) <= 12 &&
        Number(d) >= 1 && Number(d) <= 31
      ) {
        if ((!min || isoDate >= min) && (!max || isoDate <= max)) {
          onChange(isoDate);
          setViewDate({ year: Number(y), month: Number(m) - 1 });
        }
      }
    }
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const isDisabled = (date: string) => {
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center w-full border rounded-lg transition-all ${
          disabled
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : open
              ? 'border-purple-500 ring-2 ring-purple-500/20 bg-white'
              : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={() => !disabled && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={10}
          className={`flex-1 px-3 py-2 text-sm bg-transparent outline-none ${disabled ? 'cursor-not-allowed text-gray-400' : 'text-gray-900 cursor-pointer'}`}
        />
        {value && !disabled && (
          <button type="button" onClick={clearDate} className="mr-1 text-gray-400 hover:text-gray-600 p-0.5">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button type="button" onClick={() => !disabled && setOpen(!open)} className="mr-2 text-gray-400 hover:text-gray-600 p-0.5">
          <Calendar className="h-4 w-4 flex-shrink-0" />
        </button>
      </div>

      {open && (
        <div
          className={`absolute z-50 w-[252px] bg-white rounded-xl shadow-xl border border-gray-200 p-2 transition-all duration-150 ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
            </button>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                className="px-1.5 py-0.5 rounded-md hover:bg-gray-100 text-xs font-semibold text-gray-800 transition-colors"
              >
                {MONTHS[viewDate.month]}
              </button>
              <button
                type="button"
                onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                className="px-1.5 py-0.5 rounded-md hover:bg-gray-100 text-xs font-semibold text-gray-800 transition-colors"
              >
                {viewDate.year}
              </button>
            </div>

            <button type="button" onClick={nextMonth} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>

          {/* Month Picker */}
          {showMonthPicker && (
            <div className="grid grid-cols-3 gap-1 mb-2 p-1.5 bg-gray-50 rounded-lg">
              {MONTHS_FULL.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setViewDate(v => ({ ...v, month: i })); setShowMonthPicker(false); }}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    i === viewDate.month ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Year Picker */}
          {showYearPicker && (
            <div className="max-h-[160px] overflow-y-auto mb-2 p-1.5 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-4 gap-1">
                {yearRange.map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => { setViewDate(v => ({ ...v, year: y })); setShowYearPicker(false); }}
                    className={`px-1.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                      y === viewDate.year ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-0.5">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-0.5">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const selected = d.date === value;
              const isToday = d.date === todayStr;
              const disabled = isDisabled(d.date);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !disabled && selectDate(d.date)}
                  disabled={disabled}
                  className={`relative h-6 w-full flex items-center justify-center text-[11px] rounded-md transition-all ${
                    !d.currentMonth
                      ? 'text-gray-300'
                      : disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : selected
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : isToday
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {d.day}
                  {isToday && !selected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={goToday}
              className="px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={(e) => { clearDate(e); }}
              className="px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
