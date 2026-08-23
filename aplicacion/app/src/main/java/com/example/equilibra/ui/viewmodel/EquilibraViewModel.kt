package com.example.equilibra.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.equilibra.data.local.AppDatabase
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.local.AppointmentRepository
import com.example.equilibra.data.model.FaqItem
import com.example.equilibra.data.model.ServiceItem
import com.example.equilibra.data.model.SlotStatus
import com.example.equilibra.data.model.TeamMember
import com.example.equilibra.data.model.TimeSlotInfo
import com.example.equilibra.data.repository.EquilibraDataRepository
import com.example.equilibra.data.remote.SupabaseAppointmentsDataSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.random.Random

class EquilibraViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: AppointmentRepository
    private val supabase = SupabaseAppointmentsDataSource()

    val allAppointments: StateFlow<List<AppointmentEntity>>

    init {
        val db = AppDatabase.getDatabase(application)
        repository = AppointmentRepository(db.appointmentDao())
        allAppointments = repository.allAppointments.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        viewModelScope.launch {
            try {
                val remote = supabase.fetch()
                if (remote.isNotEmpty()) {
                    repository.insertAll(remote)
                }
            } catch (_: Exception) {
            }
        }
    }

    // Theme Mode
    private val _isDarkMode = MutableStateFlow(false)
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    fun toggleDarkMode() {
        _isDarkMode.value = !_isDarkMode.value
    }

    // Service Filtering
    private val _selectedServiceCategory = MutableStateFlow("todos")
    val selectedServiceCategory: StateFlow<String> = _selectedServiceCategory.asStateFlow()

    fun selectServiceCategory(category: String) {
        _selectedServiceCategory.value = category
    }

    // Team Filtering
    private val _selectedTeamCategory = MutableStateFlow("todos")
    val selectedTeamCategory: StateFlow<String> = _selectedTeamCategory.asStateFlow()

    fun selectTeamCategory(category: String) {
        _selectedTeamCategory.value = category
    }

    // Active Service Detail Modal
    private val _activeDetailService = MutableStateFlow<ServiceItem?>(null)
    val activeDetailService: StateFlow<ServiceItem?> = _activeDetailService.asStateFlow()

    fun showServiceDetail(service: ServiceItem) {
        _activeDetailService.value = service
    }

    fun dismissServiceDetail() {
        _activeDetailService.value = null
    }

    // Active Team Detail Modal
    private val _activeDetailTeamMember = MutableStateFlow<TeamMember?>(null)
    val activeDetailTeamMember: StateFlow<TeamMember?> = _activeDetailTeamMember.asStateFlow()

    fun showTeamDetail(member: TeamMember) {
        _activeDetailTeamMember.value = member
    }

    fun dismissTeamDetail() {
        _activeDetailTeamMember.value = null
    }

    // Show My Appointments Sheet
    private val _showMyAppointmentsSheet = MutableStateFlow(false)
    val showMyAppointmentsSheet: StateFlow<Boolean> = _showMyAppointmentsSheet.asStateFlow()

    fun toggleMyAppointmentsSheet(show: Boolean) {
        _showMyAppointmentsSheet.value = show
    }

    // Interactive Assessment
    private val _assessmentStep = MutableStateFlow(1)
    val assessmentStep: StateFlow<Int> = _assessmentStep.asStateFlow()

    private val _assessmentGoal = MutableStateFlow("")
    val assessmentGoal: StateFlow<String> = _assessmentGoal.asStateFlow()

    private val _recommendedServiceId = MutableStateFlow("fisioterapia")
    val recommendedServiceId: StateFlow<String> = _recommendedServiceId.asStateFlow()

    fun selectAssessmentGoal(goalId: String) {
        _assessmentGoal.value = goalId
        val rec = when (goalId) {
            "dolor" -> "fisioterapia"
            "deporte" -> "fisioterapia-deportiva"
            "pediatria" -> "fisioterapia-pediatrica"
            "geriatria" -> "fisioterapia-geriatrica"
            "rendimiento" -> "entrenamiento-funcional"
            "emocional" -> "psicologia"
            else -> "fisioterapia"
        }
        _recommendedServiceId.value = rec
        _assessmentStep.value = 2
    }

    fun resetAssessment() {
        _assessmentStep.value = 1
        _assessmentGoal.value = ""
        _recommendedServiceId.value = "fisioterapia"
    }

    // Booking Form State
    private val _bookingServiceId = MutableStateFlow("fisioterapia")
    val bookingServiceId: StateFlow<String> = _bookingServiceId.asStateFlow()

    private val _bookingDate = MutableStateFlow(getInitialDateString())
    val bookingDate: StateFlow<String> = _bookingDate.asStateFlow()

    private val _bookingTime = MutableStateFlow("09:00 AM - 10:00 AM")
    val bookingTime: StateFlow<String> = _bookingTime.asStateFlow()

    private val _nombre = MutableStateFlow("")
    val nombre: StateFlow<String> = _nombre.asStateFlow()

    private val _apellido = MutableStateFlow("")
    val apellido: StateFlow<String> = _apellido.asStateFlow()

    private val _telefono = MutableStateFlow("")
    val telefono: StateFlow<String> = _telefono.asStateFlow()

    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _motivo = MutableStateFlow("")
    val motivo: StateFlow<String> = _motivo.asStateFlow()

    private val _primeraVisita = MutableStateFlow(true)
    val primeraVisita: StateFlow<Boolean> = _primeraVisita.asStateFlow()

    private val _formErrors = MutableStateFlow<Map<String, String>>(emptyMap())
    val formErrors: StateFlow<Map<String, String>> = _formErrors.asStateFlow()

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting.asStateFlow()

    private val _latestConfirmedAppointment = MutableStateFlow<AppointmentEntity?>(null)
    val latestConfirmedAppointment: StateFlow<AppointmentEntity?> = _latestConfirmedAppointment.asStateFlow()

    private fun getInitialDateString(): String {
        var date = LocalDate.now()
        if (date.dayOfWeek.value == 7) {
            // Sunday -> next day Monday
            date = date.plusDays(1)
        }
        return date.format(DateTimeFormatter.ISO_LOCAL_DATE)
    }

    fun setBookingServiceId(id: String) {
        _bookingServiceId.value = id
        _activeDetailService.value = null
        _activeDetailTeamMember.value = null
    }

    fun setBookingDate(dateStr: String) {
        _bookingDate.value = dateStr
        clearError("fecha")
        updateTimeSlotIfNeeded(dateStr)
    }

    fun setBookingTime(timeStr: String) {
        _bookingTime.value = timeStr
        clearError("hora")
    }

    fun setNombre(v: String) {
        _nombre.value = v
        clearError("nombre")
    }

    fun setApellido(v: String) {
        _apellido.value = v
        clearError("apellido")
    }

    fun setTelefono(v: String) {
        _telefono.value = v
        clearError("telefono")
    }

    fun setEmail(v: String) {
        _email.value = v
        clearError("email")
    }

    fun setMotivo(v: String) {
        _motivo.value = v
    }

    fun setPrimeraVisita(v: Boolean) {
        _primeraVisita.value = v
    }

    private fun clearError(key: String) {
        if (_formErrors.value.containsKey(key)) {
            _formErrors.value = _formErrors.value - key
        }
    }

    private fun updateTimeSlotIfNeeded(dateStr: String) {
        val slots = EquilibraDataRepository.getSlotsForDate(dateStr, allAppointments.value)
        val availableSlots = slots.filter { it.status != SlotStatus.OCUPADO }
        if (availableSlots.isNotEmpty()) {
            if (availableSlots.none { it.time == _bookingTime.value }) {
                _bookingTime.value = availableSlots.first().time
            }
        } else {
            _bookingTime.value = ""
        }
    }

    fun validateAndSubmitBooking(): Boolean {
        val errors = mutableMapOf<String, String>()

        if (_nombre.value.trim().length < 2) {
            errors["nombre"] = "Ingresa un nombre válido (mínimo 2 letras)."
        }
        if (_apellido.value.trim().length < 2) {
            errors["apellido"] = "Ingresa un apellido válido."
        }
        if (_telefono.value.trim().length < 7) {
            errors["telefono"] = "Ingresa un número de contacto válido."
        }
        if (!_email.value.trim().contains("@") || !_email.value.trim().contains(".")) {
            errors["email"] = "Ingresa un correo electrónico válido."
        }
        if (_bookingDate.value.isBlank()) {
            errors["fecha"] = "Selecciona una fecha en el calendario."
        }
        if (_bookingTime.value.isBlank()) {
            errors["hora"] = "Selecciona una hora disponible."
        }

        _formErrors.value = errors
        if (errors.isNotEmpty()) return false

        _isSubmitting.value = true
        val service = EquilibraDataRepository.SERVICES.find { it.id == _bookingServiceId.value }
            ?: EquilibraDataRepository.SERVICES.first()
        val randomCode = "EQ-${Random.nextInt(1000, 9999)}"

        val newApp = AppointmentEntity(
            id = "app-${System.currentTimeMillis()}",
            code = randomCode,
            serviceId = service.id,
            serviceTitle = service.title,
            servicePrice = service.priceFormatted + " USD",
            nombre = _nombre.value.trim(),
            apellido = _apellido.value.trim(),
            telefono = _telefono.value.trim(),
            email = _email.value.trim(),
            fecha = _bookingDate.value,
            hora = _bookingTime.value,
            motivoConsulta = _motivo.value.trim(),
            primeraVisita = _primeraVisita.value,
            createdAt = System.currentTimeMillis(),
            status = "confirmada"
        )

        viewModelScope.launch {
            repository.insert(newApp)
            supabase.upsert(newApp)
            _latestConfirmedAppointment.value = newApp
            _isSubmitting.value = false
        }
        return true
    }

    fun dismissConfirmationDialog() {
        _latestConfirmedAppointment.value = null
    }

    fun deleteAppointment(id: String) {
        viewModelScope.launch {
            repository.deleteById(id)
            supabase.delete(id)
        }
    }
}
