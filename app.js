const STORAGE_KEY = 'equilibra_appointments_v1';
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const TIME_SLOTS = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
const API_BASE_URL = 'http://localhost:3000';

async function notifyAdmins(appointment) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Error al crear cita en backend:', data.message || response.statusText);
    }
  } catch (error) {
    console.error('No se pudo comunicar con el backend:', error);
  }
}

const defaultAppointments = [
  {
    id: 'demo-1',
    name: 'María López',
    phone: '0412-1234567',
    email: 'maria@example.com',
    service: 'Fisioterapia Deportiva',
    date: getDateOffset(2),
    time: '09:00',
    status: 'confirmada',
    createdAt: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    id: 'demo-2',
    name: 'Carlos Pérez',
    phone: '0412-7654321',
    email: 'carlos@example.com',
    service: 'Psicología',
    date: getDateOffset(4),
    time: '14:30',
    status: 'pendiente',
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  },
  {
    id: 'demo-3',
    name: 'Ana García',
    phone: '0414-9876543',
    email: 'ana@example.com',
    service: 'Nutrición',
    date: getDateOffset(7),
    time: '16:00',
    status: 'confirmada',
    createdAt: Date.now() - 1000 * 60 * 60 * 24
  }
];

function getDateOffset(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function loadAppointments() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAppointments));
    return [...defaultAppointments];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultAppointments];
  } catch (error) {
    return [...defaultAppointments];
  }
}

function saveAppointments(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function formatDateShort(dateValue) {
  const date = new Date(dateValue + 'T00:00:00');
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatDateLong(dateValue) {
  const date = new Date(dateValue + 'T00:00:00');
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function getBookedTimesForDate(dateValue) {
  const appointments = loadAppointments();
  return appointments.filter((item) => item.date === dateValue).map((item) => item.time);
}

function normalizeDateInput(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

function renderUserPage() {
  const form = document.getElementById('bookingForm');
  const selectService = document.getElementById('service');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const dateInput = document.getElementById('date');
  const timeWrap = document.getElementById('timeSlots');
  const summaryList = document.getElementById('summaryList');

  if (!form) return;

  let selectedDate = null;
  let selectedTime = null;
  let monthCursor = new Date();
  monthCursor.setDate(1);

  function renderCalendar() {
    const monthEl = document.getElementById('calendarMonth');
    const grid = document.getElementById('calendarGrid');
    if (!monthEl || !grid) return;

    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    monthEl.textContent = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(monthCursor);

    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = 0; i < startWeekday; i++) {
      const prevDate = previousMonthDays - startWeekday + i + 1;
      cells.push({ day: prevDate, muted: true, date: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(year, month, day);
      const iso = normalizeDateInput(current);
      cells.push({ day, muted: false, date: iso, current });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length % 7, muted: true, date: null });
    }

    grid.innerHTML = '';
    for (const cell of cells) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `day-cell${cell.muted ? ' muted' : ''}${cell.date && selectedDate === cell.date ? ' selected' : ''}`;
      btn.textContent = cell.day;
      if (cell.date) {
        btn.dataset.date = cell.date;
        const bookedTimes = getBookedTimesForDate(cell.date);
        const isPast = new Date(cell.date + 'T00:00:00') < new Date(new Date().toDateString());
        if (bookedTimes.length >= TIME_SLOTS.length || isPast) {
          btn.classList.add('booked');
          btn.disabled = true;
        } else {
          btn.classList.add('available');
        }

        btn.addEventListener('click', () => {
          selectedDate = cell.date;
          selectedTime = null;
          dateInput.value = cell.date;
          renderCalendar();
          renderTimeSlots();
          renderSummary();
        });
      }
      grid.appendChild(btn);
    }
  }

  function renderTimeSlots() {
    timeWrap.innerHTML = '';

    if (!selectedDate) {
      timeWrap.innerHTML = '<div class="empty-state">Selecciona un día para ver los horarios disponibles.</div>';
      return;
    }

    const booked = getBookedTimesForDate(selectedDate);
    const slots = TIME_SLOTS.filter((time) => !booked.includes(time));

    if (!slots.length) {
      timeWrap.innerHTML = '<div class="empty-state">No quedan horarios disponibles en este día.</div>';
      return;
    }

    slots.forEach((time) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `time-pill${selectedTime === time ? ' selected' : ''}`;
      button.textContent = time;
      button.addEventListener('click', () => {
        selectedTime = time;
        renderTimeSlots();
        renderSummary();
      });
      timeWrap.appendChild(button);
    });
  }

  function renderSummary() {
    const entries = [
      { label: 'Servicio', value: selectService.value },
      { label: 'Paciente', value: nameInput.value || 'Por definir' },
      { label: 'Fecha', value: selectedDate ? formatDateLong(selectedDate) : 'Selecciona un día' },
      { label: 'Hora', value: selectedTime || 'Selecciona un horario' }
    ];

    summaryList.innerHTML = entries.map((entry) => `
      <div class="summary-item">
        <strong>${entry.label}</strong>
        <span>${entry.value}</span>
      </div>
    `).join('');
  }

  document.getElementById('prevMonth').addEventListener('click', () => {
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1);
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
    renderCalendar();
  });

  [selectService, nameInput, phoneInput, emailInput].forEach((element) => {
    element.addEventListener('input', renderSummary);
    element.addEventListener('change', renderSummary);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const service = selectService.value;
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const finalDate = dateInput.value || selectedDate;

    if (!name || !phone || !email || !service || !finalDate || !selectedTime) {
      alert('Completa todos los campos y selecciona una fecha y hora disponibles.');
      return;
    }

    const appointments = loadAppointments();
    const duplicated = appointments.some((item) => item.date === finalDate && item.time === selectedTime);

    if (duplicated) {
      alert('Ese horario ya está ocupado. Elige otra fecha o hora.');
      return;
    }

    const newAppointment = {
      id: crypto.randomUUID ? crypto.randomUUID() : `apt-${Date.now()}`,
      name,
      phone,
      email,
      service,
      date: finalDate,
      time: selectedTime,
      status: 'pendiente',
      createdAt: Date.now()
    };

    appointments.push(newAppointment);
    saveAppointments(appointments);
    notifyAdmins(newAppointment);
    form.reset();
    selectedDate = null;
    selectedTime = null;
    monthCursor = new Date();
    monthCursor.setDate(1);
    renderCalendar();
    renderTimeSlots();
    renderSummary();
    alert('Tu cita fue agendada con éxito.');
  });

  renderCalendar();
  renderTimeSlots();
  renderSummary();
}

function renderAdminPage() {
  const tableBody = document.getElementById('appointmentsBody');
  const totalCount = document.getElementById('totalCount');
  const confirmedCount = document.getElementById('confirmedCount');
  const pendingCount = document.getElementById('pendingCount');
  const nextDate = document.getElementById('nextDate');
  const filterService = document.getElementById('filterService');
  const addAppointmentBtn = document.getElementById('addAppointmentBtn');
  const appointmentModal = document.getElementById('appointmentModal');
  const appointmentForm = document.getElementById('appointmentForm');
  const appointmentModalTitle = document.getElementById('appointmentModalTitle');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelManualBtn = document.getElementById('cancelManualBtn');
  const appointmentIdInput = document.getElementById('appointmentId');
  const manualName = document.getElementById('manualName');
  const manualPhone = document.getElementById('manualPhone');
  const manualEmail = document.getElementById('manualEmail');
  const manualService = document.getElementById('manualService');
  const manualDate = document.getElementById('manualDate');
  const manualTime = document.getElementById('manualTime');
  const manualStatus = document.getElementById('manualStatus');

  if (!tableBody) return;

  function openAppointmentModal(mode = 'create', appointment = null) {
    if (mode === 'edit' && appointment) {
      appointmentModalTitle.textContent = 'Editar cita';
      appointmentIdInput.value = appointment.id;
      manualName.value = appointment.name;
      manualPhone.value = appointment.phone;
      manualEmail.value = appointment.email;
      manualService.value = appointment.service;
      manualDate.value = appointment.date;
      manualTime.value = appointment.time;
      manualStatus.value = appointment.status;
    } else {
      appointmentModalTitle.textContent = 'Nueva cita';
      appointmentForm.reset();
      appointmentIdInput.value = '';
      manualStatus.value = 'pendiente';
    }

    appointmentModal.style.opacity = '1';
    appointmentModal.style.visibility = 'visible';
    appointmentModal.style.pointerEvents = 'auto';
    appointmentModal.setAttribute('aria-hidden', 'false');
  }

  function closeAppointmentModal() {
    appointmentModal.style.opacity = '0';
    appointmentModal.style.visibility = 'hidden';
    appointmentModal.style.pointerEvents = 'none';
    appointmentModal.setAttribute('aria-hidden', 'true');
    appointmentForm.reset();
    appointmentIdInput.value = '';
  }

  function refresh() {
    const appointments = loadAppointments().sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
    const total = appointments.length;
    const confirmed = appointments.filter((item) => item.status === 'confirmada').length;
    const pending = appointments.filter((item) => item.status === 'pendiente').length;
    const upcoming = appointments.filter((item) => new Date(item.date + 'T' + item.time) >= new Date()).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))[0];

    totalCount.textContent = total;
    confirmedCount.textContent = confirmed;
    pendingCount.textContent = pending;
    nextDate.textContent = upcoming ? `${upcoming.name} • ${formatDateShort(upcoming.date)} • ${upcoming.time}` : 'Sin citas';

    const selectedService = filterService.value;
    const filtered = selectedService === 'all'
      ? appointments
      : appointments.filter((item) => item.service === selectedService);

    if (!filtered.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay citas para este filtro.</td></tr>';
      return;
    }

    tableBody.innerHTML = filtered.map((appointment) => `
      <tr>
        <td>${appointment.name}</td>
        <td>${appointment.service}</td>
        <td>${appointment.phone}</td>
        <td>${formatDateShort(appointment.date)}</td>
        <td>${appointment.time}</td>
        <td><span class="status-pill status-${appointment.status}">${appointment.status}</span></td>
        <td>
          <div class="actions">
            <button class="small-btn primary" data-action="edit" data-id="${appointment.id}">Editar</button>
            <button class="small-btn danger" data-action="delete" data-id="${appointment.id}">Eliminar</button>
            <button class="small-btn" data-action="confirm" data-id="${appointment.id}" style="background: rgba(29,191,115,0.12); color: #0e8a52;">Confirmar</button>
          </div>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const id = button.dataset.id;
        const current = loadAppointments();

        if (action === 'delete') {
          const filteredList = current.filter((item) => item.id !== id);
          saveAppointments(filteredList);
          refresh();
          return;
        }

        if (action === 'edit') {
          const appointment = current.find((item) => item.id === id);
          if (appointment) openAppointmentModal('edit', appointment);
          return;
        }

        const next = current.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            status: action === 'confirm' ? 'confirmada' : 'cancelada'
          };
        });

        saveAppointments(next);
        refresh();
      });
    });
  }

  addAppointmentBtn.addEventListener('click', () => openAppointmentModal('create'));
  closeModalBtn.addEventListener('click', closeAppointmentModal);
  cancelManualBtn.addEventListener('click', closeAppointmentModal);

  appointmentModal.addEventListener('click', (event) => {
    if (event.target === appointmentModal) {
      closeAppointmentModal();
    }
  });

  appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const current = loadAppointments();
    const appointmentData = {
      id: appointmentIdInput.value || `manual-${Date.now()}`,
      name: manualName.value.trim(),
      phone: manualPhone.value.trim(),
      email: manualEmail.value.trim(),
      service: manualService.value,
      date: manualDate.value,
      time: manualTime.value,
      status: manualStatus.value,
      createdAt: Date.now()
    };

    if (!appointmentData.name || !appointmentData.phone || !appointmentData.email || !appointmentData.service || !appointmentData.date || !appointmentData.time) {
      alert('Completa todos los campos antes de guardar.');
      return;
    }

    if (appointmentIdInput.value) {
      const updated = current.map((item) => item.id === appointmentData.id ? appointmentData : item);
      saveAppointments(updated);
    } else {
      saveAppointments([...current, appointmentData]);
    }

    closeAppointmentModal();
    refresh();
  });

  filterService.addEventListener('change', refresh);
  refresh();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'user') {
    renderUserPage();
  }

  if (document.body.dataset.page === 'admin') {
    renderAdminPage();
  }
});
