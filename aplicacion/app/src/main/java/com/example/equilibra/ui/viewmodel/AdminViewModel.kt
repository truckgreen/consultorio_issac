package com.example.equilibra.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.equilibra.data.local.AppDatabase
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.local.AppointmentRepository
import com.example.equilibra.data.model.AdminNavTab
import com.example.equilibra.data.model.AdminNotification
import com.example.equilibra.data.model.ContactLead
import com.example.equilibra.data.remote.SupabaseAppointmentsDataSource
import com.example.equilibra.data.remote.SupabaseClient
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.random.Random

class AdminViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: AppointmentRepository
    private val supabase = SupabaseAppointmentsDataSource()

    val allAppointments: StateFlow<List<AppointmentEntity>>

    private val _activeTab = MutableStateFlow(AdminNavTab.DASHBOARD)
    val activeTab: StateFlow<AdminNavTab> = _activeTab.asStateFlow()

    private val _isDarkMode = MutableStateFlow(false)
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    private val _messages = MutableStateFlow<List<ContactLead>>(emptyList())
    val messages: StateFlow<List<ContactLead>> = _messages.asStateFlow()

    private val _notifications = MutableStateFlow<List<AdminNotification>>(emptyList())
    val notifications: StateFlow<List<AdminNotification>> = _notifications.asStateFlow()

    // Filter states
    private val _appointmentSearchQuery = MutableStateFlow("")
    val appointmentSearchQuery: StateFlow<String> = _appointmentSearchQuery.asStateFlow()

    private val _appointmentDateFilter = MutableStateFlow("TODOS") // TODOS, HOY, MANANA, SEMANA
    val appointmentDateFilter: StateFlow<String> = _appointmentDateFilter.asStateFlow()

    private val _appointmentStatusFilter = MutableStateFlow("TODOS") // TODOS, confirmada, en_curso, completada, cancelada
    val appointmentStatusFilter: StateFlow<String> = _appointmentStatusFilter.asStateFlow()

    private val _patientSearchQuery = MutableStateFlow("")
    val patientSearchQuery: StateFlow<String> = _patientSearchQuery.asStateFlow()

    // Dialog & Modal states
    private val _isCreateAppointmentOpen = MutableStateFlow(false)
    val isCreateAppointmentOpen: StateFlow<Boolean> = _isCreateAppointmentOpen.asStateFlow()

    private val _defaultSpecialistForNew = MutableStateFlow<String?>(null)
    val defaultSpecialistForNew: StateFlow<String?> = _defaultSpecialistForNew.asStateFlow()

    private val _editingAppointment = MutableStateFlow<AppointmentEntity?>(null)
    val editingAppointment: StateFlow<AppointmentEntity?> = _editingAppointment.asStateFlow()

    private val _selectedPatientKey = MutableStateFlow<String?>(null)
    val selectedPatientKey: StateFlow<String?> = _selectedPatientKey.asStateFlow()

    private val _isMoreMenuOpen = MutableStateFlow(false)
    val isMoreMenuOpen: StateFlow<Boolean> = _isMoreMenuOpen.asStateFlow()

    private val _isNotificationsOpen = MutableStateFlow(false)
    val isNotificationsOpen: StateFlow<Boolean> = _isNotificationsOpen.asStateFlow()

    init {
        val db = AppDatabase.getDatabase(application)
        repository = AppointmentRepository(db.appointmentDao())
        allAppointments = repository.allAppointments.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        // Remove only the exact demo records created by older app versions.
        viewModelScope.launch {
            val demoIds = (1..10).map { "app_$it" }.toSet()
            val currentAppointments = repository.allAppointments.first()
            if (currentAppointments.isNotEmpty() && currentAppointments.all { it.id in demoIds }) {
                repository.deleteAll()
            }

            val remoteAppointments = supabase.fetch()
            if (remoteAppointments.isNotEmpty()) {
                repository.deleteAll()
                repository.insertAll(remoteAppointments)
            }

            val remoteMessages = supabase.fetchContactMessages()
            if (remoteMessages.isNotEmpty()) {
                _messages.value = remoteMessages
            }

            // Connect to Realtime
            try {
                SupabaseClient.client.realtime.connect()
            } catch (_: Exception) {
            }

            // Start observing real-time updates
            launch {
                try {
                    supabase.observeAppointments().collectLatest { appointments ->
                        if (appointments.isNotEmpty()) {
                            repository.insertAll(appointments)
                        }
                    }
                } catch (_: Exception) {
                }
            }
        }
    }

    fun selectTab(tab: AdminNavTab) {
        _activeTab.value = tab
    }

    fun toggleDarkMode() {
        _isDarkMode.value = !_isDarkMode.value
    }

    fun setAppointmentSearchQuery(query: String) {
        _appointmentSearchQuery.value = query
    }

    fun setAppointmentDateFilter(filter: String) {
        _appointmentDateFilter.value = filter
    }

    fun setAppointmentStatusFilter(filter: String) {
        _appointmentStatusFilter.value = filter
    }

    fun setPatientSearchQuery(query: String) {
        _patientSearchQuery.value = query
    }

    // Modal Triggers
    fun openCreateAppointment(specialistName: String? = null) {
        _defaultSpecialistForNew.value = specialistName
        _isCreateAppointmentOpen.value = true
    }

    fun closeCreateAppointment() {
        _isCreateAppointmentOpen.value = false
        _defaultSpecialistForNew.value = null
    }

    fun openEditAppointment(appointment: AppointmentEntity) {
        _editingAppointment.value = appointment
    }

    fun closeEditAppointment() {
        _editingAppointment.value = null
    }

    fun openPatientDossier(patientFullName: String) {
        _selectedPatientKey.value = patientFullName
    }

    fun closePatientDossier() {
        _selectedPatientKey.value = null
    }

    fun toggleMoreMenu(open: Boolean) {
        _isMoreMenuOpen.value = open
    }

    fun toggleNotifications(open: Boolean) {
        _isNotificationsOpen.value = open
    }

    // Appointment CRUD
    fun createAppointment(
        nombre: String,
        apellido: String,
        telefono: String,
        email: String,
        serviceId: String,
        serviceTitle: String,
        specialistName: String,
        fecha: String,
        hora: String,
        amount: Double,
        motivo: String,
        primeraVisita: Boolean,
        notes: String
    ) {
        viewModelScope.launch {
            val codeNum = Random.nextInt(1000, 9999)
            val newEntity = AppointmentEntity(
                id = "app_${System.currentTimeMillis()}",
                code = "EQ-$codeNum",
                serviceId = serviceId,
                serviceTitle = serviceTitle,
                servicePrice = "$${amount.toInt()}",
                nombre = nombre.trim(),
                apellido = apellido.trim(),
                telefono = telefono.trim(),
                email = email.trim(),
                fecha = fecha,
                hora = hora,
                motivoConsulta = motivo.trim(),
                primeraVisita = primeraVisita,
                createdAt = System.currentTimeMillis(),
                status = "confirmada",
                specialistName = specialistName,
                amount = amount,
                notes = notes.trim()
            )
            repository.insert(newEntity)
            supabase.upsert(newEntity)

            // Add notification
            val notif = AdminNotification(
                id = "notif_${System.currentTimeMillis()}",
                title = "Nueva Cita Agendada",
                message = "${nombre} ${apellido} (${serviceTitle}) con ${specialistName} para el ${fecha}.",
                timestamp = "Ahora mismo",
                read = false,
                type = "appointment"
            )
            _notifications.value = listOf(notif) + _notifications.value
            closeCreateAppointment()
        }
    }

    fun updateAppointmentStatus(id: String, newStatus: String) {
        viewModelScope.launch {
            repository.updateStatus(id, newStatus)
            supabase.updateStatus(id, newStatus)
        }
    }

    fun updateAppointment(updated: AppointmentEntity) {
        viewModelScope.launch {
            repository.update(updated)
            supabase.upsert(updated)
            closeEditAppointment()
        }
    }

    fun deleteAppointment(id: String) {
        viewModelScope.launch {
            repository.deleteById(id)
            supabase.delete(id)
            if (_editingAppointment.value?.id == id) {
                closeEditAppointment()
            }
        }
    }

    // Message Lead Operations
    fun updateMessageStatus(id: String, newStatus: String, notes: String? = null) {
        _messages.value = _messages.value.map { msg ->
            if (msg.id == id) {
                msg.copy(
                    status = newStatus,
                    adminNotes = notes ?: msg.adminNotes
                )
            } else msg
        }
    }

    fun deleteMessage(id: String) {
        viewModelScope.launch {
            _messages.value = _messages.value.filter { it.id != id }
            supabase.deleteContactMessage(id)
        }
    }

    // Reset & Demo Data
    fun resetDemoData() {
        viewModelScope.launch {
            repository.deleteAll()
            _messages.value = emptyList()
            _notifications.value = emptyList()
        }
    }

    fun clearAllData() {
        viewModelScope.launch {
            repository.deleteAll()
            _messages.value = emptyList()
        }
    }

    fun markNotificationAsRead(id: String) {
        _notifications.value = _notifications.value.map {
            if (it.id == id) it.copy(read = true) else it
        }
    }
}
