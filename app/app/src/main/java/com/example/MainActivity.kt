package com.example

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.Patient
import com.example.ui.components.CreateAppointmentDialog
import com.example.ui.components.CreateClinicalRecordDialog
import com.example.ui.components.CreatePatientDialog
import com.example.ui.components.WebIntegrationDialog
import com.example.ui.screens.AdminNotificationsScreen
import com.example.ui.screens.AppointmentsScreen
import com.example.ui.screens.CalendarAvailabilityScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.PatientDetailScreen
import com.example.ui.screens.PatientsScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.ConsultorioViewModel

enum class AppDestination(val title: String, val icon: ImageVector, val tag: String) {
    DASHBOARD("Inicio", Icons.Default.Dashboard, "nav_dashboard"),
    CALENDAR("Disponibilidad", Icons.Default.CalendarMonth, "nav_calendar"),
    APPOINTMENTS("Turnos", Icons.Default.EventNote, "nav_appointments"),
    PATIENTS("Pacientes", Icons.Default.Group, "nav_patients"),
    NOTIFICATIONS("Alertas", Icons.Default.Notifications, "nav_notifications")
}

class MainActivity : ComponentActivity() {

    private val viewModel: ConsultorioViewModel by viewModels {
        ConsultorioViewModel.Factory(application)
    }

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            // Notification permission handled
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Ask for notification permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        setContent {
            MyApplicationTheme {
                ConsultorioMainApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun ConsultorioMainApp(viewModel: ConsultorioViewModel) {
    var currentDestination by remember { mutableStateOf(AppDestination.DASHBOARD) }
    var inPatientDetailView by remember { mutableStateOf(false) }

    val allPatients by viewModel.patients.collectAsStateWithLifecycle()
    val unreadAlertsCount by viewModel.unreadReminderCount.collectAsStateWithLifecycle()
    val userMessage by viewModel.userMessage.collectAsStateWithLifecycle()
    val selectedDate by viewModel.selectedDate.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    // Dialog state holders
    var showCreateAppointmentDialog by remember { mutableStateOf(false) }
    var showCreatePatientDialog by remember { mutableStateOf(false) }
    var showClinicalRecordDialog by remember { mutableStateOf(false) }
    var showWebIntegrationDialog by remember { mutableStateOf(false) }

    var appointmentInitialTime by remember { mutableStateOf("09:00") }
    var appointmentInitialPatientId by remember { mutableStateOf<Long?>(null) }
    var editingPatient by remember { mutableStateOf<Patient?>(null) }
    var clinicalRecordTargetPatient by remember { mutableStateOf<Patient?>(null) }

    // Show Snackbars when ViewModel emits messages
    LaunchedEffect(userMessage) {
        userMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearUserMessage()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            if (!inPatientDetailView) {
                NavigationBar(
                    modifier = Modifier.testTag("main_navigation_bar")
                ) {
                    AppDestination.values().forEach { destination ->
                        val isSelected = currentDestination == destination
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = { currentDestination = destination },
                            icon = {
                                if (destination == AppDestination.NOTIFICATIONS && unreadAlertsCount > 0) {
                                    BadgedBox(
                                        badge = {
                                            Badge {
                                                Text("$unreadAlertsCount")
                                            }
                                        }
                                    ) {
                                        Icon(destination.icon, contentDescription = destination.title)
                                    }
                                } else {
                                    Icon(destination.icon, contentDescription = destination.title)
                                }
                            },
                            label = { Text(destination.title) },
                            modifier = Modifier.testTag(destination.tag)
                        )
                    }
                }
            }
        },
        floatingActionButton = {
            if (!inPatientDetailView) {
                when (currentDestination) {
                    AppDestination.DASHBOARD, AppDestination.APPOINTMENTS, AppDestination.CALENDAR -> {
                        FloatingActionButton(
                            onClick = {
                                appointmentInitialPatientId = null
                                appointmentInitialTime = "09:00"
                                showCreateAppointmentDialog = true
                            },
                            shape = RoundedCornerShape(16.dp),
                            containerColor = MaterialTheme.colorScheme.primaryContainer,
                            contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.testTag("fab_add_appointment")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Nuevo Turno")
                        }
                    }
                    AppDestination.PATIENTS -> {
                        FloatingActionButton(
                            onClick = {
                                editingPatient = null
                                showCreatePatientDialog = true
                            },
                            shape = RoundedCornerShape(16.dp),
                            containerColor = MaterialTheme.colorScheme.primaryContainer,
                            contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.testTag("fab_add_patient")
                        ) {
                            Icon(Icons.Default.PersonAdd, contentDescription = "Nuevo Paciente")
                        }
                    }
                    else -> {}
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (inPatientDetailView) {
                PatientDetailScreen(
                    viewModel = viewModel,
                    onBack = {
                        inPatientDetailView = false
                        viewModel.selectPatient(null)
                    },
                    onOpenEditPatient = { patient ->
                        editingPatient = patient
                        showCreatePatientDialog = true
                    },
                    onOpenNewAppointment = { patientId ->
                        appointmentInitialPatientId = patientId
                        appointmentInitialTime = "09:00"
                        showCreateAppointmentDialog = true
                    },
                    onOpenNewClinicalRecord = { patient ->
                        clinicalRecordTargetPatient = patient
                        showClinicalRecordDialog = true
                    }
                )
            } else {
                when (currentDestination) {
                    AppDestination.DASHBOARD -> {
                        DashboardScreen(
                            viewModel = viewModel,
                            onNavigateToCalendar = { currentDestination = AppDestination.CALENDAR },
                            onNavigateToAppointments = { currentDestination = AppDestination.APPOINTMENTS },
                            onNavigateToPatients = { currentDestination = AppDestination.PATIENTS },
                            onNavigateToNotifications = { currentDestination = AppDestination.NOTIFICATIONS },
                            onPatientClick = { patientId ->
                                viewModel.selectPatient(patientId)
                                inPatientDetailView = true
                            },
                            onOpenCreateAppointment = {
                                appointmentInitialPatientId = null
                                appointmentInitialTime = "09:00"
                                showCreateAppointmentDialog = true
                            },
                            onOpenCreatePatient = {
                                editingPatient = null
                                showCreatePatientDialog = true
                            },
                            onOpenWebIntegration = {
                                showWebIntegrationDialog = true
                            }
                        )
                    }
                    AppDestination.CALENDAR -> {
                        CalendarAvailabilityScreen(
                            viewModel = viewModel,
                            onPatientClick = { patientId ->
                                viewModel.selectPatient(patientId)
                                inPatientDetailView = true
                            },
                            onBookSlotClicked = { slotTime ->
                                appointmentInitialPatientId = null
                                appointmentInitialTime = slotTime
                                showCreateAppointmentDialog = true
                            }
                        )
                    }
                    AppDestination.APPOINTMENTS -> {
                        AppointmentsScreen(
                            viewModel = viewModel,
                            onPatientClick = { patientId ->
                                viewModel.selectPatient(patientId)
                                inPatientDetailView = true
                            },
                            onOpenCreateAppointment = {
                                appointmentInitialPatientId = null
                                appointmentInitialTime = "09:00"
                                showCreateAppointmentDialog = true
                            }
                        )
                    }
                    AppDestination.PATIENTS -> {
                        PatientsScreen(
                            viewModel = viewModel,
                            onPatientClick = { patientId ->
                                viewModel.selectPatient(patientId)
                                inPatientDetailView = true
                            },
                            onOpenCreatePatient = {
                                editingPatient = null
                                showCreatePatientDialog = true
                            },
                            onOpenCreateAppointmentForPatient = { patientId ->
                                appointmentInitialPatientId = patientId
                                appointmentInitialTime = "09:00"
                                showCreateAppointmentDialog = true
                            }
                        )
                    }
                    AppDestination.NOTIFICATIONS -> {
                        AdminNotificationsScreen(
                            viewModel = viewModel,
                            onPatientClick = { patientId ->
                                viewModel.selectPatient(patientId)
                                inPatientDetailView = true
                            }
                        )
                    }
                }
            }
        }
    }

    // --- Dialogs ---

    if (showCreateAppointmentDialog) {
        CreateAppointmentDialog(
            patients = allPatients,
            initialDate = selectedDate,
            initialTime = appointmentInitialTime,
            initialPatientId = appointmentInitialPatientId,
            onDismiss = { showCreateAppointmentDialog = false },
            onConfirm = { appointment ->
                viewModel.saveAppointment(appointment) {
                    showCreateAppointmentDialog = false
                }
            },
            onAddNewPatientRequested = {
                showCreateAppointmentDialog = false
                editingPatient = null
                showCreatePatientDialog = true
            }
        )
    }

    if (showCreatePatientDialog) {
        CreatePatientDialog(
            initialPatient = editingPatient,
            onDismiss = { showCreatePatientDialog = false },
            onConfirm = { patient ->
                viewModel.savePatient(patient) {
                    showCreatePatientDialog = false
                }
            }
        )
    }

    if (showClinicalRecordDialog && clinicalRecordTargetPatient != null) {
        CreateClinicalRecordDialog(
            patient = clinicalRecordTargetPatient!!,
            onDismiss = { showClinicalRecordDialog = false },
            onConfirm = { record ->
                viewModel.saveClinicalRecord(record) {
                    showClinicalRecordDialog = false
                }
            }
        )
    }

    if (showWebIntegrationDialog) {
        WebIntegrationDialog(
            onDismiss = { showWebIntegrationDialog = false }
        )
    }
}
