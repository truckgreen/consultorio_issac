package com.example.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.AppointmentStatus
import com.example.ui.components.EmptyStateCard
import com.example.ui.components.PatientQuickContactRow
import com.example.ui.components.StatusBadge
import com.example.ui.viewmodel.ConsultorioViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun AppointmentsScreen(
    viewModel: ConsultorioViewModel,
    onPatientClick: (Long) -> Unit,
    onOpenCreateAppointment: () -> Unit,
    modifier: Modifier = Modifier
) {
    val allAppointments by viewModel.allAppointments.collectAsStateWithLifecycle()
    val todayDateStr = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()) }

    var searchQuery by remember { mutableStateOf("") }
    var selectedFilterTab by remember { mutableStateOf("Todos") }

    val filterTabs = listOf("Todos", "Hoy", "Pendientes", "Confirmados", "Atendidos", "Cancelados")

    val filteredAppointments = allAppointments.filter { appointment ->
        val matchesSearch = searchQuery.isBlank() ||
                appointment.patientName.contains(searchQuery, ignoreCase = true) ||
                appointment.reason.contains(searchQuery, ignoreCase = true) ||
                appointment.doctorName.contains(searchQuery, ignoreCase = true)

        val matchesTab = when (selectedFilterTab) {
            "Hoy" -> appointment.date == todayDateStr
            "Pendientes" -> appointment.status == AppointmentStatus.PENDIENTE
            "Confirmados" -> appointment.status == AppointmentStatus.CONFIRMADO
            "Atendidos" -> appointment.status == AppointmentStatus.ATENDIDO
            "Cancelados" -> appointment.status == AppointmentStatus.CANCELADO
            else -> true
        }

        matchesSearch && matchesTab
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Search Bar
        item {
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Buscar turno o paciente...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Limpiar")
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("appointment_search_field"),
                shape = RoundedCornerShape(14.dp),
                singleLine = true
            )
        }

        // Filter Tabs
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(filterTabs) { tab ->
                    FilterChip(
                        selected = selectedFilterTab == tab,
                        onClick = { selectedFilterTab = tab },
                        label = { Text(tab) },
                        modifier = Modifier.testTag("filter_tab_$tab")
                    )
                }
            }
        }

        // Header with count
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Listado de Turnos (${filteredAppointments.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                TextButton(
                    onClick = onOpenCreateAppointment,
                    modifier = Modifier.testTag("new_turno_header_btn")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Nuevo Turno")
                }
            }
        }

        if (filteredAppointments.isEmpty()) {
            item {
                EmptyStateCard(
                    title = "No se encontraron turnos",
                    subtitle = if (searchQuery.isNotBlank()) "Intenta con otro término de búsqueda." else "No hay turnos registrados en esta categoría.",
                    icon = Icons.Default.CalendarMonth
                )
            }
        } else {
            items(filteredAppointments) { appointment ->
                FullAppointmentCard(
                    appointment = appointment,
                    onStatusChange = { newStatus ->
                        viewModel.updateAppointmentStatus(appointment.id, newStatus)
                    },
                    onDelete = {
                        viewModel.deleteAppointment(appointment)
                    },
                    onPatientClick = { onPatientClick(appointment.patientId) }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
fun FullAppointmentCard(
    appointment: Appointment,
    onStatusChange: (AppointmentStatus) -> Unit,
    onDelete: () -> Unit,
    onPatientClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    ElevatedCard(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = modifier
            .fillMaxWidth()
            .testTag("full_appointment_card_${appointment.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Date & Time Banner + Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "${appointment.date} • ${appointment.time} hs",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }

                    if (appointment.isPaid) {
                        Surface(
                            color = Color(0xFFE8F5E9),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "Pagado ✓",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF2E7D32),
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                            )
                        }
                    }
                }

                StatusBadge(status = appointment.status)
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Patient Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = appointment.patientName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.clickable { onPatientClick() }
                    )
                    Text(
                        text = "${appointment.specialty} • ${appointment.doctorName}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.testTag("delete_appointment_btn_${appointment.id}")
                ) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Eliminar turno",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Motivo: ${appointment.reason}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )

            if (appointment.adminNotes.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Nota Admin: ${appointment.adminNotes}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Quick Actions: Contact Patient & Status Update
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                PatientQuickContactRow(
                    patientPhone = appointment.patientPhone,
                    patientEmail = "",
                    patientName = appointment.patientName,
                    appointmentDate = appointment.date,
                    appointmentTime = appointment.time
                )

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    when (appointment.status) {
                        AppointmentStatus.PENDIENTE -> {
                            FilledTonalButton(
                                onClick = { onStatusChange(AppointmentStatus.CONFIRMADO) },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.testTag("btn_confirm_${appointment.id}")
                            ) {
                                Text("Confirmar", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                        AppointmentStatus.CONFIRMADO -> {
                            Button(
                                onClick = { onStatusChange(AppointmentStatus.ATENDIDO) },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.testTag("btn_attend_${appointment.id}")
                            ) {
                                Text("Atender", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                        AppointmentStatus.ATENDIDO -> {
                            Surface(
                                color = Color(0xFFE8F5E9),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "Completado ✓",
                                    color = Color(0xFF2E7D32),
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                            }
                        }
                        else -> {}
                    }
                }
            }
        }
    }
}
