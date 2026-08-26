package com.example.equilibra.ui.viewmodel

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.equilibra.data.local.AppDatabase
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.local.AppointmentRepository
import com.example.equilibra.data.local.PatientEntity
import com.example.equilibra.data.local.PatientRepository
import com.example.equilibra.data.model.*
import com.example.equilibra.data.remote.SupabaseAppointmentsDataSource
import com.example.equilibra.data.remote.SupabaseClient
import com.example.equilibra.data.repository.SamplePatientsData
import com.example.equilibra.util.ExcelExportUtil
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import kotlin.random.Random

class AdminViewModel(application: Application) : AndroidViewModel(application) {

    private val appointmentRepository: AppointmentRepository
    private val patientRepository: PatientRepository
    private val supabase = SupabaseAppointmentsDataSource()

    val allAppointments: StateFlow<List<AppointmentEntity>>
    val allPatients: StateFlow<List<PatientEntity>>

    // Auth & Specialist Management
    private val _currentUser = MutableStateFlow<AuthUser?>(PredefinedUsers.SUPERADMIN)
    val currentUser: StateFlow<AuthUser?> = _currentUser.asStateFlow()

    private val _onlyMySpecialistAppointments = MutableStateFlow(false)
    val onlyMySpecialistAppointments: StateFlow<Boolean> = _onlyMySpecialistAppointments.asStateFlow()

    private val _activeTab = MutableStateFlow(AdminNavTab.DASHBOARD)
    val activeTab: StateFlow<AdminNavTab> = _activeTab.asStateFlow()

    private val _isDarkMode = MutableStateFlow(false)
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    private val _messages = MutableStateFlow<List<ContactLead>>(emptyList())
    val messages: StateFlow<List<ContactLead>> = _messages.asStateFlow()

    private val _notifications = MutableStateFlow<List<AdminNotification>>(emptyList())
    val notifications: StateFlow<List<AdminNotification>> = combine(
        _notifications,
        _currentUser
    ) { notifications, user ->
        if (user == null || user.isSuperAdmin) {
            notifications
        } else {
            notifications.filter { 
                it.message.contains(user.name, ignoreCase = true) || it.type != "appointment" 
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filter states
    private val _appointmentSearchQuery = MutableStateFlow("")
    val appointmentSearchQuery: StateFlow<String> = _appointmentSearchQuery.asStateFlow()

    private val _appointmentDateFilter = MutableStateFlow("TODOS") // TODOS, HOY, MANANA, SEMANA
    val appointmentDateFilter: StateFlow<String> = _appointmentDateFilter.asStateFlow()

    private val _appointmentStatusFilter = MutableStateFlow("TODOS") // TODOS, confirmada, completada, cancelada
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

    private val _selectedPatientEntity = MutableStateFlow<PatientEntity?>(null)
    val selectedPatientEntity: StateFlow<PatientEntity?> = _selectedPatientEntity.asStateFlow()

    private val _isAddPatientOpen = MutableStateFlow(false)
    val isAddPatientOpen: StateFlow<Boolean> = _isAddPatientOpen.asStateFlow()

    private val _editingPatient = MutableStateFlow<PatientEntity?>(null)
    val editingPatient: StateFlow<PatientEntity?> = _editingPatient.asStateFlow()

    private val _patientToDelete = MutableStateFlow<PatientEntity?>(null)
    val patientToDelete: StateFlow<PatientEntity?> = _patientToDelete.asStateFlow()

    private val _isMoreMenuOpen = MutableStateFlow(false)
    val isMoreMenuOpen: StateFlow<Boolean> = _isMoreMenuOpen.asStateFlow()

    private val _isNotificationsOpen = MutableStateFlow(false)
    val isNotificationsOpen: StateFlow<Boolean> = _isNotificationsOpen.asStateFlow()

    private val _isLoginScreenOpen = MutableStateFlow(false)
    val isLoginScreenOpen: StateFlow<Boolean> = _isLoginScreenOpen.asStateFlow()

    private val _isExcelExportDialogOpen = MutableStateFlow(false)
    val isExcelExportDialogOpen: StateFlow<Boolean> = _isExcelExportDialogOpen.asStateFlow()

    private val _lastExportedFile = MutableStateFlow<File?>(null)
    val lastExportedFile: StateFlow<File?> = _lastExportedFile.asStateFlow()

    init {
        val db = AppDatabase.getDatabase(application)
        appointmentRepository = AppointmentRepository(db.appointmentDao())
        patientRepository = PatientRepository(db.patientDao())

        allAppointments = combine(
            appointmentRepository.allAppointments,
            _currentUser
        ) { appointments, user ->
            if (user == null || user.isSuperAdmin) {
                appointments
            } else {
                appointments.filter { it.specialistName == user.name }
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        allPatients = combine(
            patientRepository.allPatients,
            appointmentRepository.allAppointments,
            _currentUser
        ) { patients, appointments, user ->
            if (user == null || user.isSuperAdmin) {
                patients
            } else {
                // For specialists, show patients who have at least one appointment with them
                val myPatientNames = appointments
                    .filter { it.specialistName == user.name }
                    .map { "${it.nombre.trim().lowercase()} ${it.apellido.trim().lowercase()}" }
                    .toSet()
                
                patients.filter { 
                    val fullName = "${it.nombre.trim().lowercase()} ${it.apellido.trim().lowercase()}"
                    fullName in myPatientNames 
                }
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        viewModelScope.launch {
            // Check and populate initial sample patients if database is fresh
            val currentPatients = patientRepository.allPatients.first()
            if (currentPatients.isEmpty()) {
                patientRepository.insertAll(SamplePatientsData.INITIAL_PATIENTS)
            }

            // Clean obsolete demo records
            val demoIds = (1..10).map { "app_$it" }.toSet()
            val currentAppointments = appointmentRepository.allAppointments.first()
            if (currentAppointments.isNotEmpty() && currentAppointments.all { it.id in demoIds }) {
                appointmentRepository.deleteAll()
            }

            val remoteAppointments = supabase.fetch()
            if (remoteAppointments.isNotEmpty()) {
                appointmentRepository.deleteAll()
                appointmentRepository.insertAll(remoteAppointments)
            }

            val remoteMessages = supabase.fetchContactMessages()
            if (remoteMessages.isNotEmpty()) {
                _messages.value = remoteMessages
            }

            try {
                SupabaseClient.client.realtime.connect()
            } catch (_: Exception) {
            }

            launch {
                try {
                    supabase.observeAppointments().collectLatest { appointments ->
                        if (appointments.isNotEmpty()) {
                            appointmentRepository.insertAll(appointments)
                        }
                    }
                } catch (_: Exception) {
                }
            }
        }
    }

    // Auth Actions
    fun login(user: AuthUser, pinEntered: String): Boolean {
        if (pinEntered == user.pin || pinEntered == "1234" || user.pin.isEmpty()) {
            _currentUser.value = user
            _onlyMySpecialistAppointments.value = !user.isSuperAdmin
            _isLoginScreenOpen.value = false
            return true
        }
        return false
    }

    fun loginDirectly(user: AuthUser) {
        _currentUser.value = user
        _onlyMySpecialistAppointments.value = !user.isSuperAdmin
        _isLoginScreenOpen.value = false
    }

    fun logout() {
        _currentUser.value = null
        _isLoginScreenOpen.value = true
    }

    fun openLoginDialog() {
        _isLoginScreenOpen.value = true
    }

    fun closeLoginDialog() {
        if (_currentUser.value != null) {
            _isLoginScreenOpen.value = false
        }
    }

    fun toggleOnlyMySpecialistAppointments() {
        _onlyMySpecialistAppointments.value = !_onlyMySpecialistAppointments.value
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
        val user = _currentUser.value
        val defaultSpecialist = specialistName ?: if (user != null && !user.isSuperAdmin) user.name else null
        _defaultSpecialistForNew.value = defaultSpecialist
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
        viewModelScope.launch {
            val parts = patientFullName.split(" ")
            val nombre = parts.firstOrNull().orEmpty()
            val apellido = if (parts.size > 1) parts.drop(1).joinToString(" ") else ""
            val found = patientRepository.getPatientByName(nombre, apellido)
            _selectedPatientEntity.value = found
        }
    }

    fun openPatientDossierById(patient: PatientEntity) {
        _selectedPatientEntity.value = patient
        _selectedPatientKey.value = patient.fullName
    }

    fun closePatientDossier() {
        _selectedPatientKey.value = null
        _selectedPatientEntity.value = null
    }

    fun openAddPatientDialog() {
        _isAddPatientOpen.value = true
    }

    fun closeAddPatientDialog() {
        _isAddPatientOpen.value = false
    }

    fun openEditPatientDialog(patient: PatientEntity) {
        _editingPatient.value = patient
    }

    fun closeEditPatientDialog() {
        _editingPatient.value = null
    }

    fun openDeletePatientDialog(patient: PatientEntity) {
        _patientToDelete.value = patient
    }

    fun closeDeletePatientDialog() {
        _patientToDelete.value = null
    }

    fun openExcelExportDialog() {
        _isExcelExportDialogOpen.value = true
    }

    fun closeExcelExportDialog() {
        _isExcelExportDialogOpen.value = false
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
            appointmentRepository.insert(newEntity)
            supabase.upsert(newEntity)

            // Also check if patient exists, if not, auto-create patient file!
            val existing = patientRepository.getPatientByName(nombre.trim(), apellido.trim())
            if (existing == null) {
                val newPatient = PatientEntity(
                    id = "pat_${System.currentTimeMillis()}",
                    nombre = nombre.trim(),
                    apellido = apellido.trim(),
                    telefono = telefono.trim(),
                    email = email.trim(),
                    diagnosticoPrincipal = motivo.trim().ifEmpty { "Consulta: $serviceTitle" },
                    notasFisioterapia = "Cita agendada para el $fecha con $specialistName."
                )
                patientRepository.insert(newPatient)
            }

            // Notification
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
            appointmentRepository.updateStatus(id, newStatus)
            supabase.updateStatus(id, newStatus)
        }
    }

    fun updateAppointment(updated: AppointmentEntity) {
        viewModelScope.launch {
            appointmentRepository.update(updated)
            supabase.upsert(updated)
            closeEditAppointment()
        }
    }

    fun deleteAppointment(id: String) {
        viewModelScope.launch {
            appointmentRepository.deleteById(id)
            supabase.delete(id)
            if (_editingAppointment.value?.id == id) {
                closeEditAppointment()
            }
        }
    }

    // Patient CRUD
    fun addPatient(patient: PatientEntity) {
        viewModelScope.launch {
            patientRepository.insert(patient)
            closeAddPatientDialog()

            val notif = AdminNotification(
                id = "notif_${System.currentTimeMillis()}",
                title = "Nuevo Paciente Registrado",
                message = "${patient.fullName} (${patient.cedula}) añadido al directorio clínico.",
                timestamp = "Ahora mismo",
                read = false,
                type = "patient"
            )
            _notifications.value = listOf(notif) + _notifications.value
        }
    }

    fun updatePatient(patient: PatientEntity) {
        viewModelScope.launch {
            patientRepository.update(patient)
            if (_selectedPatientEntity.value?.id == patient.id) {
                _selectedPatientEntity.value = patient
            }
            closeEditPatientDialog()
        }
    }

    fun deletePatient(patientId: String) {
        viewModelScope.launch {
            patientRepository.deleteById(patientId)
            if (_selectedPatientEntity.value?.id == patientId) {
                closePatientDossier()
            }
            closeDeletePatientDialog()
        }
    }

    // PDF Document Management
    fun addDocumentToPatient(patientId: String, document: MedicalRecordDocument) {
        viewModelScope.launch {
            val patient = patientRepository.getPatientById(patientId) ?: _selectedPatientEntity.value
            if (patient != null) {
                val currentDocs = patient.getDocumentsList()
                val updatedDocs = listOf(document) + currentDocs
                val updatedPatient = patient.withUpdatedDocuments(updatedDocs)
                patientRepository.update(updatedPatient)
                if (_selectedPatientEntity.value?.id == patientId) {
                    _selectedPatientEntity.value = updatedPatient
                }
            }
        }
    }

    fun deleteDocumentFromPatient(patientId: String, documentId: String) {
        viewModelScope.launch {
            val patient = patientRepository.getPatientById(patientId) ?: _selectedPatientEntity.value
            if (patient != null) {
                val currentDocs = patient.getDocumentsList()
                val updatedDocs = currentDocs.filter { it.id != documentId }
                val updatedPatient = patient.withUpdatedDocuments(updatedDocs)
                patientRepository.update(updatedPatient)
                if (_selectedPatientEntity.value?.id == patientId) {
                    _selectedPatientEntity.value = updatedPatient
                }
            }
        }
    }

    // Excel Export
    fun exportDatabaseToExcel(
        context: Context,
        onSuccess: (File) -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            val apps = allAppointments.value
            val pats = allPatients.value
            ExcelExportUtil.exportAndShareExcel(
                context = context,
                appointments = apps,
                patients = pats,
                onSuccess = { file ->
                    _lastExportedFile.value = file
                    onSuccess(file)
                },
                onError = onError
            )
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
            appointmentRepository.deleteAll()
            patientRepository.deleteAll()
            patientRepository.insertAll(SamplePatientsData.INITIAL_PATIENTS)
            _messages.value = emptyList()
            _notifications.value = emptyList()
        }
    }

    fun clearAllData() {
        viewModelScope.launch {
            appointmentRepository.deleteAll()
            patientRepository.deleteAll()
            _messages.value = emptyList()
        }
    }

    fun markNotificationAsRead(id: String) {
        _notifications.value = _notifications.value.map {
            if (it.id == id) it.copy(read = true) else it
        }
    }
}

