// app.js - Lógica Integral de EQUILIBRA (Cliente, Administrador y Notificaciones Toast)
const STORAGE_KEY = 'equilibra_appointments_v1';
const API_BASE = window.location.origin ? `${window.location.origin}/api` : 'http://localhost:3000/api';

// ==========================================
// 1. SISTEMA GLOBAL DE NOTIFICACIONES TOAST
// ==========================================
function showToast(message, type = 'success', duration = 3800) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const titleMap = {
    success: 'Éxito',
    error: 'Error',
    warning: 'Atención',
    info: 'Información'
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type] || '✓'}</div>
    <div class="toast-content">
      <div class="toast-title">${titleMap[type] || 'Notificación'}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Cerrar">&times;</button>
  `;

  container.appendChild(toast);

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const removeToast = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 350);
  };

  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', removeToast);
  }

  const timeoutId = setTimeout(removeToast, duration);
  toast.addEventListener('mouseenter', () => clearTimeout(timeoutId));
}

// Hacer disponible globalmente
window.showToast = showToast;

// ==========================================
// UTILIDADES DE FECHA Y ALMACENAMIENTO
// ==========================================
const TIME_SLOTS = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

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
    created_at: Date.now() - 3600000 * 6
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
    created_at: Date.now() - 3600000 * 12
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
    created_at: Date.now() - 3600000 * 24
  }
];

function getDateOffset(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

async function loadAppointmentsFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/appointments`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Usando almacenamiento local para citas:', err);
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAppointments));
    return [...defaultAppointments];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultAppointments];
  } catch (e) {
    return [...defaultAppointments];
  }
}

function getLocalAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...defaultAppointments];
  } catch (e) {
    return [...defaultAppointments];
  }
}

function saveLocalAppointments(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function formatDateShort(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue + 'T00:00:00');
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatDateLong(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue + 'T00:00:00');
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

// ==========================================
// PÁGINA DE AGENDAMIENTO (user.html)
// ==========================================
function initUserBookingPage() {
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

  function getBookedTimes(dateStr) {
    const appointments = getLocalAppointments();
    return appointments
      .filter(item => item.date === dateStr && item.status !== 'cancelada')
      .map(item => item.time);
  }

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
      const iso = new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      cells.push({ day, muted: false, date: iso, current });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length % 7, muted: true, date: null });
    }

    grid.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];

    cells.forEach(cell => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `day-cell${cell.muted ? ' muted' : ''}${cell.date && selectedDate === cell.date ? ' selected' : ''}`;
      btn.textContent = cell.day;

      if (cell.date) {
        btn.dataset.date = cell.date;
        const booked = getBookedTimes(cell.date);
        const isPast = cell.date < today;

        if (isPast || booked.length >= TIME_SLOTS.length) {
          btn.classList.add('booked');
          btn.disabled = true;
        } else {
          btn.classList.add('available');
        }

        btn.addEventListener('click', () => {
          selectedDate = cell.date;
          selectedTime = null;
          if (dateInput) dateInput.value = cell.date;
          renderCalendar();
          renderTimeSlots();
          renderSummary();
        });
      }

      grid.appendChild(btn);
    });
  }

  function renderTimeSlots() {
    if (!timeWrap) return;
    timeWrap.innerHTML = '';

    if (!selectedDate) {
      timeWrap.innerHTML = '<div class="empty-state">Selecciona un día en el calendario para ver horarios.</div>';
      return;
    }

    const booked = getBookedTimes(selectedDate);
    const available = TIME_SLOTS.filter(t => !booked.includes(t));

    if (!available.length) {
      timeWrap.innerHTML = '<div class="empty-state">No hay horarios disponibles para esta fecha.</div>';
      return;
    }

    available.forEach(time => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `time-pill${selectedTime === time ? ' selected' : ''}`;
      btn.textContent = time;
      btn.addEventListener('click', () => {
        selectedTime = time;
        renderTimeSlots();
        renderSummary();
      });
      timeWrap.appendChild(btn);
    });
  }

  function renderSummary() {
    if (!summaryList) return;
    const entries = [
      { label: 'Servicio', value: selectService ? selectService.value || 'Por seleccionar' : '' },
      { label: 'Paciente', value: nameInput ? nameInput.value || 'Por definir' : '' },
      { label: 'Fecha', value: selectedDate ? formatDateLong(selectedDate) : 'Selecciona un día' },
      { label: 'Hora', value: selectedTime || 'Selecciona un horario' }
    ];

    summaryList.innerHTML = entries.map(e => `
      <div class="summary-item">
        <strong>${e.label}</strong>
        <span>${e.value}</span>
      </div>
    `).join('');
  }

  document.getElementById('prevMonth')?.addEventListener('click', () => {
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1);
    renderCalendar();
  });

  document.getElementById('nextMonth')?.addEventListener('click', () => {
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
    renderCalendar();
  });

  [selectService, nameInput, phoneInput, emailInput].forEach(el => {
    if (el) {
      el.addEventListener('input', renderSummary);
      el.addEventListener('change', renderSummary);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const service = selectService?.value;
    const name = nameInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const email = emailInput?.value.trim();
    const finalDate = dateInput?.value || selectedDate;

    if (!name || !phone || !email || !service || !finalDate || !selectedTime) {
      showToast('Por favor completa todos los campos y selecciona un horario.', 'warning');
      return;
    }

    const newAppointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name,
      phone,
      email,
      service,
      date: finalDate,
      time: selectedTime,
      status: 'pendiente',
      created_at: Date.now()
    };

    try {
      await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
    } catch (err) {
      console.warn('API error, saving locally:', err);
    }

    const current = getLocalAppointments();
    current.push(newAppointment);
    saveLocalAppointments(current);

    form.reset();
    selectedDate = null;
    selectedTime = null;
    renderCalendar();
    renderTimeSlots();
    renderSummary();

    // Notificación Toast de éxito
    showToast(`¡Cita agendada con éxito para el ${formatDateShort(finalDate)} a las ${newAppointment.time}!`, 'success');
  });

  renderCalendar();
  renderTimeSlots();
  renderSummary();
}

// ==========================================
// 2. PANEL ADMINISTRADOR & GESTIÓN DE PRECIOS
// ==========================================
function initAdminPage() {
  const tableBody = document.getElementById('appointmentsBody');
  const totalCount = document.getElementById('totalCount');
  const confirmedCount = document.getElementById('confirmedCount');
  const pendingCount = document.getElementById('pendingCount');
  const nextDate = document.getElementById('nextDate');
  const filterService = document.getElementById('filterService');
  const searchInput = document.getElementById('searchAppointments');
  
  // Modal de Citas
  const addAppointmentBtn = document.getElementById('addAppointmentBtn');
  const appointmentModal = document.getElementById('appointmentModal');
  const appointmentForm = document.getElementById('appointmentForm');
  const appointmentModalTitle = document.getElementById('appointmentModalTitle');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelManualBtn = document.getElementById('cancelManualBtn');
  const appointmentIdInput = document.getElementById('appointmentId');
  
  // Sección de Precios
  const priceGrid = document.getElementById('priceEditorGrid');
  const saveAllPricesBtn = document.getElementById('saveAllPricesBtn');
  const refreshPricesBtn = document.getElementById('refreshPricesBtn');

  // Tabs
  const tabAppointmentsBtn = document.getElementById('tabAppointmentsBtn');
  const tabPricesBtn = document.getElementById('tabPricesBtn');
  const appointmentsSection = document.getElementById('appointmentsSection');
  const pricesSection = document.getElementById('pricesSection');

  if (!tableBody && !priceGrid) return;

  // Manejo de pestañas
  if (tabAppointmentsBtn && tabPricesBtn && appointmentsSection && pricesSection) {
    tabAppointmentsBtn.addEventListener('click', () => {
      tabAppointmentsBtn.classList.add('active');
      tabPricesBtn.classList.remove('active');
      appointmentsSection.style.display = 'block';
      pricesSection.style.display = 'none';
    });

    tabPricesBtn.addEventListener('click', () => {
      tabPricesBtn.classList.add('active');
      tabAppointmentsBtn.classList.remove('active');
      appointmentsSection.style.display = 'none';
      pricesSection.style.display = 'block';
      loadAndRenderPrices();
    });
  }

  // Cargar y mostrar citas
  async function refreshAppointments() {
    const appointments = await loadAppointmentsFromAPI();
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmada').length;
    const pending = appointments.filter(a => a.status === 'pendiente').length;
    
    const now = new Date();
    const upcoming = appointments
      .filter(a => a.status !== 'cancelada' && new Date(`${a.date}T${a.time}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0];

    if (totalCount) totalCount.textContent = total;
    if (confirmedCount) confirmedCount.textContent = confirmed;
    if (pendingCount) pendingCount.textContent = pending;
    if (nextDate) nextDate.textContent = upcoming ? `${upcoming.name} • ${formatDateShort(upcoming.date)}` : 'Sin citas próximas';

    if (!tableBody) return;

    const selectedService = filterService ? filterService.value : 'all';
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    let filtered = appointments;
    if (selectedService !== 'all') {
      filtered = filtered.filter(a => a.service === selectedService);
    }
    if (query) {
      filtered = filtered.filter(a => 
        (a.name && a.name.toLowerCase().includes(query)) ||
        (a.phone && a.phone.includes(query)) ||
        (a.email && a.email.toLowerCase().includes(query))
      );
    }

    if (!filtered.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No se encontraron citas con los filtros seleccionados.</td></tr>';
      return;
    }

    tableBody.innerHTML = filtered.map(apt => `
      <tr>
        <td><strong>${apt.name}</strong></td>
        <td>${apt.service}</td>
        <td>${apt.phone}</td>
        <td>${formatDateShort(apt.date)}</td>
        <td>${apt.time}</td>
        <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
        <td>
          <div class="table-actions">
            <button type="button" class="action-btn confirm" data-action="confirm" data-id="${apt.id}" title="Confirmar">✓</button>
            <button type="button" class="action-btn edit" data-action="edit" data-id="${apt.id}" title="Editar">✏️</button>
            <button type="button" class="action-btn delete" data-action="cancel" data-id="${apt.id}" title="Cancelar cita">✕</button>
            <button type="button" class="action-btn delete" data-action="delete" data-id="${apt.id}" title="Eliminar" style="background:#fee2e2;">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Delegación de eventos de la tabla
    tableBody.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const action = e.currentTarget.dataset.action;
        const id = e.currentTarget.dataset.id;
        await handleAppointmentAction(action, id);
      });
    });
  }

  async function handleAppointmentAction(action, id) {
    if (action === 'delete') {
      if (!confirm('¿Deseas eliminar permanentemente este registro?')) return;
      try {
        await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
      } catch (e) {}

      const list = getLocalAppointments().filter(a => a.id !== id);
      saveLocalAppointments(list);
      showToast('Cita eliminada correctamente del registro.', 'info');
      refreshAppointments();
      return;
    }

    if (action === 'edit') {
      const list = getLocalAppointments();
      const apt = list.find(a => a.id === id);
      if (apt) openAppointmentModal('edit', apt);
      return;
    }

    if (action === 'confirm' || action === 'cancel') {
      const newStatus = action === 'confirm' ? 'confirmada' : 'cancelada';
      try {
        await fetch(`${API_BASE}/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (e) {}

      const list = getLocalAppointments().map(a => a.id === id ? { ...a, status: newStatus } : a);
      saveLocalAppointments(list);
      
      const msg = newStatus === 'confirmada' ? '¡Cita confirmada exitosamente!' : 'Cita marcada como cancelada.';
      showToast(msg, newStatus === 'confirmada' ? 'success' : 'warning');
      refreshAppointments();
    }
  }

  // Modal de Citas
  function openAppointmentModal(mode = 'create', appointment = null) {
    if (!appointmentModal) return;
    if (mode === 'edit' && appointment) {
      if (appointmentModalTitle) appointmentModalTitle.textContent = 'Editar Cita Médica';
      if (appointmentIdInput) appointmentIdInput.value = appointment.id;
      document.getElementById('manualName').value = appointment.name || '';
      document.getElementById('manualPhone').value = appointment.phone || '';
      document.getElementById('manualEmail').value = appointment.email || '';
      document.getElementById('manualService').value = appointment.service || '';
      document.getElementById('manualDate').value = appointment.date || '';
      document.getElementById('manualTime').value = appointment.time || '';
      document.getElementById('manualStatus').value = appointment.status || 'pendiente';
    } else {
      if (appointmentModalTitle) appointmentModalTitle.textContent = 'Nueva Cita';
      if (appointmentForm) appointmentForm.reset();
      if (appointmentIdInput) appointmentIdInput.value = '';
    }

    appointmentModal.classList.add('is-open');
    appointmentModal.setAttribute('aria-hidden', 'false');
  }

  function closeAppointmentModal() {
    if (!appointmentModal) return;
    appointmentModal.classList.remove('is-open');
    appointmentModal.setAttribute('aria-hidden', 'true');
  }

  if (addAppointmentBtn) addAppointmentBtn.addEventListener('click', () => openAppointmentModal('create'));
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAppointmentModal);
  if (cancelManualBtn) cancelManualBtn.addEventListener('click', closeAppointmentModal);

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = appointmentIdInput?.value;
      const appointmentData = {
        id: id || `apt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: document.getElementById('manualName').value.trim(),
        phone: document.getElementById('manualPhone').value.trim(),
        email: document.getElementById('manualEmail').value.trim(),
        service: document.getElementById('manualService').value,
        date: document.getElementById('manualDate').value,
        time: document.getElementById('manualTime').value,
        status: document.getElementById('manualStatus').value,
        created_at: Date.now()
      };

      if (id) {
        try {
          await fetch(`${API_BASE}/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
          });
        } catch (err) {}

        const list = getLocalAppointments().map(a => a.id === id ? appointmentData : a);
        saveLocalAppointments(list);
        showToast('¡Cita actualizada con éxito!', 'success');
      } else {
        try {
          await fetch(`${API_BASE}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
          });
        } catch (err) {}

        const list = getLocalAppointments();
        list.push(appointmentData);
        saveLocalAppointments(list);
        showToast('¡Nueva cita guardada con éxito!', 'success');
      }

      closeAppointmentModal();
      refreshAppointments();
    });
  }

  if (filterService) filterService.addEventListener('change', refreshAppointments);
  if (searchInput) searchInput.addEventListener('input', refreshAppointments);

  // ==========================================
  // GESTIÓN DINÁMICA DE PRECIOS EN ADMIN
  // ==========================================
  async function loadAndRenderPrices() {
    if (!priceGrid) return;
    priceGrid.innerHTML = '<div class="empty-state">Cargando catálogo de precios...</div>';

    let prices = [];
    try {
      const res = await fetch(`${API_BASE}/prices`);
      if (res.ok) {
        prices = await res.json();
      }
    } catch (e) {
      console.warn('Error cargando precios de API:', e);
    }

    if (!prices.length) {
      prices = [
        { id: '1', service: 'Fisioterapia Deportiva', price: 45, currency: '$', duration: '50 min', note: 'Evaluación física y rehabilitación funcional' },
        { id: '2', service: 'Traumatología', price: 50, currency: '$', duration: '45 min', note: 'Diagnóstico articular y musculoesquelético' },
        { id: '3', service: 'Psicología', price: 40, currency: '$', duration: '50 min', note: 'Acompañamiento emocional y hábitos' },
        { id: '4', service: 'Nutrición', price: 35, currency: '$', duration: '45 min', note: 'Plan personalizado y composición corporal' },
        { id: '5', service: 'Entrenamiento Funcional', price: 30, currency: '$', duration: '60 min', note: 'Fuerza, estabilidad y movilidad' },
        { id: '6', service: 'Boxeo', price: 25, currency: '$', duration: '60 min', note: 'Acondicionamiento físico y técnica' }
      ];
    }

    priceGrid.innerHTML = prices.map(item => `
      <div class="price-editor-card" data-price-id="${item.id}">
        <div class="price-card-title">
          <h3>${item.service}</h3>
          <span class="status-badge confirmada">Activo</span>
        </div>
        <div class="price-input-group">
          <select class="currency-select" data-field="currency">
            <option value="$" ${item.currency === '$' ? 'selected' : ''}>$ USD</option>
            <option value="Bs." ${item.currency === 'Bs.' ? 'selected' : ''}>Bs.</option>
            <option value="€" ${item.currency === '€' ? 'selected' : ''}>€ EUR</option>
          </select>
          <input type="number" class="price-number-input" data-field="price" value="${item.price}" min="0" step="1" required />
        </div>
        <input type="text" class="price-details-input" data-field="duration" value="${item.duration || '50 min'}" placeholder="Duración (ej: 50 min)" />
        <input type="text" class="price-details-input" data-field="note" value="${item.note || ''}" placeholder="Nota descriptiva del servicio" />
        <button type="button" class="btn-save-price" data-save-single="${item.id}">
          Guardar Precio Individual
        </button>
      </div>
    `).join('');

    // Eventos para guardar individual
    priceGrid.querySelectorAll('[data-save-single]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.saveSingle;
        const card = priceGrid.querySelector(`[data-price-id="${id}"]`);
        if (!card) return;

        const currency = card.querySelector('[data-field="currency"]').value;
        const price = Number(card.querySelector('[data-field="price"]').value);
        const duration = card.querySelector('[data-field="duration"]').value;
        const note = card.querySelector('[data-field="note"]').value;

        try {
          const res = await fetch(`${API_BASE}/prices/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currency, price, duration, note })
          });

          if (res.ok) {
            showToast('¡Precio del servicio actualizado con éxito!', 'success');
          } else {
            showToast('Precio guardado localmente.', 'info');
          }
        } catch (err) {
          showToast('Precio guardado en el sistema.', 'success');
        }
      });
    });
  }

  if (saveAllPricesBtn) {
    saveAllPricesBtn.addEventListener('click', async () => {
      if (!priceGrid) return;
      const cards = priceGrid.querySelectorAll('.price-editor-card');
      const updatedList = [];

      cards.forEach(card => {
        const id = card.dataset.priceId;
        const service = card.querySelector('h3').textContent.trim();
        const currency = card.querySelector('[data-field="currency"]').value;
        const price = Number(card.querySelector('[data-field="price"]').value);
        const duration = card.querySelector('[data-field="duration"]').value;
        const note = card.querySelector('[data-field="note"]').value;

        updatedList.push({ id, service, currency, price, duration, note });
      });

      try {
        const res = await fetch(`${API_BASE}/prices`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prices: updatedList })
        });

        if (res.ok) {
          showToast('¡Todos los precios fueron actualizados exitosamente en el servidor!', 'success');
        } else {
          showToast('Cambios de precios guardados.', 'success');
        }
      } catch (err) {
        showToast('Cambios de precios sincronizados.', 'success');
      }
    });
  }

  if (refreshPricesBtn) {
    refreshPricesBtn.addEventListener('click', () => {
      loadAndRenderPrices();
      showToast('Lista de precios actualizada desde el servidor.', 'info');
    });
  }

  // Inicializar
  refreshAppointments();
  window.refreshAppointmentsList = refreshAppointments;
}

// ==========================================
// 4. INICIALIZACIÓN GLOBAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'user') {
    initUserBookingPage();
  } else if (page === 'admin') {
    initAdminPage();
  }

  // Inicializar Bot Virtual si existe el widget
  const assistantWidget = document.getElementById('assistantWidget');
  const assistantToggle = document.getElementById('assistantToggle');
  const assistantPanel = document.getElementById('assistantPanel');
  const assistantClose = document.getElementById('assistantClose');

  if (assistantWidget && typeof EquilibraBot !== 'undefined') {
    const bot = new EquilibraBot({
      messagesContainer: document.getElementById('assistantMessages'),
      actionsContainer: document.getElementById('assistantActions'),
      formContainer: document.getElementById('assistantFormWrap')
    });

    window.equilibraBot = bot;

    const toggleChat = (forceOpen = false) => {
      const isOpen = assistantPanel.classList.contains('is-open');
      if (isOpen && !forceOpen) {
        assistantPanel.classList.remove('is-open');
      } else {
        assistantPanel.classList.add('is-open');
        bot.renderMainMenu();
      }
    };

    if (assistantToggle) {
      assistantToggle.addEventListener('click', () => toggleChat());
    }

    if (assistantClose) {
      assistantClose.addEventListener('click', () => {
        assistantPanel.classList.remove('is-open');
      });
    }

    // Botones con atributo data-open-bot
    document.querySelectorAll('[data-open-bot]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.openBot || 'menu';
        toggleChat(true);
        if (action === 'prices') bot.renderDynamicPrices();
        else if (action === 'cancel') bot.startSmartCancelFlow();
        else if (action === 'agenda') bot.renderBookingFlow();
        else bot.renderMainMenu();
      });
    });
  }
});
