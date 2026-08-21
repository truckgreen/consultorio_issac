package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.ConsultorioApp
import com.example.data.local.entity.AdminReminder
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.AppointmentStatus
import com.example.data.local.entity.ClinicalRecord
import com.example.data.local.entity.Patient
import com.example.data.local.entity.ReminderType
import com.example.data.repository.ConsultorioRepository
import com.example.notifications.ReminderScheduler
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class TimeSlot(
    val time: String, // e.g. "09:00"
    val isAvailable: Boolean,
    val appointment: Appointment? = null
)

data class DayAvailability(
    val date: String, // YYYY-MM-DD
    val totalSlots: Int,
    val bookedSlots: Int,
    val availableSlots: Int,
    val occupancyPercentage: Int,
    val slots: List<TimeSlot>
)

class ConsultorioViewModel(
    application: Application,
    private val repository: ConsultorioRepository
) : AndroidViewModel(application) {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())

    // --- Current Date State ---
    private val _selectedDate = MutableStateFlow(dateFormat.format(Date()))
    val selectedDate: StateFlow<String> = _selectedDate.asStateFlow()

    // --- Search & Filter States ---
    private val _patientSearchQuery = MutableStateFlow("")
    val patientSearchQuery: StateFlow<String> = _patientSearchQuery.asStateFlow()

    private val _appointmentStatusFilter = MutableStateFlow<AppointmentStatus?>(null)
    val appointmentStatusFilter: StateFlow<AppointmentStatus?> = _appointmentStatusFilter.asStateFlow()

    // --- Selected Patient for Detail View ---
    private val _selectedPatientId = MutableStateFlow<Long?>(null)
    val selectedPatientId: StateFlow<Long?> = _selectedPatientId.asStateFlow()

    // --- Patients Stream ---
    @OptIn(ExperimentalCoroutinesApi::class)
    val patients: StateFlow<List<Patient>> = _patientSearchQuery
        .flatMapLatest { query ->
            if (query.isBlank()) {
                repository.allPatients
            } else {
                repository.searchPatients(query.trim())
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val totalPatientsCount: StateFlow<Int> = repository.patientCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    // --- Selected Patient Detail Stream ---
    @OptIn(ExperimentalCoroutinesApi::class)
    val selectedPatient: StateFlow<Patient?> = _selectedPatientId
        .flatMapLatest { id ->
            if (id != null) repository.getPatientById(id) else MutableStateFlow(null)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    @OptIn(ExperimentalCoroutinesApi::class)
    val selectedPatientRecords: StateFlow<List<ClinicalRecord>> = _selectedPatientId
        .flatMapLatest { id ->
            if (id != null) repository.getClinicalRecordsForPatient(id) else MutableStateFlow(emptyList())
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    @OptIn(ExperimentalCoroutinesApi::class)
    val selectedPatientAppointments: StateFlow<List<Appointment>> = _selectedPatientId
        .flatMapLatest { id ->
            if (id != null) repository.getAppointmentsForPatient(id) else MutableStateFlow(emptyList())
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- Appointments Streams ---
    val allAppointments: StateFlow<List<Appointment>> = repository.allAppointments
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    @OptIn(ExperimentalCoroutinesApi::class)
    val dateAppointments: StateFlow<List<Appointment>> = _selectedDate
        .flatMapLatest { date ->
            repository.getAppointmentsForDate(date)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- Daily Availability Calculation ---
    val dayAvailability: StateFlow<DayAvailability> = combine(
        _selectedDate,
        dateAppointments
    ) { date, appointments ->
        calculateAvailability(date, appointments)
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        DayAvailability(
            date = dateFormat.format(Date()),
            totalSlots = 18,
            bookedSlots = 0,
            availableSlots = 18,
            occupancyPercentage = 0,
            slots = emptyList()
        )
    )

    // --- Admin Reminders & Notifications ---
    val allReminders: StateFlow<List<AdminReminder>> = repository.allAdminReminders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val unreadReminders: StateFlow<List<AdminReminder>> = repository.unreadAdminReminders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val unreadReminderCount: StateFlow<Int> = repository.unreadReminderCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    // --- Dashboard Overview Stats ---
    val todayAppointments: StateFlow<List<Appointment>> = repository.getAppointmentsForDate(dateFormat.format(Date()))
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // UI Message or Snackbar Event
    private val _userMessage = MutableStateFlow<String?>(null)
    val userMessage: StateFlow<String?> = _userMessage.asStateFlow()

    fun clearUserMessage() {
        _userMessage.value = null
    }

    fun setSelectedDate(date: String) {
        _selectedDate.value = date
    }

    fun setPatientSearchQuery(query: String) {
        _patientSearchQuery.value = query
    }

    fun setAppointmentStatusFilter(status: AppointmentStatus?) {
        _appointmentStatusFilter.value = status
    }

    fun selectPatient(patientId: Long?) {
        _selectedPatientId.value = patientId
    }

    // --- Patient Actions ---
    fun savePatient(patient: Patient, onSuccess: (Long) -> Unit = {}) {
        viewModelScope.launch {
            if (patient.id == 0L) {
                val newId = repository.insertPatient(patient)
                _userMessage.value = "Paciente ${patient.fullName} registrado con éxito"
                onSuccess(newId)
            } else {
                repository.updatePatient(patient)
                _userMessage.value = "Datos de ${patient.fullName} actualizados"
                onSuccess(patient.id)
            }
        }
    }

    fun deletePatient(patient: Patient) {
        viewModelScope.launch {
            repository.deletePatient(patient)
            if (_selectedPatientId.value == patient.id) {
                _selectedPatientId.value = null
            }
            _userMessage.value = "Paciente ${patient.fullName} eliminado"
        }
    }

    // --- Appointment Actions ---
    fun saveAppointment(appointment: Appointment, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            if (appointment.id == 0L) {
                val id = repository.insertAppointment(appointment)
                _userMessage.value = "Turno agendado para ${appointment.patientName} a las ${appointment.time}"
                
                // Schedule local system alarm for admin reminder
                scheduleSystemReminder(appointment.copy(id = id))
                onSuccess()
            } else {
                repository.updateAppointment(appointment)
                _userMessage.value = "Turno actualizado correctamente"
                onSuccess()
            }
        }
    }

    fun updateAppointmentStatus(appointmentId: Long, newStatus: AppointmentStatus) {
        viewModelScope.launch {
            repository.updateAppointmentStatus(appointmentId, newStatus)
            _userMessage.value = "Estado del turno actualizado a: ${newStatus.label}"
        }
    }

    fun deleteAppointment(appointment: Appointment) {
        viewModelScope.launch {
            repository.deleteAppointment(appointment)
            _userMessage.value = "Turno cancelado y eliminado"
        }
    }

    // --- Clinical Record Actions ---
    fun saveClinicalRecord(record: ClinicalRecord, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            if (record.id == 0L) {
                repository.insertClinicalRecord(record)
                _userMessage.value = "Consulta médica guardada en el historial clínico"
            } else {
                repository.updateClinicalRecord(record)
                _userMessage.value = "Historial clínico actualizado"
            }
            onSuccess()
        }
    }

    fun deleteClinicalRecord(record: ClinicalRecord) {
        viewModelScope.launch {
            repository.deleteClinicalRecord(record)
            _userMessage.value = "Registro clínico eliminado"
        }
    }

    // --- Admin Notification Actions ---
    fun markReminderAsRead(id: Long) {
        viewModelScope.launch {
            repository.markReminderAsRead(id)
        }
    }

    fun markAllRemindersAsRead() {
        viewModelScope.launch {
            repository.markAllRemindersAsRead()
            _userMessage.value = "Todos los recordatorios marcados como leídos"
        }
    }

    fun deleteReminder(reminder: AdminReminder) {
        viewModelScope.launch {
            repository.deleteReminder(reminder)
        }
    }

    fun triggerTestAdminNotification(title: String, message: String, patientName: String) {
        viewModelScope.launch {
            val app = getApplication<ConsultorioApp>()
            val notifId = (System.currentTimeMillis() % 100000).toInt()
            
            // 1. Show immediate Android notification
            app.notificationHelper.showAdminReminderNotification(
                notificationId = notifId,
                title = title,
                message = message,
                patientName = patientName,
                appointmentTime = timeFormat.format(Date())
            )

            // 2. Insert into in-app Admin Reminders Room Table
            repository.insertAdminReminder(
                AdminReminder(
                    patientName = patientName,
                    appointmentDate = dateFormat.format(Date()),
                    appointmentTime = timeFormat.format(Date()),
                    type = ReminderType.TURNO_PROXIMO,
                    title = title,
                    message = message,
                    scheduledEpochMillis = System.currentTimeMillis(),
                    isRead = false,
                    isSent = true
                )
            )

            _userMessage.value = "Alerta enviada a la barra de notificaciones del administrador"
        }
    }

    private fun scheduleSystemReminder(appointment: Appointment) {
        try {
            val dateTimeFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            val parsedDate = dateTimeFormat.parse("${appointment.date} ${appointment.time}")
            if (parsedDate != null) {
                val triggerMillis = parsedDate.time - (appointment.reminderOffsetMinutes * 60 * 1000L)
                if (triggerMillis > System.currentTimeMillis()) {
                    ReminderScheduler.scheduleReminder(
                        context = getApplication(),
                        notificationId = appointment.id.toInt(),
                        triggerAtMillis = triggerMillis,
                        title = "Equilibra: Turno en ${appointment.reminderOffsetMinutes} min",
                        message = "Paciente ${appointment.patientName} (${appointment.patientPhone}) a las ${appointment.time} hs.",
                        patientName = appointment.patientName,
                        appointmentTime = appointment.time
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Availability Helper: Generate standard 30-min slots from 08:00 to 19:30
    private fun calculateAvailability(date: String, appointments: List<Appointment>): DayAvailability {
        val standardSlots = listOf(
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
            "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
            "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
        )

        val activeAppointments = appointments.filter { it.status != AppointmentStatus.CANCELADO }
        val appointmentsByTime = activeAppointments.associateBy { it.time }

        val timeSlots = standardSlots.map { slotTime ->
            val booked = appointmentsByTime[slotTime]
            TimeSlot(
                time = slotTime,
                isAvailable = booked == null,
                appointment = booked
            )
        }

        val total = timeSlots.size
        val booked = timeSlots.count { !it.isAvailable }
        val available = total - booked
        val occupancy = if (total > 0) ((booked.toDouble() / total) * 100).toInt() else 0

        return DayAvailability(
            date = date,
            totalSlots = total,
            bookedSlots = booked,
            availableSlots = available,
            occupancyPercentage = occupancy,
            slots = timeSlots
        )
    }

    class Factory(private val application: Application) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            val consultorioApp = application as ConsultorioApp
            return ConsultorioViewModel(application, consultorioApp.repository) as T
        }
    }
}
