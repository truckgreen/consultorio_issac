// bot.js - Lógica del Asistente Virtual Inteligente de EQUILIBRA
// Soporta flujo de cancelación paso a paso (Nombre -> Apellido -> Teléfono),
// consulta dinámica de precios desde el backend, y agendamiento interactivo.

const BOT_API_URL = window.location.origin ? `${window.location.origin}/api` : 'http://localhost:3000/api';

class EquilibraBot {
  constructor(options = {}) {
    this.messagesContainer = options.messagesContainer || document.getElementById('assistantMessages');
    this.actionsContainer = options.actionsContainer || document.getElementById('assistantActions');
    this.formContainer = options.formContainer || document.getElementById('assistantFormWrap');
    this.onToast = options.onToast || ((msg, type) => { if (window.showToast) window.showToast(msg, type); else console.log(msg); });
    
    // Estado del flujo de cancelación
    this.cancelFlow = {
      step: 0, // 0: inactivo, 1: esperando nombre, 2: esperando apellido, 3: esperando teléfono, 4: confirmación
      firstName: '',
      lastName: '',
      phone: '',
      foundAppointments: []
    };

    // Cache de precios dinámicos
    this.cachedPrices = null;
  }

  // Enviar mensaje en el chat
  addMessage(text, sender = 'bot', options = {}) {
    if (!this.messagesContainer) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `assistant-message ${sender}`;
    
    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    let htmlContent = `<div class="message-content">${text}</div>`;
    if (options.subtext) {
      htmlContent += `<div class="message-subtext">${options.subtext}</div>`;
    }
    htmlContent += `<span class="message-time">${time}</span>`;
    
    msgDiv.innerHTML = htmlContent;
    this.messagesContainer.appendChild(msgDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  // Limpiar contenedores auxiliares
  clearActions() {
    if (this.actionsContainer) this.actionsContainer.innerHTML = '';
  }

  clearForm() {
    if (this.formContainer) this.formContainer.innerHTML = '';
  }

  // Menú Principal
  renderMainMenu() {
    this.cancelFlow = { step: 0, firstName: '', lastName: '', phone: '', foundAppointments: [] };
    if (this.messagesContainer) this.messagesContainer.innerHTML = '';
    this.clearForm();

    this.addMessage('¡Hola! 👋 Soy tu <strong>asistente virtual de EQUILIBRA</strong>.<br>¿En qué puedo ayudarte el día de hoy?');

    if (this.actionsContainer) {
      this.actionsContainer.innerHTML = `
        <button type="button" class="bot-chip-btn" data-action="agenda">
          📅 Agendar cita
        </button>
        <button type="button" class="bot-chip-btn" data-action="prices">
          💰 Consultar precios
        </button>
        <button type="button" class="bot-chip-btn" data-action="cancel_flow">
          ❌ Cancelar una cita
        </button>
        <button type="button" class="bot-chip-btn" data-action="services_info">
          ℹ️ Conocer servicios
        </button>
        <button type="button" class="bot-chip-btn call-btn" data-action="call_specialist">
          📞 Hablar con especialista
        </button>
      `;
      this.bindActionButtons();
    }
  }

  bindActionButtons() {
    if (!this.actionsContainer) return;
    const buttons = this.actionsContainer.querySelectorAll('.bot-chip-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleUserAction(action);
      });
    });
  }

  handleUserAction(action) {
    switch (action) {
      case 'menu':
        this.renderMainMenu();
        break;
      case 'agenda':
        this.renderBookingFlow();
        break;
      case 'prices':
        this.renderDynamicPrices();
        break;
      case 'cancel_flow':
        this.startSmartCancelFlow();
        break;
      case 'services_info':
        this.renderServicesInfo();
        break;
      case 'call_specialist':
        this.callSpecialist();
        break;
      default:
        this.renderMainMenu();
    }
  }

  // ==========================================
  // 2. GESTIÓN DINÁMICA DE PRECIOS
  // ==========================================
  async fetchDynamicPrices() {
    try {
      const res = await fetch(`${BOT_API_URL}/prices`);
      if (res.ok) {
        const data = await res.json();
        this.cachedPrices = data;
        return data;
      }
    } catch (err) {
      console.warn('No se pudo obtener precios del servidor, usando datos locales:', err);
    }

    // Precios por defecto si falla conexión
    const defaultPrices = [
      { id: '1', service: 'Fisioterapia Deportiva', price: 45, currency: '$', duration: '50 min', note: 'Evaluación física y rehabilitación funcional' },
      { id: '2', service: 'Traumatología', price: 50, currency: '$', duration: '45 min', note: 'Diagnóstico articular y musculoesquelético' },
      { id: '3', service: 'Psicología', price: 40, currency: '$', duration: '50 min', note: 'Acompañamiento emocional y hábitos' },
      { id: '4', service: 'Nutrición', price: 35, currency: '$', duration: '45 min', note: 'Plan personalizado y composición corporal' },
      { id: '5', service: 'Entrenamiento Funcional', price: 30, currency: '$', duration: '60 min', note: 'Fuerza, estabilidad y movilidad' },
      { id: '6', service: 'Boxeo', price: 25, currency: '$', duration: '60 min', note: 'Acondicionamiento físico y técnica' }
    ];
    this.cachedPrices = defaultPrices;
    return defaultPrices;
  }

  async renderDynamicPrices() {
    this.clearActions();
    this.clearForm();

    this.addMessage('Cargando nuestro catálogo de tarifas actualizadas... ⏳');

    const prices = await this.fetchDynamicPrices();

    this.addMessage('📋 <strong>Tarifas y Servicios Oficiales de EQUILIBRA:</strong>');

    let priceListHtml = `<div class="bot-price-catalog">`;
    prices.forEach(p => {
      priceListHtml += `
        <div class="bot-price-card">
          <div class="price-header">
            <span class="service-name">${p.service}</span>
            <span class="price-tag">${p.currency || '$'}${p.price}</span>
          </div>
          <div class="price-details">
            ${p.duration ? `<span class="duration">⏱️ ${p.duration}</span>` : ''}
            ${p.note ? `<p class="note">${p.note}</p>` : ''}
          </div>
          <button type="button" class="btn-book-service" data-service="${p.service}">
            Agendar este servicio →
          </button>
        </div>
      `;
    });
    priceListHtml += `</div>`;

    if (this.formContainer) {
      this.formContainer.innerHTML = priceListHtml;

      const bookButtons = this.formContainer.querySelectorAll('.btn-book-service');
      bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const selectedService = e.currentTarget.dataset.service;
          this.renderBookingFlow(selectedService);
        });
      });
    }

    if (this.actionsContainer) {
      this.actionsContainer.innerHTML = `
        <button type="button" class="bot-chip-btn" data-action="agenda">📅 Agendar una cita</button>
        <button type="button" class="bot-chip-btn" data-action="menu">🏠 Volver al inicio</button>
      `;
      this.bindActionButtons();
    }
  }

  // ==========================================
  // 3. FLUJO DE CANCELACIÓN INTELIGENTE
  // Paso a paso: 1) Nombre -> 2) Apellido -> 3) Teléfono
  // ==========================================
  startSmartCancelFlow() {
    this.cancelFlow = {
      step: 1,
      firstName: '',
      lastName: '',
      phone: '',
      foundAppointments: []
    };

    this.clearActions();
    this.clearForm();

    this.addMessage('Comprendo que deseas cancelar una cita. Para ayudarte de manera segura, te haré 3 breves preguntas.');
    this.askCancelStep1();
  }

  // Paso 1: Preguntar Nombre
  askCancelStep1() {
    this.cancelFlow.step = 1;
    this.addMessage('<strong>Paso 1 de 3:</strong> ¿Cuál es tu <strong>Nombre</strong>? (Por ejemplo: María)');

    if (this.formContainer) {
      this.formContainer.innerHTML = `
        <form class="bot-step-form" id="cancelStep1Form">
          <label for="cancelFirstName">Ingresa tu nombre:</label>
          <div class="input-with-action">
            <input type="text" id="cancelFirstName" placeholder="Ej: Carlos" required autocomplete="given-name" />
            <button type="submit" class="btn-step-submit">Siguiente →</button>
          </div>
        </form>
      `;

      const form = document.getElementById('cancelStep1Form');
      const input = document.getElementById('cancelFirstName');
      if (input) input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (!value) return;

        this.cancelFlow.firstName = value;
        this.addMessage(value, 'user');
        this.askCancelStep2();
      });
    }

    if (this.actionsContainer) {
      this.actionsContainer.innerHTML = `<button type="button" class="bot-chip-btn" data-action="menu">↩ Cancelar y volver al menú</button>`;
      this.bindActionButtons();
    }
  }

  // Paso 2: Preguntar Apellido
  askCancelStep2() {
    this.cancelFlow.step = 2;
    this.clearForm();
    this.addMessage(`Gracias, <strong>${this.cancelFlow.firstName}</strong>. 👍<br><strong>Paso 2 de 3:</strong> Ahora, ¿cuál es tu <strong>Apellido</strong>?`);

    if (this.formContainer) {
      this.formContainer.innerHTML = `
        <form class="bot-step-form" id="cancelStep2Form">
          <label for="cancelLastName">Ingresa tu apellido:</label>
          <div class="input-with-action">
            <input type="text" id="cancelLastName" placeholder="Ej: Pérez" required autocomplete="family-name" />
            <button type="submit" class="btn-step-submit">Siguiente →</button>
          </div>
        </form>
      `;

      const form = document.getElementById('cancelStep2Form');
      const input = document.getElementById('cancelLastName');
      if (input) input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (!value) return;

        this.cancelFlow.lastName = value;
        this.addMessage(value, 'user');
        this.askCancelStep3();
      });
    }
  }

  // Paso 3: Preguntar Número de Teléfono
  askCancelStep3() {
    this.cancelFlow.step = 3;
    this.clearForm();
    this.addMessage(`Perfecto. <strong>Paso 3 de 3:</strong> Por favor, ingresa tu <strong>Número de Teléfono</strong> registrado en la cita:`);

    if (this.formContainer) {
      this.formContainer.innerHTML = `
        <form class="bot-step-form" id="cancelStep3Form">
          <label for="cancelPhone">Número de teléfono:</label>
          <div class="input-with-action">
            <input type="tel" id="cancelPhone" placeholder="Ej: 0412-1234567" required autocomplete="tel" />
            <button type="submit" class="btn-step-submit">Buscar Cita 🔍</button>
          </div>
        </form>
      `;

      const form = document.getElementById('cancelStep3Form');
      const input = document.getElementById('cancelPhone');
      if (input) input.focus();

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (!value) return;

        this.cancelFlow.phone = value;
        this.addMessage(value, 'user');
        await this.executeSearchAndCancel();
      });
    }
  }

  // Búsqueda en base de datos y confirmación de cancelación
  async executeSearchAndCancel() {
    this.clearForm();
    this.clearActions();

    this.addMessage(`Buscando citas para <strong>${this.cancelFlow.firstName} ${this.cancelFlow.lastName}</strong> con teléfono <strong>${this.cancelFlow.phone}</strong>... ⏳`);

    let appointments = [];
    try {
      const res = await fetch(`${BOT_API_URL}/appointments`);
      if (res.ok) {
        appointments = await res.json();
      }
    } catch (err) {
      console.warn('Error al buscar en API, buscando en almacenamiento local:', err);
      const raw = localStorage.getItem('equilibra_appointments_v1');
      appointments = raw ? JSON.parse(raw) : [];
    }

    const searchFirst = this.normalizeText(this.cancelFlow.firstName);
    const searchLast = this.normalizeText(this.cancelFlow.lastName);
    const searchPhone = this.cleanPhone(this.cancelFlow.phone);

    // Filtrar citas coincidentes no canceladas
    const matches = appointments.filter(apt => {
      if (apt.status === 'cancelada') return false;
      const aptName = this.normalizeText(apt.name || '');
      const aptPhone = this.cleanPhone(apt.phone || '');

      const nameMatch = (aptName.includes(searchFirst) || aptName.includes(searchLast));
      const phoneMatch = (aptPhone.includes(searchPhone) || searchPhone.includes(aptPhone));
      return nameMatch && phoneMatch;
    });

    if (!matches || matches.length === 0) {
      this.addMessage(
        `❌ No encontramos ninguna cita activa a nombre de <strong>${this.cancelFlow.firstName} ${this.cancelFlow.lastName}</strong> con el teléfono <strong>${this.cancelFlow.phone}</strong>.`,
        'bot',
        { subtext: 'Verifica si escribiste tus datos correctamente o si la cita ya fue cancelada previamente.' }
      );

      if (this.actionsContainer) {
        this.actionsContainer.innerHTML = `
          <button type="button" class="bot-chip-btn" data-action="cancel_flow">🔄 Intentar de nuevo</button>
          <button type="button" class="bot-chip-btn" data-action="call_specialist">📞 Contactar a recepción</button>
          <button type="button" class="bot-chip-btn" data-action="menu">🏠 Volver al inicio</button>
        `;
        this.bindActionButtons();
      }
      return;
    }

    // Si encontramos una o más citas
    this.cancelFlow.foundAppointments = matches;
    this.addMessage(`✅ Hemos encontrado <strong>${matches.length} cita(s) activa(s)</strong> registrada(s):`);

    let listHtml = `<div class="bot-cancel-list">`;
    matches.forEach(apt => {
      listHtml += `
        <div class="bot-cancel-card">
          <div class="cancel-card-header">
            <strong>${apt.service}</strong>
            <span class="status-tag ${apt.status}">${apt.status}</span>
          </div>
          <p>👤 <strong>Paciente:</strong> ${apt.name}</p>
          <p>📅 <strong>Fecha:</strong> ${this.formatDatePretty(apt.date)}</p>
          <p>⏰ <strong>Hora:</strong> ${apt.time}</p>
          <button type="button" class="btn-confirm-cancel" data-apt-id="${apt.id}">
            ⚠️ Confirmar Cancelación de esta Cita
          </button>
        </div>
      `;
    });
    listHtml += `</div>`;

    if (this.formContainer) {
      this.formContainer.innerHTML = listHtml;

      const cancelButtons = this.formContainer.querySelectorAll('.btn-confirm-cancel');
      cancelButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const aptId = e.currentTarget.dataset.aptId;
          await this.performAppointmentCancellation(aptId);
        });
      });
    }

    if (this.actionsContainer) {
      this.actionsContainer.innerHTML = `<button type="button" class="bot-chip-btn" data-action="menu">↩ Volver al menú sin cancelar</button>`;
      this.bindActionButtons();
    }
  }

  // Ejecución de la cancelación
  async performAppointmentCancellation(appointmentId) {
    this.clearForm();
    this.clearActions();

    let success = false;
    try {
      const res = await fetch(`${BOT_API_URL}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelada' })
      });

      if (res.ok) {
        success = true;
      }
    } catch (err) {
      console.warn('Error al actualizar en API, actualizando localStorage:', err);
    }

    // Actualizar también en localStorage
    try {
      const raw = localStorage.getItem('equilibra_appointments_v1');
      if (raw) {
        const list = JSON.parse(raw);
        const updated = list.map(item => item.id === appointmentId ? { ...item, status: 'cancelada' } : item);
        localStorage.setItem('equilibra_appointments_v1', JSON.stringify(updated));
        success = true;
      }
    } catch (e) {}

    if (success) {
      this.addMessage('✅ <strong>¡Tu cita ha sido cancelada exitosamente!</strong>', 'bot', {
        subtext: 'El horario ha quedado liberado. Si deseas reagendar para otra fecha, estamos a tu disposición.'
      });

      // Mostrar Toast visual
      if (window.showToast) {
        window.showToast('¡Cita cancelada con éxito!', 'success');
      }

      // Notificar a la vista de citas si existe
      if (typeof window.refreshAppointmentsList === 'function') {
        window.refreshAppointmentsList();
      }
    } else {
      this.addMessage('Hubo un problema al procesar la cancelación. Por favor comunícate directamente con recepción.');
      if (window.showToast) {
        window.showToast('No se pudo cancelar la cita. Intenta de nuevo.', 'error');
      }
    }

    if (this.actionsContainer) {
      this.actionsContainer.innerHTML = `
        <button type="button" class="bot-chip-btn" data-action="agenda">📅 Agendar una nueva cita</button>
        <button type="button" class="bot-chip-btn" data-action="menu">🏠 Volver al menú principal</button>
      `;
      this.bindActionButtons();
    }
  }

  // ==========================================
  // 4. FLUJO DE AGENDAMIENTO
  // ==========================================
  renderBookingFlow(preselectedService = '') {
    this.clearActions();
    this.clearForm();

    this.addMessage('Ingresa tus datos para agendar tu cita médica en pocos segundos:');

    const dateOptions = this.generateDateOptions();
    const timeSlots = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

    if (this.formContainer) {
      this.formContainer.innerHTML = `
        <form class="assistant-booking-form" id="botBookingForm">
          <div class="form-field">
            <label for="botName">Nombre y Apellido *</label>
            <input type="text" id="botName" placeholder="Ej: María López" required />
          </div>

          <div class="form-field">
            <label for="botPhone">Teléfono de contacto *</label>
            <input type="tel" id="botPhone" placeholder="Ej: 0412-1234567" required />
          </div>

          <div class="form-field">
            <label for="botEmail">Correo electrónico *</label>
            <input type="email" id="botEmail" placeholder="maria@ejemplo.com" required />
          </div>

          <div class="form-field">
            <label for="botService">Servicio requerido *</label>
            <select id="botService" required>
              <option value="">Seleccionar servicio...</option>
              <option ${preselectedService === 'Fisioterapia Deportiva' ? 'selected' : ''}>Fisioterapia Deportiva</option>
              <option ${preselectedService === 'Traumatología' ? 'selected' : ''}>Traumatología</option>
              <option ${preselectedService === 'Psicología' ? 'selected' : ''}>Psicología</option>
              <option ${preselectedService === 'Nutrición' ? 'selected' : ''}>Nutrición</option>
              <option ${preselectedService === 'Entrenamiento Funcional' ? 'selected' : ''}>Entrenamiento Funcional</option>
              <option ${preselectedService === 'Boxeo' ? 'selected' : ''}>Boxeo</option>
            </select>
          </div>

          <div class="form-grid-2">
            <div class="form-field">
              <label for="botDate">Fecha *</label>
              <select id="botDate" required>
                ${dateOptions.map(d => `<option value="${d.iso}">${d.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-field">
              <label for="botTime">Hora *</label>
              <select id="botTime" required>
                <option value="">Selecciona hora</option>
                ${timeSlots.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
          </div>

          <button type="submit" class="btn-primary-bot">Confirmar y Agendar Cita</button>
        </form>
      `;

      const form = document.getElementById('botBookingForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleBookingSubmit();
      });
    }

    if (this.actionsContainer) {
      this.actionsContainer.innerHTML = `<button type="button" class="bot-chip-btn" data-action="menu">↩ Volver al menú</button>`;
      this.bindActionButtons();
    }
  }

  async handleBookingSubmit() {
    const name = document.getElementById('botName')?.value.trim();
    const phone = document.getElementById('botPhone')?.value.trim();
    const email = document.getElementById('botEmail')?.value.trim();
    const service = document.getElementById('botService')?.value;
    const date = document.getElementById('botDate')?.value;
    const time = document.getElementById('botTime')?.value;

    if (!name || !phone || !email || !service || !date || !time) {
      this.addMessage('⚠️ Por favor completa todos los campos requeridos.');
      return;
    }

    const newAppointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name,
      phone,
      email,
      service,
      date,
      time,
      status: 'pendiente',
      created_at: Date.now()
    };

    let created = false;
    try {
      const res = await fetch(`${BOT_API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
      if (res.ok) {
        created = true;
      }
    } catch (err) {
      console.warn('Guardando en almacenamiento local:', err);
    }

    // Guardar en localStorage
    try {
      const raw = localStorage.getItem('equilibra_appointments_v1');
      const list = raw ? JSON.parse(raw) : [];
      list.push(newAppointment);
      localStorage.setItem('equilibra_appointments_v1', JSON.stringify(list));
      created = true;
    } catch (e) {}

    if (created) {
      this.clearForm();
      this.clearActions();

      this.addMessage(
        `🎉 <strong>¡Cita agendada con éxito, ${name}!</strong><br>` +
        `Te esperamos para tu sesión de <strong>${service}</strong> el <strong>${this.formatDatePretty(date)}</strong> a las <strong>${time}</strong>.`
      );

      if (window.showToast) {
        window.showToast(`¡Cita agendada con éxito para el ${this.formatDatePretty(date)} a las ${time}!`, 'success');
      }

      if (typeof window.refreshAppointmentsList === 'function') {
        window.refreshAppointmentsList();
      }

      if (this.actionsContainer) {
        this.actionsContainer.innerHTML = `
          <button type="button" class="bot-chip-btn" data-action="prices">💰 Ver tarifas</button>
          <button type="button" class="bot-chip-btn" data-action="menu">🏠 Volver al inicio</button>
        `;
        this.bindActionButtons();
      }
    }
  }

  // Información de servicios
  renderServicesInfo() {
    this.clearActions();
    this.clearForm();

    this.addMessage(
      '🏥 <strong>Especialidades en EQUILIBRA:</strong><br><br>' +
      '• <strong>Fisioterapia Deportiva:</strong> Rehabilitación de lesiones y optimización física.<br>' +
      '• <strong>Traumatología:</strong> Diagnóstico y cuidado articular integral.<br>' +
      '• <strong>Psicología:</strong> Salud mental, manejo de ansiedad y hábitos saludables.<br>' +
      '• <strong>Nutrición:</strong> Composición corporal y planes adaptados a tu vida.<br>' +
      '• <strong>Entrenamiento Funcional:</strong> Fuerza y resistencia en grupos reducidos.<br>' +
      '• <strong>Boxeo:</strong> Condición física, técnica y descarga de estrés.'
    );

    if (this.actionsContainer) {
      this.actionsContainer.innerHTML = `
        <button type="button" class="bot-chip-btn" data-action="agenda">📅 Agendar Cita</button>
        <button type="button" class="bot-chip-btn" data-action="prices">💰 Consultar Precios</button>
        <button type="button" class="bot-chip-btn" data-action="menu">🏠 Volver al inicio</button>
      `;
      this.bindActionButtons();
    }
  }

  callSpecialist() {
    this.addMessage('📞 Conectando con la línea de atención de EQUILIBRA (+58 412-1234567)...');
    window.location.href = 'tel:+584121234567';
  }

  // Utilidades auxiliares
  normalizeText(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  cleanPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  formatDatePretty(isoDate) {
    if (!isoDate) return '';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
      }
      return isoDate;
    } catch (e) {
      return isoDate;
    }
  }

  generateDateOptions() {
    const list = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      // Omitir domingos
      if (d.getDay() === 0) continue;

      const iso = d.toISOString().split('T')[0];
      const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
      list.push({ iso, label });
    }
    return list;
  }
}

// Exportar para navegador o Node
if (typeof window !== 'undefined') {
  window.EquilibraBot = EquilibraBot;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EquilibraBot };
}
