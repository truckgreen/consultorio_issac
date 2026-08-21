package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.AppointmentStatus
import com.example.ui.components.EmptyStateCard
import com.example.ui.components.MetricStatCard
import com.example.ui.components.PatientAvatar
import com.example.ui.components.PatientQuickContactRow
import com.example.ui.components.StatusBadge
import com.example.ui.viewmodel.ConsultorioViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun DashboardScreen(
    viewModel: ConsultorioViewModel,
    onNavigateToCalendar: () -> Unit,
    onNavigateToAppointments: () -> Unit,
    onNavigateToPatients: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onPatientClick: (Long) -> Unit,
    onOpenCreateAppointment: () -> Unit,
    onOpenCreatePatient: () -> Unit,
    onOpenWebIntegration: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val todayAppointments by viewModel.todayAppointments.collectAsStateWithLifecycle()
    val totalPatients by viewModel.totalPatientsCount.collectAsStateWithLifecycle()
    val unreadAlertsCount by viewModel.unreadReminderCount.collectAsStateWithLifecycle()
    val dayAvailability by viewModel.dayAvailability.collectAsStateWithLifecycle()

    val attendedCount = todayAppointments.count { it.status == AppointmentStatus.ATENDIDO }
    val confirmedCount = todayAppointments.count { it.status == AppointmentStatus.CONFIRMADO }
    val pendingCount = todayAppointments.count { it.status == AppointmentStatus.PENDIENTE }

    val fullDateStr = SimpleDateFormat("EEEE, d 'de' MMMM", Locale("es", "ES")).format(Date())
        .replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale("es", "ES")) else it.toString() }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Medical Banner Header
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primary,
                                    MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                                )
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Equilibra",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                                Text(
                                    text = "Fisioterapia & Rehabilitación Integral",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.85f)
                                )
                            }

                            // Notification alert pill
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (unreadAlertsCount > 0) Color(0xFFFF5252) else MaterialTheme.colorScheme.surface.copy(alpha = 0.2f),
                                modifier = Modifier
                                    .clickable { onNavigateToNotifications() }
                                    .testTag("admin_alerts_badge")
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Notifications,
                                        contentDescription = "Alertas",
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = "$unreadAlertsCount Alertas",
                                        color = Color.White,
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = fullDateStr,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onPrimary
                        )

                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilledTonalButton(
                                onClick = onOpenCreateAppointment,
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = MaterialTheme.colorScheme.surface,
                                    contentColor = MaterialTheme.colorScheme.primary
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("quick_new_appointment_btn")
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Nuevo Turno", fontWeight = FontWeight.Bold)
                            }

                            FilledTonalButton(
                                onClick = onOpenCreatePatient,
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                                    contentColor = MaterialTheme.colorScheme.primary
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("quick_new_patient_btn")
                            ) {
                                Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Nuevo Paciente", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // Metrics Grid (2x2)
        item {
            Text(
                text = "Resumen del Día",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricStatCard(
                        title = "Turnos Hoy",
                        value = "${todayAppointments.size}",
                        subtitle = "$confirmedCount confirmados",
                        icon = Icons.Default.EventNote,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("stat_today_appointments"),
                        onClick = onNavigateToAppointments
                    )
                    MetricStatCard(
                        title = "Atendidos",
                        value = "$attendedCount",
                        subtitle = "$pendingCount pendientes",
                        icon = Icons.Default.CheckCircle,
                        iconColor = Color(0xFF2E7D32),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("stat_attended_patients"),
                        onClick = onNavigateToAppointments
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricStatCard(
                        title = "Ocupación",
                        value = "${dayAvailability.occupancyPercentage}%",
                        subtitle = "${dayAvailability.availableSlots} cupos libres",
                        icon = Icons.Default.CalendarMonth,
                        iconColor = Color(0xFF0288D1),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("stat_occupancy"),
                        onClick = onNavigateToCalendar
                    )
                    MetricStatCard(
                        title = "Pacientes",
                        value = "$totalPatients",
                        subtitle = "Fichas clínicas",
                        icon = Icons.Default.Group,
                        iconColor = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("stat_total_patients"),
                        onClick = onNavigateToPatients
                    )
                }
            }
        }

        // Admin Reminder Banner
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToNotifications() }
                    .testTag("admin_reminder_banner")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Alarm,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Recordatorios Automáticos para Admins",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onTertiaryContainer
                            )
                            Text(
                                text = "Notificaciones automáticas de turnos y confirmación de pacientes.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onTertiaryContainer.copy(alpha = 0.8f)
                            )
                        }
                    }

                    FilledTonalButton(
                        onClick = {
                            viewModel.triggerTestAdminNotification(
                                title = "Alerta Admin: Equilibra Fisioterapia",
                                message = "Recordatorio automático: Consultorio operativo con turnos activos.",
                                patientName = "Sistema Equilibra"
                            )
                        },
                        modifier = Modifier.testTag("test_admin_alert_btn")
                    ) {
                        Text("Probar Alerta", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }

        // Web Integration & Sync Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenWebIntegration() }
                    .testTag("web_integration_banner")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(42.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Language,
                                    contentDescription = "Conexión Web",
                                    tint = MaterialTheme.colorScheme.onSecondary,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }
                        Column {
                            Text(
                                text = "Servidor Web en Vivo (Render)",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSecondaryContainer
                            )
                            Text(
                                text = "https://equilibra-sf34.onrender.com",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }

                    OutlinedButton(
                        onClick = onOpenWebIntegration,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.testTag("btn_open_web_integration")
                    ) {
                        Text("Configurar", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }

        // Today's Appointments Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Próximos Turnos de Hoy",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Ver todos (${todayAppointments.size})",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier
                        .clickable { onNavigateToAppointments() }
                        .testTag("view_all_appointments_btn")
                )
            }
        }

        if (todayAppointments.isEmpty()) {
            item {
                EmptyStateCard(
                    title = "Sin turnos para hoy",
                    subtitle = "No hay pacientes programados para el día de hoy.",
                    icon = Icons.Default.CalendarMonth
                )
            }
        } else {
            items(todayAppointments.take(5)) { appointment ->
                DashboardAppointmentCard(
                    appointment = appointment,
                    onStatusChange = { newStatus ->
                        viewModel.updateAppointmentStatus(appointment.id, newStatus)
                    },
                    onPatientClick = { onPatientClick(appointment.patientId) }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun DashboardAppointmentCard(
    appointment: Appointment,
    onStatusChange: (AppointmentStatus) -> Unit,
    onPatientClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    ElevatedCard(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = modifier
            .fillMaxWidth()
            .testTag("appointment_item_${appointment.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(
                            text = appointment.time,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }

                    Column {
                        Text(
                            text = appointment.patientName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.clickable { onPatientClick() }
                        )
                        Text(
                            text = "${appointment.specialty} • ${appointment.doctorName}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                StatusBadge(status = appointment.status)
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "Motivo: ${appointment.reason}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Patient Quick Contact (WhatsApp / Call)
                PatientQuickContactRow(
                    patientPhone = appointment.patientPhone,
                    patientEmail = "",
                    patientName = appointment.patientName,
                    appointmentDate = appointment.date,
                    appointmentTime = appointment.time
                )

                // Quick Status Buttons
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (appointment.status == AppointmentStatus.PENDIENTE) {
                        FilledTonalButton(
                            onClick = { onStatusChange(AppointmentStatus.CONFIRMADO) },
                            modifier = Modifier.testTag("confirm_status_btn_${appointment.id}")
                        ) {
                            Text("Confirmar", style = MaterialTheme.typography.labelSmall)
                        }
                    } else if (appointment.status == AppointmentStatus.CONFIRMADO) {
                        Button(
                            onClick = { onStatusChange(AppointmentStatus.ATENDIDO) },
                            modifier = Modifier.testTag("attend_status_btn_${appointment.id}")
                        ) {
                            Text("Atender", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
        }
    }
}
