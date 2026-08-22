package com.example.equilibra.ui.admin

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.ui.theme.AmberPrimary
import com.example.equilibra.ui.theme.EmeraldSuccess
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppointmentsScreen(
    appointments: List<AppointmentEntity>,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    dateFilter: String,
    onDateFilterChange: (String) -> Unit,
    statusFilter: String,
    onStatusFilterChange: (String) -> Unit,
    onOpenNewAppointment: () -> Unit,
    onEditAppointment: (AppointmentEntity) -> Unit,
    onUpdateStatus: (String, String) -> Unit,
    onDeleteAppointment: (String) -> Unit,
    onViewPatient: (String) -> Unit
) {
    val context = LocalContext.current
    val today = remember { LocalDate.now() }
    val formatter = remember { DateTimeFormatter.ISO_LOCAL_DATE }
    val todayStr = remember { today.format(formatter) }
    val tomorrowStr = remember { today.plusDays(1).format(formatter) }
    val endOfWeekStr = remember { today.plusDays(7).format(formatter) }

    val filteredAppointments = remember(appointments, searchQuery, dateFilter, statusFilter) {
        appointments.filter { app ->
            // Date filter
            val matchesDate = when (dateFilter) {
                "HOY" -> app.fecha == todayStr
                "MANANA" -> app.fecha == tomorrowStr
                "SEMANA" -> app.fecha >= todayStr && app.fecha <= endOfWeekStr
                else -> true
            }

            // Status filter
            val matchesStatus = when (statusFilter) {
                "TODOS" -> true
                else -> app.status.equals(statusFilter, ignoreCase = true)
            }

            // Search query
            val matchesSearch = if (searchQuery.isBlank()) true else {
                val q = searchQuery.trim().lowercase()
                app.nombre.lowercase().contains(q) ||
                        app.apellido.lowercase().contains(q) ||
                        app.code.lowercase().contains(q) ||
                        app.specialistName.lowercase().contains(q) ||
                        app.serviceTitle.lowercase().contains(q) ||
                        app.telefono.contains(q)
            }

            matchesDate && matchesStatus && matchesSearch
        }
    }

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Title and Add button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Agenda & Citas (${filteredAppointments.size})",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Control de turnos y pacientes",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Button(
                        onClick = onOpenNewAppointment,
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Add,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Nueva Cita", fontWeight = FontWeight.Bold)
                    }
                }

                // Search Box
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchChange,
                    placeholder = { Text("Buscar por paciente, código, teléfono...") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Filled.Search,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotBlank()) {
                            IconButton(onClick = { onSearchChange("") }) {
                                Icon(Icons.Filled.Close, contentDescription = "Limpiar")
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("appointments_search_field")
                )

                // Date Filter Chips
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        FilterChip(
                            selected = dateFilter == "HOY",
                            onClick = { onDateFilterChange("HOY") },
                            label = { Text("Hoy", fontWeight = FontWeight.Bold) },
                            leadingIcon = {
                                if (dateFilter == "HOY") Icon(Icons.Filled.Check, null, modifier = Modifier.size(16.dp))
                            }
                        )
                    }
                    item {
                        FilterChip(
                            selected = dateFilter == "MANANA",
                            onClick = { onDateFilterChange("MANANA") },
                            label = { Text("Mañana") },
                            leadingIcon = {
                                if (dateFilter == "MANANA") Icon(Icons.Filled.Check, null, modifier = Modifier.size(16.dp))
                            }
                        )
                    }
                    item {
                        FilterChip(
                            selected = dateFilter == "SEMANA",
                            onClick = { onDateFilterChange("SEMANA") },
                            label = { Text("Esta Semana") },
                            leadingIcon = {
                                if (dateFilter == "SEMANA") Icon(Icons.Filled.Check, null, modifier = Modifier.size(16.dp))
                            }
                        )
                    }
                    item {
                        FilterChip(
                            selected = dateFilter == "TODOS",
                            onClick = { onDateFilterChange("TODOS") },
                            label = { Text("Todas") },
                            leadingIcon = {
                                if (dateFilter == "TODOS") Icon(Icons.Filled.Check, null, modifier = Modifier.size(16.dp))
                            }
                        )
                    }
                }

                // Status Filter Chips
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        AssistChip(
                            onClick = { onStatusFilterChange("TODOS") },
                            label = { Text("Todos Estados") },
                            colors = if (statusFilter == "TODOS") AssistChipDefaults.assistChipColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer
                            ) else AssistChipDefaults.assistChipColors()
                        )
                    }
                    item {
                        AssistChip(
                            onClick = { onStatusFilterChange("confirmada") },
                            label = { Text("Confirmadas") },
                            colors = if (statusFilter == "confirmada") AssistChipDefaults.assistChipColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer
                            ) else AssistChipDefaults.assistChipColors()
                        )
                    }
                    item {
                        AssistChip(
                            onClick = { onStatusFilterChange("en_curso") },
                            label = { Text("En Curso") },
                            colors = if (statusFilter == "en_curso") AssistChipDefaults.assistChipColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer
                            ) else AssistChipDefaults.assistChipColors()
                        )
                    }
                    item {
                        AssistChip(
                            onClick = { onStatusFilterChange("completada") },
                            label = { Text("Completadas") },
                            colors = if (statusFilter == "completada") AssistChipDefaults.assistChipColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer
                            ) else AssistChipDefaults.assistChipColors()
                        )
                    }
                    item {
                        AssistChip(
                            onClick = { onStatusFilterChange("cancelada") },
                            label = { Text("Canceladas") },
                            colors = if (statusFilter == "cancelada") AssistChipDefaults.assistChipColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer
                            ) else AssistChipDefaults.assistChipColors()
                        )
                    }
                }
            }
        },
        modifier = Modifier.testTag("admin_appointments_screen")
    ) { innerPadding ->
        if (filteredAppointments.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.EventBusy,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(48.dp)
                    )
                    Text(
                        text = "No se encontraron citas con los filtros actuales",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Button(onClick = onOpenNewAppointment) {
                        Text("Agendar Nueva Cita")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredAppointments, key = { it.id }) { app ->
                    AppointmentDetailCard(
                        appointment = app,
                        onEdit = { onEditAppointment(app) },
                        onUpdateStatus = { newStatus -> onUpdateStatus(app.id, newStatus) },
                        onDelete = { onDeleteAppointment(app.id) },
                        onViewPatient = { onViewPatient("${app.nombre} ${app.apellido}") }
                    )
                }
            }
        }
    }
}

@Composable
private fun AppointmentDetailCard(
    appointment: AppointmentEntity,
    onEdit: () -> Unit,
    onUpdateStatus: (String) -> Unit,
    onDelete: () -> Unit,
    onViewPatient: () -> Unit
) {
    val context = LocalContext.current
    var showStatusMenu by remember { mutableStateOf(false) }

    val statusColor = when (appointment.status) {
        "en_curso" -> Color(0xFF3B82F6)
        "completada" -> EmeraldSuccess
        "cancelada" -> Color(0xFFEF4444)
        else -> AmberPrimary
    }

    val statusLabel = when (appointment.status) {
        "en_curso" -> "En Curso"
        "completada" -> "Completada"
        "cancelada" -> "Cancelada"
        else -> "Confirmada"
    }

    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header: Date, Time, Code & Status badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.primaryContainer)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${appointment.fecha} • ${appointment.hora}",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }

                    Text(
                        text = appointment.code,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Status Badge with Click to change
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(statusColor.copy(alpha = 0.15f))
                        .clickable { showStatusMenu = true }
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = statusLabel,
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = statusColor
                        )
                        Icon(
                            imageVector = Icons.Filled.ArrowDropDown,
                            contentDescription = null,
                            tint = statusColor,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    DropdownMenu(
                        expanded = showStatusMenu,
                        onDismissRequest = { showStatusMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Confirmada") },
                            onClick = {
                                onUpdateStatus("confirmada")
                                showStatusMenu = false
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("En Curso") },
                            onClick = {
                                onUpdateStatus("en_curso")
                                showStatusMenu = false
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Completada") },
                            onClick = {
                                onUpdateStatus("completada")
                                showStatusMenu = false
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Cancelada") },
                            onClick = {
                                onUpdateStatus("cancelada")
                                showStatusMenu = false
                            }
                        )
                    }
                }
            }

            // Patient Info & Price
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onViewPatient() }
                ) {
                    Text(
                        text = "${appointment.nombre} ${appointment.apellido}",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "${appointment.serviceTitle} • ${appointment.specialistName}",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Tel: ${appointment.telefono}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$${appointment.amount.toInt()}",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    if (appointment.primeraVisita) {
                        Text(
                            text = "1ra Visita",
                            style = MaterialTheme.typography.labelSmall,
                            color = EmeraldSuccess
                        )
                    }
                }
            }

            if (appointment.motivoConsulta.isNotBlank()) {
                Text(
                    text = "Motivo: ${appointment.motivoConsulta}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (appointment.notes.isNotBlank()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(8.dp)
                ) {
                    Text(
                        text = "Notas: ${appointment.notes}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Actions Strip
            Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Call & WhatsApp
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilledTonalIconButton(
                        onClick = {
                            val cleanPhone = appointment.telefono.replace(Regex("[^0-9+]"), "")
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$cleanPhone"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Call,
                            contentDescription = "Llamar",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    FilledTonalIconButton(
                        onClick = {
                            val cleanPhone = appointment.telefono.replace(Regex("[^0-9]"), "")
                            val intent = Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("https://wa.me/$cleanPhone?text=Hola%20${appointment.nombre},%20te%20escribimos%20de%20EQUILIBRA%20respecto%20a%20tu%20cita%20del%20${appointment.fecha}.")
                            )
                            context.startActivity(intent)
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Chat,
                            contentDescription = "WhatsApp",
                            tint = EmeraldSuccess,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                // Edit & Delete
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                        onClick = onEdit,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Edit,
                            contentDescription = "Editar",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Delete,
                            contentDescription = "Eliminar",
                            tint = Color(0xFFEF4444),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
