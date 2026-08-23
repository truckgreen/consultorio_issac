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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.model.AdminNavTab
import com.example.equilibra.ui.admin.*
import com.example.equilibra.ui.theme.EquilibraTheme
import com.example.equilibra.ui.viewmodel.AdminViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: AdminViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val isDarkMode by viewModel.isDarkMode.collectAsStateWithLifecycle()
            EquilibraTheme(darkTheme = isDarkMode) {
                AdminMainScreen(viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminMainScreen(viewModel: AdminViewModel) {
    val activeTab by viewModel.activeTab.collectAsStateWithLifecycle()
    val isDarkMode by viewModel.isDarkMode.collectAsStateWithLifecycle()
    val appointments by viewModel.allAppointments.collectAsStateWithLifecycle()
    val messages by viewModel.messages.collectAsStateWithLifecycle()
    val notifications by viewModel.notifications.collectAsStateWithLifecycle()
    val searchQuery by viewModel.appointmentSearchQuery.collectAsStateWithLifecycle()
    val dateFilter by viewModel.appointmentDateFilter.collectAsStateWithLifecycle()
    val statusFilter by viewModel.appointmentStatusFilter.collectAsStateWithLifecycle()
    val patientSearch by viewModel.patientSearchQuery.collectAsStateWithLifecycle()
    val createOpen by viewModel.isCreateAppointmentOpen.collectAsStateWithLifecycle()
    val defaultSpecialist by viewModel.defaultSpecialistForNew.collectAsStateWithLifecycle()
    val moreMenuOpen by viewModel.isMoreMenuOpen.collectAsStateWithLifecycle()
    var appointmentToEdit by remember { mutableStateOf<AppointmentEntity?>(null) }
    var patientToView by remember { mutableStateOf<String?>(null) }
    var notificationsOpen by remember { mutableStateOf(false) }

    val today = java.time.LocalDate.now().toString()
    val todayCount = appointments.count { it.fecha == today }
    val unreadCount = messages.count { it.status == "NUEVO" }

    Scaffold(
        modifier = Modifier.fillMaxSize().testTag("admin_app"),
        topBar = {
            AdminTopBar(
                isDarkMode = isDarkMode,
                onToggleDarkMode = viewModel::toggleDarkMode,
                unreadNotificationsCount = notifications.count { !it.read },
                onOpenNotifications = { notificationsOpen = true },
                onOpenNewAppointment = { viewModel.openCreateAppointment() }
            )
        },
        bottomBar = {
            AdminBottomNav(
                activeTab = activeTab,
                onSelectTab = viewModel::selectTab,
                onOpenMoreMenu = { viewModel.toggleMoreMenu(true) },
                onOpenNewAppointment = { viewModel.openCreateAppointment() },
                todayAppointmentsCount = todayCount,
                unreadMessagesCount = unreadCount
            )
        }
    ) { innerPadding ->
        Box(Modifier.fillMaxSize().padding(innerPadding)) {
            when (activeTab) {
                AdminNavTab.DASHBOARD -> DashboardScreen(
                    appointments, messages,
                    { viewModel.openCreateAppointment() }, viewModel::selectTab,
                    { appointmentToEdit = it }, viewModel::updateAppointmentStatus,
                    { patientToView = it }
                )
                AdminNavTab.CITAS -> AppointmentsScreen(
                    appointments, searchQuery, viewModel::setAppointmentSearchQuery,
                    dateFilter, viewModel::setAppointmentDateFilter,
                    statusFilter, viewModel::setAppointmentStatusFilter,
                    { viewModel.openCreateAppointment() }, { appointmentToEdit = it },
                    viewModel::updateAppointmentStatus, viewModel::deleteAppointment,
                    { patientToView = it }
                )
                AdminNavTab.PACIENTES -> PatientsScreen(
                    appointments, patientSearch, viewModel::setPatientSearchQuery,
                    { patientToView = it }, { viewModel.openCreateAppointment() }
                )
                AdminNavTab.STAFF -> StaffScreen(appointments) { viewModel.openCreateAppointment(it) }
                AdminNavTab.SERVICIOS -> ServicesScreen { viewModel.openCreateAppointment() }
                AdminNavTab.MENSAJES -> MessagesScreen(messages, viewModel::updateMessageStatus, viewModel::deleteMessage)
                AdminNavTab.CONFIGURACION -> SettingsScreen(
                    isDarkMode, viewModel::toggleDarkMode, viewModel::resetDemoData, viewModel::clearAllData
                )
            }
        }
    }

    if (createOpen) {
        CreateAppointmentDialog(
            defaultSpecialist = defaultSpecialist,
            onDismiss = viewModel::closeCreateAppointment,
            onConfirm = { nombre, apellido, telefono, email, serviceId, serviceTitle, specialistName, fecha, hora, amount, motivo, primeraVisita, notes ->
                viewModel.createAppointment(nombre, apellido, telefono, email, serviceId, serviceTitle, specialistName, fecha, hora, amount, motivo, primeraVisita, notes)
            }
        )
    }

    appointmentToEdit?.let { appointment ->
        AlertDialog(
            onDismissRequest = { appointmentToEdit = null },
            title = { Text("Actualizar cita") },
            text = { Text("${appointment.nombre} ${appointment.apellido}\nEstado actual: ${appointment.status}") },
            confirmButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton(onClick = { viewModel.updateAppointmentStatus(appointment.id, "completada"); appointmentToEdit = null }) { Text("Completar") }
                    TextButton(onClick = { viewModel.updateAppointmentStatus(appointment.id, "cancelada"); appointmentToEdit = null }) { Text("Cancelar") }
                }
            },
            dismissButton = { TextButton(onClick = { appointmentToEdit = null }) { Text("Cerrar") } }
        )
    }

    patientToView?.let { patientFullName ->
        val patientApps = appointments.filter { "${it.nombre.trim()} ${it.apellido.trim()}" == patientFullName }
        val patientSummary = PatientSummary(
            fullName = patientFullName,
            nombre = patientApps.firstOrNull()?.nombre ?: patientFullName.split(" ").firstOrNull() ?: "",
            apellido = patientApps.firstOrNull()?.apellido ?: patientFullName.split(" ").getOrNull(1) ?: "",
            telefono = patientApps.firstOrNull()?.telefono ?: "+58 414-0000000",
            email = patientApps.firstOrNull()?.email ?: "paciente@equilibra.com",
            totalAppointments = patientApps.size,
            completedAppointments = patientApps.count { it.status == "completada" },
            totalSpent = patientApps.filter { it.status != "cancelada" }.sumOf { it.amount },
            lastVisitDate = patientApps.firstOrNull()?.fecha ?: "Hoy",
            appointments = patientApps
        )

        PatientDetailDialog(
            patientSummary = patientSummary,
            onDismiss = { patientToView = null },
            onOpenNewAppointment = {
                patientToView = null
                viewModel.openCreateAppointment()
            }
        )
    }

    if (notificationsOpen) {
        AlertDialog(
            onDismissRequest = { notificationsOpen = false },
            title = { Text("Notificaciones") },
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

    if (moreMenuOpen) {
        ModalBottomSheet(onDismissRequest = { viewModel.toggleMoreMenu(false) }) {
            Column(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("Módulos de gestión", style = MaterialTheme.typography.titleLarge)
                listOf(
                    AdminNavTab.STAFF to "Especialistas",
                    AdminNavTab.SERVICIOS to "Servicios y tarifas",
                    AdminNavTab.MENSAJES to "Mensajes y leads",
                    AdminNavTab.CONFIGURACION to "Configuración"
                ).forEach { (tab, label) ->
                    ListItem(
                        headlineContent = { Text(label) },
                        leadingContent = { Icon(Icons.Filled.ChevronRight, contentDescription = null) },
                        modifier = Modifier.fillMaxWidth().clickable {
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
