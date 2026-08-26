package com.example.equilibra

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.local.PatientEntity
import com.example.equilibra.data.model.AdminNavTab
import com.example.equilibra.data.model.MedicalRecordDocument
import com.example.equilibra.ui.admin.*
import com.example.equilibra.ui.auth.LoginScreen
import com.example.equilibra.ui.components.PatientPortalScreen
import com.example.equilibra.ui.theme.EquilibraTheme
import com.example.equilibra.ui.viewmodel.AdminViewModel
import com.example.equilibra.ui.viewmodel.EquilibraViewModel

enum class AppScreenMode {
    PATIENT_PORTAL,
    ADMIN_PANEL
}

class MainActivity : ComponentActivity() {
    private val adminViewModel: AdminViewModel by viewModels()
    private val patientViewModel: EquilibraViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val isDarkModeAdmin by adminViewModel.isDarkMode.collectAsStateWithLifecycle()
            val isDarkModePatient by patientViewModel.isDarkMode.collectAsStateWithLifecycle()
            val currentUser by adminViewModel.currentUser.collectAsStateWithLifecycle()
            var currentScreenMode by remember { mutableStateOf(AppScreenMode.ADMIN_PANEL) }

            val isDark = if (currentScreenMode == AppScreenMode.ADMIN_PANEL) isDarkModeAdmin else isDarkModePatient

            EquilibraTheme(darkTheme = isDark) {
                when (currentScreenMode) {
                    AppScreenMode.PATIENT_PORTAL -> {
                        PatientPortalScreen(
                            viewModel = patientViewModel,
                            onNavigateToAdmin = { currentScreenMode = AppScreenMode.ADMIN_PANEL }
                        )
                    }
                    AppScreenMode.ADMIN_PANEL -> {
                        if (currentUser == null) {
                            LoginScreen(
                                onLoginSuccess = { user ->
                                    adminViewModel.loginDirectly(user)
                                },
                                onBackToPatientApp = {
                                    currentScreenMode = AppScreenMode.PATIENT_PORTAL
                                }
                            )
                        } else {
                            AdminMainScreen(
                                viewModel = adminViewModel,
                                onNavigateToPatientPortal = { currentScreenMode = AppScreenMode.PATIENT_PORTAL }
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminMainScreen(
    viewModel: AdminViewModel,
    onNavigateToPatientPortal: () -> Unit
) {
    val context = LocalContext.current
    val activeTab by viewModel.activeTab.collectAsStateWithLifecycle()
    val isDarkMode by viewModel.isDarkMode.collectAsStateWithLifecycle()
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()
    val appointments by viewModel.allAppointments.collectAsStateWithLifecycle()
    val patients by viewModel.allPatients.collectAsStateWithLifecycle()
    val messages by viewModel.messages.collectAsStateWithLifecycle()
    val notifications by viewModel.notifications.collectAsStateWithLifecycle()
    val searchQuery by viewModel.appointmentSearchQuery.collectAsStateWithLifecycle()
    val dateFilter by viewModel.appointmentDateFilter.collectAsStateWithLifecycle()
    val statusFilter by viewModel.appointmentStatusFilter.collectAsStateWithLifecycle()
    val patientSearch by viewModel.patientSearchQuery.collectAsStateWithLifecycle()
    val createOpen by viewModel.isCreateAppointmentOpen.collectAsStateWithLifecycle()
    val isExcelExportOpen by viewModel.isExcelExportDialogOpen.collectAsStateWithLifecycle()
    val defaultSpecialist by viewModel.defaultSpecialistForNew.collectAsStateWithLifecycle()
    val moreMenuOpen by viewModel.isMoreMenuOpen.collectAsStateWithLifecycle()

    var appointmentToEdit by remember { mutableStateOf<AppointmentEntity?>(null) }
    var patientToView by remember { mutableStateOf<PatientEntity?>(null) }
    var patientToEdit by remember { mutableStateOf<PatientEntity?>(null) }
    var patientToDelete by remember { mutableStateOf<PatientEntity?>(null) }
    var isAddPatientOpen by remember { mutableStateOf(false) }
    var notificationsOpen by remember { mutableStateOf(false) }

    val today = java.time.LocalDate.now().toString()
    val todayCount = appointments.count { it.fecha == today }
    val unreadCount = messages.count { it.status == "NUEVO" }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("admin_app"),
        topBar = {
            AdminTopBar(
                currentUser = currentUser,
                isDarkMode = isDarkMode,
                onToggleDarkMode = viewModel::toggleDarkMode,
                unreadNotificationsCount = notifications.count { !it.read },
                onOpenNotifications = { notificationsOpen = true },
                onOpenNewAppointment = { viewModel.openCreateAppointment() },
                onLogout = viewModel::logout,
                onNavigateToPatientPortal = onNavigateToPatientPortal
            )
        },
        bottomBar = {
            AdminBottomNav(
                currentUser = currentUser,
                activeTab = activeTab,
                onSelectTab = viewModel::selectTab,
                onOpenMoreMenu = { viewModel.toggleMoreMenu(true) },
                onOpenNewAppointment = { viewModel.openCreateAppointment() },
                todayAppointmentsCount = todayCount,
                unreadMessagesCount = unreadCount
            )
        }
    ) { innerPadding ->
        Box(
            Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (activeTab) {
                AdminNavTab.DASHBOARD -> DashboardScreen(
                    appointments = appointments,
                    messages = messages,
                    onOpenNewAppointment = { viewModel.openCreateAppointment() },
                    onNavigateToTab = viewModel::selectTab,
                    onEditAppointment = { appointmentToEdit = it },
                    onUpdateStatus = viewModel::updateAppointmentStatus,
                    onViewPatient = { patientFullName ->
                        val found = patients.find { it.fullName.equals(patientFullName, ignoreCase = true) }
                            ?: PatientEntity(
                                id = "pat_${System.currentTimeMillis()}",
                                nombre = patientFullName.split(" ").firstOrNull() ?: patientFullName,
                                apellido = patientFullName.split(" ").drop(1).joinToString(" ")
                            )
                        patientToView = found
                    }
                )
                AdminNavTab.CITAS -> AppointmentsScreen(
                    appointments = appointments,
                    searchQuery = searchQuery,
                    onSearchChange = viewModel::setAppointmentSearchQuery,
                    dateFilter = dateFilter,
                    onDateFilterChange = viewModel::setAppointmentDateFilter,
                    statusFilter = statusFilter,
                    onStatusFilterChange = viewModel::setAppointmentStatusFilter,
                    onOpenNewAppointment = { viewModel.openCreateAppointment() },
                    onEditAppointment = { appointmentToEdit = it },
                    onUpdateStatus = viewModel::updateAppointmentStatus,
                    onDeleteAppointment = viewModel::deleteAppointment,
                    onViewPatient = { patientFullName ->
                        val found = patients.find { it.fullName.equals(patientFullName, ignoreCase = true) }
                            ?: PatientEntity(
                                id = "pat_${System.currentTimeMillis()}",
                                nombre = patientFullName.split(" ").firstOrNull() ?: patientFullName,
                                apellido = patientFullName.split(" ").drop(1).joinToString(" ")
                            )
                        patientToView = found
                    }
                )
                AdminNavTab.PACIENTES -> PatientsScreen(
                    patients = patients,
                    appointments = appointments,
                    searchQuery = patientSearch,
                    onSearchChange = viewModel::setPatientSearchQuery,
                    onViewPatient = { patientToView = it },
                    onAddPatient = { isAddPatientOpen = true },
                    onEditPatient = { patientToEdit = it },
                    onDeletePatient = { patientToDelete = it },
                    onExportExcel = { viewModel.openExcelExportDialog() }
                )
                AdminNavTab.STAFF -> StaffScreen(appointments) { viewModel.openCreateAppointment(it) }
                AdminNavTab.SERVICIOS -> ServicesScreen { viewModel.openCreateAppointment() }
                AdminNavTab.MENSAJES -> MessagesScreen(messages, viewModel::updateMessageStatus, viewModel::deleteMessage)
                AdminNavTab.CONFIGURACION -> SettingsScreen(
                    currentUser = currentUser,
                    isDarkMode = isDarkMode,
                    onToggleDarkMode = viewModel::toggleDarkMode,
                    onLogout = viewModel::logout,
                    onOpenExcelExport = { viewModel.openExcelExportDialog() },
                    onResetDemoData = viewModel::resetDemoData,
                    onClearAllData = viewModel::clearAllData
                )
            }
        }
    }

    // Modal Crear Cita
    if (createOpen) {
        CreateAppointmentDialog(
            defaultSpecialist = defaultSpecialist,
            onDismiss = viewModel::closeCreateAppointment,
            onConfirm = { nombre, apellido, telefono, email, serviceId, serviceTitle, specialistName, fecha, hora, amount, motivo, primeraVisita, notes ->
                viewModel.createAppointment(nombre, apellido, telefono, email, serviceId, serviceTitle, specialistName, fecha, hora, amount, motivo, primeraVisita, notes)
            }
        )
    }

    // Modal Exportar a Excel
    if (isExcelExportOpen) {
        ExcelExportDialog(
            appointments = appointments,
            patients = patients,
            onDismiss = { viewModel.closeExcelExportDialog() },
            onExport = { onSuccess, onError ->
                viewModel.exportDatabaseToExcel(
                    context = context,
                    onSuccess = onSuccess,
                    onError = onError
                )
            }
        )
    }

    // Modal Agregar Paciente
    if (isAddPatientOpen) {
        AddEditPatientDialog(
            initialPatient = null,
            onDismiss = { isAddPatientOpen = false },
            onSavePatient = { newPatient ->
                viewModel.addPatient(newPatient)
                isAddPatientOpen = false
            }
        )
    }

    // Modal Editar Paciente
    patientToEdit?.let { patient ->
        AddEditPatientDialog(
            initialPatient = patient,
            onDismiss = { patientToEdit = null },
            onSavePatient = { updatedPatient ->
                viewModel.updatePatient(updatedPatient)
                patientToEdit = null
                if (patientToView?.id == updatedPatient.id) {
                    patientToView = updatedPatient
                }
            }
        )
    }

    // Modal Confirmar Eliminar Paciente
    patientToDelete?.let { patient ->
        DeletePatientDialog(
            patient = patient,
            onDismiss = { patientToDelete = null },
            onConfirmDelete = {
                viewModel.deletePatient(patient.id)
                patientToDelete = null
                if (patientToView?.id == patient.id) {
                    patientToView = null
                }
            }
        )
    }

    // Modal Editar Cita
    appointmentToEdit?.let { appointment ->
        AlertDialog(
            onDismissRequest = { appointmentToEdit = null },
            title = { Text("Actualizar Cita • ${appointment.code}") },
            text = { Text("${appointment.nombre} ${appointment.apellido}\nServicio: ${appointment.serviceTitle}\nEstado actual: ${appointment.status.uppercase()}") },
            confirmButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton(onClick = { viewModel.updateAppointmentStatus(appointment.id, "confirmada"); appointmentToEdit = null }) { Text("Confirmar") }
                    TextButton(onClick = { viewModel.updateAppointmentStatus(appointment.id, "completada"); appointmentToEdit = null }) { Text("Completar") }
                    TextButton(onClick = { viewModel.updateAppointmentStatus(appointment.id, "cancelada"); appointmentToEdit = null }) { Text("Cancelar") }
                }
            },
            dismissButton = { TextButton(onClick = { appointmentToEdit = null }) { Text("Cerrar") } }
        )
    }

    // Modal Ficha Detallada del Paciente & PDFs
    patientToView?.let { currentPatient ->
        val updatedPatient = patients.find { it.id == currentPatient.id } ?: currentPatient
        PatientDetailDialog(
            patient = updatedPatient,
            appointments = appointments,
            onDismiss = { patientToView = null },
            onEditPatient = {
                patientToEdit = updatedPatient
            },
            onDeletePatient = {
                patientToDelete = updatedPatient
            },
            onOpenNewAppointment = {
                patientToView = null
                viewModel.openCreateAppointment()
            },
            onAddDocument = { newDoc ->
                viewModel.addDocumentToPatient(updatedPatient.id, newDoc)
            },
            onDeleteDocument = { docId ->
                viewModel.deleteDocumentFromPatient(updatedPatient.id, docId)
            }
        )
    }

    // Modal Notificaciones
    if (notificationsOpen) {
        AlertDialog(
            onDismissRequest = { notificationsOpen = false },
            title = { Text("Notificaciones Clínicas") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    notifications.take(5).forEach { notification ->
                        Text(notification.title, style = MaterialTheme.typography.titleSmall)
                        Text(notification.message, style = MaterialTheme.typography.bodySmall)
                    }
                }
            },
            confirmButton = { TextButton(onClick = { notificationsOpen = false }) { Text("Cerrar") } }
        )
    }

    // Menu inferior Más Opciones
    if (moreMenuOpen) {
        ModalBottomSheet(onDismissRequest = { viewModel.toggleMoreMenu(false) }) {
            Column(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("Módulos de Gestión", style = MaterialTheme.typography.titleLarge)
                
                val menuItems = remember(currentUser) {
                    if (currentUser?.isSuperAdmin == true) {
                        listOf(
                            AdminNavTab.STAFF to "Especialistas",
                            AdminNavTab.SERVICIOS to "Servicios y Tarifas",
                            AdminNavTab.MENSAJES to "Mensajes y Leads",
                            AdminNavTab.CONFIGURACION to "Configuración & Excel"
                        )
                    } else {
                        listOf(
                            AdminNavTab.CONFIGURACION to "Configuración de Perfil"
                        )
                    }
                }

                menuItems.forEach { (tab, label) ->
                    ListItem(
                        headlineContent = { Text(label) },
                        leadingContent = { Icon(Icons.Filled.ChevronRight, contentDescription = null) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.selectTab(tab)
                                viewModel.toggleMoreMenu(false)
                            }
                    )
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}
