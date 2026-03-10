import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, ChevronDown, ChevronDown as ChevronDownIcon, Table, Check, Filter } from 'lucide-react';

const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul',
  'Avgust', 'Sentyabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const WEEKDAYS = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];

export default function CalendarDateRange({ startDate, endDate, onChange, onClose, isOpen }) {
  const getInitialDate = () => {
    if (startDate) return new Date(startDate);
    return new Date();
  };

  const initialDate = getInitialDate();

  const [viewDate, setViewDate] = useState(initialDate);
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState('all'); // 'all', 'odd', 'even'
  const yearDropdownRef = useRef(null);
  const monthDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isYearDropdownOpen && yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false);
      }
      if (isMonthDropdownOpen && monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isYearDropdownOpen, isMonthDropdownOpen]);

  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      setViewDate(date);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
    }
  }, [startDate]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setIsYearDropdownOpen(false);
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    updateStartDate(newDate);
  };

  const handleMonthChange = (monthIndex) => {
    setSelectedMonth(monthIndex);
    const newDate = new Date(viewDate);
    newDate.setMonth(monthIndex);
    setViewDate(newDate);
    setIsMonthDropdownOpen(false);
  };

  const handleDayClick = (day) => {
    const newDate = new Date(selectedYear, selectedMonth, day);
    setViewDate(newDate);
    if (onChange) {
      onChange('startDate', newDate);
    }
    setIsDropdownOpen(false);
  };


  const isWeekend = (year, month, day) => {
    const date = new Date(year, month, day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const isSelectableDay = (day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    if (selectedPattern === 'all') return true;

    if (selectedPattern === 'odd') {
      // Dushanba (1), Chorshanba (3), Shanba (6)
      return [1, 3, 6].includes(weekday);
    }

    if (selectedPattern === 'even') {
      // Seshanba (2), Payshanba (4), Juma (5), Yakshanba (0)
      return [0, 2, 4, 5].includes(weekday);
    }

    return true;
  };

  const renderCalendar = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: i, empty: true });
    }

    // Days of the month
    let currentDay = 1;
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        if (currentDay > daysInMonth) break;
        const date = new Date(year, month, currentDay);
        const weekday = date.getDay();
        const isOddDay = [1, 3, 6].includes(weekday); // Dushanba, Chorshanba, Shanba
        const isEvenDay = [0, 2, 4, 5].includes(weekday); // Yakshanba, Seshanba, Payshanba, Juma

        days.push({
          day: currentDay,
          empty: false,
          date,
          weekday,
          isOddDay,
          isEvenDay,
          isSelectable: isSelectableDay(currentDay)
        });
        currentDay++;
      }
    }

    return days;
  };

  const handlePreviousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear = selectedYear - 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setViewDate(new Date(newYear, newMonth, 1));
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear = selectedYear + 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setViewDate(new Date(newYear, newMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Vaqtni tanlash</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Kun va kunni tanlang
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-slate-600 dark:text-slate-400" />
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {MONTHS[selectedMonth]}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {selectedYear}
              </span>
              <div ref={yearDropdownRef} className="relative">
                <button
                  onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                  className="flex items-center gap-1 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {selectedYear}
                  <ChevronDownIcon size={16} className="text-slate-600 dark:text-slate-400" />
                </button>
                {isYearDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-32 z-50">
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => handleYearChange(year)}
                        className="block w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div ref={monthDropdownRef} className="relative">
                <button
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                  className="flex items-center gap-1 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Filter size={16} className="text-slate-600 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Oy</span>
                  <ChevronDownIcon size={16} className="text-slate-600 dark:text-slate-400" />
                </button>
                {isMonthDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-40 z-50">
                    {MONTHS.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => handleMonthChange(index)}
                        className={`block w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                          selectedMonth === index ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
              </button>

              <button
                onClick={handleToday}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Bugun
              </button>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pattern Selection */}
          <div className="mb-4">
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setSelectedPattern('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPattern === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Barcha kunlar
              </button>
              <button
                onClick={() => setSelectedPattern('odd')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPattern === 'odd'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Toq (Dush, Chor, Shan)
              </button>
              <button
                onClick={() => setSelectedPattern('even')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPattern === 'even'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Juft (Sesh, Pay, Jum, Yak)
              </button>
            </div>
          </div>

          {/* Beautiful Table View */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              {WEEKDAYS.map((dayName, index) => (
                <div
                  key={index}
                  className="py-3 px-2 text-center font-semibold text-sm text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                >
                  {dayName}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {renderCalendar().map((dayInfo, index) => {
                const dateObj = dayInfo.date;
                const isSelected = dateObj && viewDate && dateObj.toDateString() === viewDate.toDateString();
                const isToday = dateObj && dateObj.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => !dayInfo.empty && dayInfo.isSelectable && handleDayClick(dayInfo.day)}
                    className={`
                      py-4 px-2 text-center border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 transition-all
                      ${dayInfo.empty ? 'bg-slate-50 dark:bg-slate-900' : ''}
                      ${!dayInfo.empty && dayInfo.isSelectable ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer' : ''}
                      ${!dayInfo.empty && !dayInfo.isSelectable ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed' : ''}
                      ${isSelected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'}
                      ${isToday && !isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : ''}
                    `}
                  >
                    {dayInfo.empty ? (
                      <div className="text-sm text-slate-300 dark:text-slate-700"></div>
                    ) : (
                      <div className="relative">
                        <div className="text-sm font-medium mb-1">
                          {dayInfo.day}
                        </div>
                        {dayInfo.isSelectable && (
                          <div className="flex justify-center">
                            {dayInfo.isOddDay && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500" title="Toq kun"></div>
                            )}
                            {dayInfo.isEvenDay && (
                              <div className="w-2 h-2 rounded-full bg-purple-500" title="Juft kun"></div>
                            )}
                          </div>
                        )}
                        {isSelected && (
                          <Check size={12} className="absolute top-1 right-1 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Toq kunlar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Juft kunlar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Tanlangan</span>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button
              onClick={() => onClose()}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => {
                if (onChange && viewDate) {
                  onChange('startDate', viewDate);
                }
                onClose();
              }}
              disabled={!viewDate}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50"
            >
              Vaqtni tasdiqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
