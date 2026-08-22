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
  Sparkles,
  Info
} from 'lucide-react';
import { TimeSlotInfo, SlotStatus, ConfirmedAppointment } from '../types';
import { getSlotsForDate } from '../utils/bookingUtils';

interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string;
  onSelectDate: (dateStr: string) => void;
  onSelectTime: (timeStr: string) => void;
  serviceId?: string;
  appointments?: ConfirmedAppointment[];
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

  return (
    <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
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
            Selecciona el día para verificar horarios disponibles en tiempo real
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
            return <div key={item.key} className="h-10 sm:h-12 rounded-xl" />;
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

          return (
            <button
              key={item.key}
              type="button"
              id={`cal-day-${dateString}`}
              disabled={disabled}
              onClick={() => onSelectDate(dateString!)}
              className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 text-sm font-medium ${
                disabled
                  ? 'opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600'
                  : isSelected
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-[1.03] ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-[#151c28] font-bold'
                  : isToday
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100/70'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-100 dark:border-slate-800'
              }`}
            >
              <span>{dayNumber}</span>

              {/* Status Indicator Dots */}
              {!disabled && (
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
              Horarios para el día seleccionado
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {formattedSelectedDate}
            </h4>
          </div>

          {/* Status Pills Explanation */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Disponible
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Por confirmar
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Ocupado
            </span>
          </div>
        </div>

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
        ) : (
          /* Grid of Time Slots with 3 explicit statuses */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {selectedDateSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isAvailable = slot.status === 'disponible';
              const isPending = slot.status === 'por_confirmar';
              const isOccupied = slot.status === 'ocupado';

              return (
                <button
                  key={slot.time}
                  type="button"
                  id={`slot-${slot.time.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  disabled={isOccupied}
                  onClick={() => {
                    if (isAvailable || isPending) {
                      onSelectTime(slot.time);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isOccupied
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-[#151c28]'
                      : isAvailable
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 hover:border-emerald-300 text-slate-800 dark:text-slate-100'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 hover:border-amber-300 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className={`w-4 h-4 ${
                          isSelected
                            ? 'text-white'
                            : isAvailable
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isPending
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                        {slot.time}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isAvailable
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {isAvailable ? 'Disponible' : isPending ? 'Por confirmar' : 'Ocupado'}
                    </span>
                  </div>

                  <p
                    className={`text-[11px] leading-tight ${
                      isSelected
                        ? 'text-amber-100'
                        : isOccupied
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isOccupied
                      ? 'Horario no disponible'
                      : isPending
                      ? 'Cupo en proceso de validación (seleccionable)'
                      : 'Atención presencial inmediata'}
                  </p>

                  {/* Radio indicator */}
                  {!isOccupied && (
                    <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/40 flex items-center justify-between text-[11px]">
                      <span className={isSelected ? 'text-amber-100 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                        {isSelected ? '✓ Horario seleccionado' : 'Clic para elegir'}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-white bg-white text-amber-600'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600" />}
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
