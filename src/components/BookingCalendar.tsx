import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar as CalendarIcon,
  CalendarCheck,
  Sparkles,
  Info,
  Package,
  Check,
  Sun,
  Moon,
  Filter
} from 'lucide-react';
import { TimeSlotInfo, SlotStatus, ConfirmedAppointment } from '../types';
import { getSlotsForDate } from '../utils/bookingUtils';

export interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string;
  onSelectDate: (dateStr: string) => void;
  onSelectTime: (timeStr: string) => void;
  serviceId?: string;
  appointments?: ConfirmedAppointment[];
  multiSelectedDays?: Array<{ date: string; time: string; sessionNumber?: number }>;
  packageSavedDays?: Array<{ date: string; time: string; sessionNumber?: number }>;
  onToggleSlotMultiSelect?: (slot: { date: string; time: string }) => void;
  isMultiSelectMode?: boolean;
  packageTotalLimit?: number;
  packageChosenCount?: number;
  packageCode?: string;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  serviceId,
  appointments = [],
  multiSelectedDays = [],
  packageSavedDays = [],
  onToggleSlotMultiSelect,
  isMultiSelectMode = false,
  packageTotalLimit = 10,
  packageChosenCount,
  packageCode,
}) => {
  // Base date for navigation
  const today = useMemo(() => new Date(), []);
  
  // Year and month being viewed
  const [currentViewDate, setCurrentViewDate] = useState<Date>(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const viewYear = currentViewDate.getFullYear();
  const viewMonth = currentViewDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentViewDate(now);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    onSelectDate(todayStr);
  };

  // Compile unified list of all package sessions (already confirmed + newly selected)
  const allPackageSlots = useMemo(() => {
    const list: Array<{ date: string; time: string; isSaved?: boolean; sessionNumber?: number }> = [];

    // 1. Saved package sessions from props
    if (packageSavedDays && packageSavedDays.length > 0) {
      packageSavedDays.forEach((p, idx) => {
        list.push({
          date: p.date,
          time: p.time,
          isSaved: true,
          sessionNumber: p.sessionNumber || idx + 1,
        });
      });
    } else if (packageCode && appointments && appointments.length > 0) {
      const matching = appointments.filter(
        (a) =>
          (a.packageCode === packageCode || a.code === packageCode) &&
          a.status !== 'cancelada' &&
          a.status !== 'CANCELADA' &&
          a.fecha &&
          !a.fecha.toLowerCase().includes('por programar')
      );
      matching.forEach((a, idx) => {
        list.push({
          date: a.fecha,
          time: a.hora,
          isSaved: true,
          sessionNumber: a.packageSessionNumber || idx + 1,
        });
      });
    }

    // 2. Newly multi-selected days in current session
    multiSelectedDays.forEach((m) => {
      const alreadyExists = list.some((existing) => existing.date === m.date && existing.time === m.time);
      if (!alreadyExists) {
        list.push({
          date: m.date,
          time: m.time,
          isSaved: false,
          sessionNumber: m.sessionNumber || list.length + 1,
        });
      }
    });

    return list;
  }, [packageSavedDays, packageCode, appointments, multiSelectedDays]);

  // Package Mode state & dynamic counters
  const isPackageMode = isMultiSelectMode || Boolean(packageCode) || allPackageSlots.length > 0;
  const totalLimit = packageTotalLimit || 10;
  const currentChosenCount = packageChosenCount !== undefined ? packageChosenCount : allPackageSlots.length;
  const isLimitReached = currentChosenCount >= totalLimit;
  const daysRemaining = Math.max(0, totalLimit - currentChosenCount);

  // Generate calendar days for current month view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // In JS: 0 is Sunday, 1 is Monday... We adjust so Monday is 0 and Sunday is 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const daysArray = [];

    // Empty padding days from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push({ type: 'empty', key: `empty-${i}` });
    }

    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    for (let d = 1; d <= totalDays; d++) {
      const thisDate = new Date(viewYear, viewMonth, d);
      const isPast = thisDate.getTime() < todayDateOnly;
      const isSunday = thisDate.getDay() === 0;
      const isToday = thisDate.getTime() === todayDateOnly;
      const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDate === dateString;

      // Sample day availability state
      const slots = isSunday ? [] : getSlotsForDate(dateString, serviceId, appointments);
      const availableCount = slots.filter((s) => s.status === 'disponible').length;
      const pendingCount = slots.filter((s) => s.status === 'por_confirmar').length;
      const busyCount = slots.filter((s) => s.status === 'ocupado').length;

      daysArray.push({
        type: 'day',
        dayNumber: d,
        dateString,
        isPast,
        isSunday,
        isToday,
        isSelected,
        availableCount,
        pendingCount,
        busyCount,
        disabled: isPast || isSunday,
        key: `day-${dateString}`,
      });
    }

    return daysArray;
  }, [viewYear, viewMonth, today, selectedDate, serviceId, appointments]);

  // Slots for the currently selected date
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getSlotsForDate(selectedDate, serviceId, appointments);
  }, [selectedDate, serviceId, appointments]);

  // Quick Turn Filters (Mañana / Tarde) & Availability Filter
  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);

  const filteredDateSlots = useMemo(() => {
    return selectedDateSlots.filter((slot) => {
      // If filtering only available, keep if available or already selected in package
      if (showOnlyAvailable && slot.status !== 'disponible') {
        const isSlotInPackage = allPackageSlots.some((p) => p.date === selectedDate && p.time === slot.time);
        if (!isSlotInPackage) return false;
      }

      if (shiftFilter === 'all') return true;

      const match = slot.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return true;

      let hour = parseInt(match[1], 10);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      if (shiftFilter === 'morning') {
        return hour < 13; // 08:00 to 12:59
      } else if (shiftFilter === 'afternoon') {
        return hour >= 13; // 13:00 to 20:00
      }
      return true;
    });
  }, [selectedDateSlots, shiftFilter, showOnlyAvailable, allPackageSlots, selectedDate]);

  // Formatted date title in Spanish
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return 'Ningún día seleccionado';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${dayNames[dateObj.getDay()]} ${d} de ${MONTH_NAMES[m - 1]} de ${y}`;
  }, [selectedDate]);

  const isSundaySelected = useMemo(() => {
    if (!selectedDate) return false;
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).getDay() === 0;
  }, [selectedDate]);

  // Slots on currently selected date that belong to the package
  const selectedDatePackageSlots = useMemo(() => {
    if (!selectedDate) return [];
    return allPackageSlots.filter((p) => p.date === selectedDate);
  }, [selectedDate, allPackageSlots]);

  return (
    <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
      {/* Real-time Package Status Header Banner */}
      {isPackageMode && (
        <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/80 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
                <Package className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                    Modo Paquete
                  </span>
                  {packageCode && (
                    <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-amber-200 border border-slate-700">
                      {packageCode}
                    </span>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white font-heading">
                  Selección de Días en Horario ({totalLimit} Sesiones)
                </h4>
              </div>
            </div>

            {/* Dynamic Counter & Real-Time Status Chip */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-slate-400">Contador en vivo</p>
                <p className="text-sm font-black text-white">
                  <span className={`text-base ${isLimitReached ? 'text-emerald-400 font-extrabold' : 'text-amber-400'}`}>
                    {currentChosenCount}
                  </span>
                  <span className="text-slate-400"> / {totalLimit} días</span>
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                  isLimitReached
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50 animate-pulse'
                    : currentChosenCount > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isLimitReached ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>10 de 10 Completado</span>
                  </>
                ) : currentChosenCount > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentChosenCount}/{totalLimit} En Selección</span>
                  </>
                ) : (
                  <span>0/{totalLimit} Sin Elegir</span>
                )}
              </span>
            </div>
          </div>

          {/* Real-time Status Text & Progress Bar */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {isLimitReached ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    ¡Límite de 10 días completado! Todos los días están resaltados en verde en el calendario.
                  </span>
                ) : currentChosenCount > 0 ? (
                  <span>
                    Has agendado <strong className="text-amber-300">{currentChosenCount} día(s)</strong>. Te faltan <strong className="text-emerald-400">{daysRemaining} día(s)</strong> por elegir.
                  </span>
                ) : (
                  <span className="text-slate-300">
                    Haz clic en los días disponibles del calendario para seleccionarlos en tu horario.
                  </span>
                )}
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">
                {Math.round((currentChosenCount / totalLimit) * 100)}%
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isLimitReached
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (currentChosenCount / totalLimit) * 100)}%` }}
              />
            </div>

            {/* Quick-access interactive pills of selected days */}
            {allPackageSlots.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3 text-amber-400" />
                  <span>Días de tu paquete (haz clic en cualquiera para abrirlo en el horario):</span>
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {allPackageSlots.map((slot, idx) => {
                    const isSlotDateActive = selectedDate === slot.date;
                    return (
                      <button
                        key={`${slot.date}-${slot.time}-${idx}`}
                        type="button"
                        onClick={() => {
                          onSelectDate(slot.date);
                          onSelectTime(slot.time);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                          isSlotDateActive
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-white/60 scale-[1.02]'
                            : slot.isSaved
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                            : 'bg-amber-950/80 text-amber-200 border border-amber-500/40 hover:bg-amber-900/60'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                          {slot.sessionNumber || idx + 1}
                        </span>
                        <span>{slot.date} · {slot.time}</span>
                        {slot.isSaved ? (
                          <span className="text-[10px] text-emerald-300 font-black">✓</span>
                        ) : (
                          <span className="text-[10px] text-amber-300 font-black">★</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Header Navigation */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
            <CalendarIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isPackageMode
              ? 'Los días seleccionados para tu paquete se resaltan automáticamente en verde con su número de sesión'
              : 'Selecciona el día para verificar horarios disponibles en tiempo real'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGoToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/50 transition-colors"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_OF_WEEK.map((d, index) => (
          <div
            key={d}
            className={`text-xs font-bold py-1 uppercase tracking-wider ${
              index === 6 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6">
        {calendarDays.map((item) => {
          if (item.type === 'empty') {
            return <div key={item.key} className="h-11 sm:h-13 rounded-xl" />;
          }

          const {
            dayNumber,
            dateString,
            isPast,
            isSunday,
            isToday,
            isSelected,
            disabled,
            availableCount,
            pendingCount,
          } = item;

          // Check if this date has any session belonging to the package
          const packageSlotsForDay = dateString ? allPackageSlots.filter((p) => p.date === dateString) : [];
          const isDayInPackage = packageSlotsForDay.length > 0;
          const packageSessionsOnDay = packageSlotsForDay.length;
          const primarySession = packageSlotsForDay[0];

          // Determine button visual style
          let buttonClasses = 'h-11 sm:h-13 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 text-sm ';

          if (disabled) {
            buttonClasses += 'opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600';
          } else if (isDayInPackage && isSelected) {
            // Day is in package AND currently focused by patient
            buttonClasses += 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/40 ring-4 ring-emerald-400 ring-offset-2 dark:ring-offset-[#151c28] scale-[1.05] z-10';
          } else if (isDayInPackage) {
            // Day is highlighted in package
            buttonClasses += 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 font-extrabold border-2 border-emerald-500 shadow-sm hover:bg-emerald-200/80 dark:hover:bg-emerald-900/70 hover:scale-[1.03]';
          } else if (isSelected) {
            // Normal selected day
            buttonClasses += 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-[1.03] ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-[#151c28] font-bold';
          } else if (isToday) {
            buttonClasses += 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100/70';
          } else {
            buttonClasses += 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-100 dark:border-slate-800';
          }

          return (
            <button
              key={item.key}
              type="button"
              id={`cal-day-${dateString}`}
              disabled={disabled}
              onClick={() => onSelectDate(dateString!)}
              className={buttonClasses}
            >
              <span>{dayNumber}</span>

              {/* Package Badge Indicator */}
              {isDayInPackage && (
                <span
                  title={`Día en tu horario de paquete (${packageSessionsOnDay} sesión/es: ${packageSlotsForDay.map((s) => s.time).join(', ')})`}
                  className={`absolute -top-1.5 -right-1.5 z-20 min-w-4 h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow-md border ${
                    isSelected
                      ? 'bg-white text-emerald-700 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-emerald-500 text-white border-white dark:border-slate-900'
                  }`}
                >
                  {packageSessionsOnDay > 1 ? `${packageSessionsOnDay}x` : `D${primarySession?.sessionNumber || '✓'}`}
                </span>
              )}

              {/* Day Subtitle / Dots */}
              {isDayInPackage ? (
                <span
                  className={`text-[8px] font-extrabold uppercase tracking-tight leading-none mt-0.5 px-1 py-0.2 rounded ${
                    isSelected ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {primarySession?.isSaved ? 'Sesión' : 'Elegido'}
                </span>
              ) : (
                !disabled && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {availableCount! > 0 && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-emerald-200' : 'bg-emerald-500'
                        }`}
                        title={`${availableCount} cupos disponibles`}
                      />
                    )}
                    {pendingCount! > 0 && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-amber-200' : 'bg-amber-400'
                        }`}
                        title={`${pendingCount} cupos por confirmar`}
                      />
                    )}
                  </div>
                )
              )}

              {isSunday && (
                <span className="text-[8px] font-normal leading-none -mt-0.5 text-slate-400 dark:text-slate-500">
                  Cerrado
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Day Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 mb-6 border border-slate-100 dark:border-slate-800">
        <span className="font-semibold text-slate-700 dark:text-slate-200">Leyenda del calendario:</span>
        <div className="flex flex-wrap items-center gap-3">
          {isPackageMode && (
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
              <span className="w-3 h-3 rounded-md bg-emerald-500 border border-emerald-400 inline-block" />
              <span>Día en tu paquete (agendado)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Con disponibilidad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Por confirmar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
            <span>No disponible / Cerrado</span>
          </div>
        </div>
      </div>

      {/* Selected Day Hourly Time Slots */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
              Horarios para el día seleccionado
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {formattedSelectedDate}
            </h4>
          </div>
        </div>

        {/* Status Pills Explanation & Turn Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Quick Turn Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setShiftFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                shiftFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({selectedDateSlots.length})
            </button>
            <button
              type="button"
              onClick={() => setShiftFilter('morning')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                shiftFilter === 'morning'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Mañana</span>
            </button>
            <button
              type="button"
              onClick={() => setShiftFilter('afternoon')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                shiftFilter === 'afternoon'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Tarde</span>
            </button>
          </div>

          {/* Availability Toggle Pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                showOnlyAvailable
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{showOnlyAvailable ? '✓ Solo Libres' : 'Filtrar Solo Libres'}</span>
            </button>
          </div>
        </div>

        {/* Real-time package context for selected date */}
        {isPackageMode && selectedDate && !isSundaySelected && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs flex items-center justify-between gap-3 border ${
              selectedDatePackageSlots.length > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : isLimitReached
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CalendarCheck
                className={`w-4 h-4 shrink-0 ${
                  selectedDatePackageSlots.length > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                }`}
              />
              <span>
                {selectedDatePackageSlots.length > 0 ? (
                  <>
                    <strong>Día en tu paquete:</strong> Sesión {selectedDatePackageSlots.map((s) => s.time).join(', ')}. Puedes hacer clic en la hora marcada para deseleccionarla si prefieres otro día.
                  </>
                ) : isLimitReached ? (
                  <>
                    <strong>Límite de {totalLimit} días alcanzado:</strong> Para seleccionar una hora de este día, primero deselecciona uno de tus días agendados arriba.
                  </>
                ) : (
                  <>
                    <strong>Día disponible para tu paquete:</strong> Haz clic en cualquiera de las horas disponibles para asignarla a tu horario ({currentChosenCount + 1} de {totalLimit}).
                  </>
                )}
              </span>
            </div>
            <span className="font-bold font-mono px-2 py-0.5 rounded bg-white/60 dark:bg-slate-900/60 shrink-0">
              {currentChosenCount}/{totalLimit}
            </span>
          </div>
        )}

        {/* Closed on Sundays Notice */}
        {isSundaySelected ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              La clínica permanece cerrada los domingos
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Por favor selecciona un día de Lunes a Sábado para ver las horas disponibles.
            </p>
          </div>
        ) : selectedDateSlots.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center border border-slate-200 dark:border-slate-800">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Selecciona una fecha en el calendario superior
            </p>
          </div>
        ) : filteredDateSlots.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center border border-slate-200 dark:border-slate-800 space-y-2">
            <Filter className="w-7 h-7 text-amber-500 mx-auto" />
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              No hay horarios con el filtro de turno seleccionado ({shiftFilter === 'morning' ? 'Mañana' : 'Tarde'})
            </p>
            <button
              type="button"
              onClick={() => {
                setShiftFilter('all');
                setShowOnlyAvailable(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-sm"
            >
              Ver todos los horarios del día
            </button>
          </div>
        ) : (
          /* Grid of Time Slots with Real-Time Package Status */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredDateSlots.map((slot) => {
              const matchingPackageSlot = allPackageSlots.find(
                (p) => p.date === selectedDate && p.time === slot.time
              );
              const isSlotInPackage = Boolean(matchingPackageSlot);
              const isSelected = selectedTime === slot.time || isSlotInPackage;
              const isAvailable = slot.status === 'disponible';
              const isPending = slot.status === 'por_confirmar';
              const isOccupied = slot.status === 'ocupado';
              const isSlotLockedByLimit = isLimitReached && !isSlotInPackage;

              let slotClasses = 'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ';

              if (isOccupied) {
                slotClasses += 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60 cursor-not-allowed';
              } else if (isSlotInPackage) {
                slotClasses += 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-400 shadow-md ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-[#151c28] scale-[1.01]';
              } else if (isSlotLockedByLimit) {
                slotClasses += 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-80 text-slate-600 dark:text-slate-400 cursor-not-allowed';
              } else if (isSelected) {
                slotClasses += 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-[#151c28]';
              } else if (isAvailable) {
                slotClasses += 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 hover:border-emerald-300 text-slate-800 dark:text-slate-100';
              } else {
                slotClasses += 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 hover:border-amber-300 text-slate-800 dark:text-slate-100';
              }

              return (
                <button
                  key={slot.time}
                  type="button"
                  id={`slot-${slot.time.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  disabled={isOccupied}
                  onClick={() => {
                    if (isOccupied) return;
                    if (onToggleSlotMultiSelect) {
                      onToggleSlotMultiSelect({ date: selectedDate, time: slot.time });
                    }
                    onSelectTime(slot.time);
                  }}
                  className={slotClasses}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className={`w-4 h-4 ${
                          isSlotInPackage || isSelected
                            ? 'text-white'
                            : isAvailable
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isPending
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <span className={`text-xs sm:text-sm font-bold ${isSlotInPackage || isSelected ? 'text-white' : ''}`}>
                        {slot.time}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                        isSlotInPackage
                          ? 'bg-white/25 text-white'
                          : isSlotLockedByLimit
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          : isSelected
                          ? 'bg-white/20 text-white'
                          : isAvailable
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {isSlotInPackage
                        ? matchingPackageSlot?.isSaved
                          ? '✓ Confirmada'
                          : '✓ En horario'
                        : isSlotLockedByLimit
                        ? `Límite ${totalLimit}/${totalLimit}`
                        : isAvailable
                        ? 'Disponible'
                        : isPending
                        ? 'Por confirmar'
                        : 'Ocupado'}
                    </span>
                  </div>

                  <p
                    className={`text-[11px] leading-tight ${
                      isSlotInPackage || isSelected
                        ? 'text-emerald-100'
                        : isOccupied
                        ? 'text-slate-400 dark:text-slate-500'
                        : isSlotLockedByLimit
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isOccupied
                      ? 'Horario no disponible'
                      : isSlotInPackage
                      ? `Día #${matchingPackageSlot?.sessionNumber || 'seleccionado'} (clic para quitar)`
                      : isSlotLockedByLimit
                      ? 'Deselecciona un día para elegir este'
                      : isPackageMode
                      ? `Clic para sumar a tu paquete (${currentChosenCount + 1}/${totalLimit})`
                      : isPending
                      ? 'Cupo en proceso de validación'
                      : 'Atención presencial inmediata'}
                  </p>

                  {/* Indicator footer */}
                  {!isOccupied && (
                    <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/40 flex items-center justify-between text-[11px]">
                      <span className={isSlotInPackage || isSelected ? 'text-emerald-100 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                        {isSlotInPackage
                          ? '✓ En tu selección de paquete'
                          : isSlotLockedByLimit
                          ? 'Límite alcanzado'
                          : isSelected
                          ? '✓ Horario seleccionado'
                          : 'Clic para elegir'}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSlotInPackage || isSelected
                            ? 'border-white bg-white text-emerald-600'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {(isSlotInPackage || isSelected) && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

