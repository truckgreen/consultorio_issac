package com.example.ui.screens

import android.os.Build
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
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ClearAll
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.AdminReminder
import com.example.data.local.entity.ReminderType
import com.example.ui.components.EmptyStateCard
import com.example.ui.viewmodel.ConsultorioViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun AdminNotificationsScreen(
    viewModel: ConsultorioViewModel,
    onPatientClick: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val reminders by viewModel.allReminders.collectAsStateWithLifecycle()
    val unreadCount by viewModel.unreadReminderCount.collectAsStateWithLifecycle()

    val timeFormat = SimpleDateFormat("dd/MM HH:mm", Locale.getDefault())

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Hero Card: Automatic Admin Notification Engine
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.NotificationsActive,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onPrimary,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Recordatorios de Administrador",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer
                                )
                                Text(
                                    text = "$unreadCount sin leer • Alertas automáticas de turnos",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer.copy(alpha = 0.8f)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "El sistema envía alertas en segundo plano para avisarte de próximos pacientes, confirmaciones pendientes y cambios en la disponibilidad.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onTertiaryContainer
                    )

                    Spacer(modifier = Modifier.height(14.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                viewModel.triggerTestAdminNotification(
                                    title = "🔔 Sesión Próxima: Lic. Isaac Rodríguez",
                                    message = "Paciente Carlos Mendoza tiene sesión a las 09:00 hs para Rehabilitación Funcional.",
                                    patientName = "Carlos Mendoza"
                                )
                            },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("btn_trigger_test_notification")
                        ) {
                            Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Enviar Alerta de Prueba", style = MaterialTheme.typography.labelMedium)
                        }

                        if (unreadCount > 0) {
                            OutlinedButton(
                                onClick = { viewModel.markAllRemindersAsRead() },
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.testTag("btn_mark_all_read")
                            ) {
                                Icon(Icons.Default.DoneAll, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Leídos", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                }
            }
        }

        // Section Title & Clear
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Bandeja de Recordatorios (${reminders.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        if (reminders.isEmpty()) {
            item {
                EmptyStateCard(
                    title = "Bandeja vacía",
                    subtitle = "No hay recordatorios pendientes. Los nuevos turnos generarán alertas automáticas.",
                    icon = Icons.Default.Notifications
                )
            }
        } else {
            items(reminders) { reminder ->
                AdminReminderCard(
                    reminder = reminder,
                    timeFormatted = try {
                        timeFormat.format(Date(reminder.scheduledEpochMillis))
                    } catch (e: Exception) {
                        "${reminder.appointmentDate} ${reminder.appointmentTime}"
                    },
                    onMarkRead = { viewModel.markReminderAsRead(reminder.id) },
                    onDelete = { viewModel.deleteReminder(reminder) },
                    onPatientClick = {
                        reminder.patientId?.let { onPatientClick(it) }
                    }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
fun AdminReminderCard(
    reminder: AdminReminder,
    timeFormatted: String,
    onMarkRead: () -> Unit,
    onDelete: () -> Unit,
    onPatientClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val (typeBg, typeColor) = when (reminder.type) {
        ReminderType.TURNO_PROXIMO -> Color(0xFFE0F7FA) to Color(0xFF006064)
        ReminderType.CONFIRMACION_PENDIENTE -> Color(0xFFFFF3E0) to Color(0xFFE65100)
        ReminderType.ALERTA_DISPONIBILIDAD -> Color(0xFFEDE7F6) to Color(0xFF4A148C)
        ReminderType.SEGUIMIENTO_PACIENTE -> Color(0xFFE8F5E9) to Color(0xFF1B5E20)
    }

    ElevatedCard(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = if (reminder.isRead) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f)
        ),
        modifier = modifier
            .fillMaxWidth()
            .testTag("admin_reminder_card_${reminder.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = typeBg,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = reminder.type.label,
                        color = typeColor,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "${reminder.appointmentDate} ${reminder.appointmentTime}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.outline
                    )

                    if (!reminder.isRead) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary)
                        )
                    }

                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(32.dp).testTag("delete_reminder_btn_${reminder.id}")
                    ) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Eliminar",
                            tint = MaterialTheme.colorScheme.outline,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = reminder.title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = reminder.message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (reminder.patientName.isNotBlank()) {
                    Text(
                        text = "Paciente: ${reminder.patientName}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.clickable { onPatientClick() }
                    )
                } else {
                    Spacer(modifier = Modifier.width(1.dp))
                }

                if (!reminder.isRead) {
                    FilledTonalButton(
                        onClick = onMarkRead,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("mark_read_btn_${reminder.id}")
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Marcar leído", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }
}
