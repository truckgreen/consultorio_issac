package com.example.equilibra.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.equilibra.data.repository.EquilibraDataRepository
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateAppointmentDialog(
    defaultSpecialist: String? = null,
    onDismiss: () => Unit,
    onConfirm: (
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
    ) -> Unit
) {
    val services = remember { EquilibraDataRepository.SERVICES }
    val teamMembers = remember { EquilibraDataRepository.TEAM_MEMBERS }

    var nombre by remember { mutableStateOf("") }
    var apellido by remember { mutableStateOf("") }
    var telefono by remember { mutableStateOf("+58 414 ") }
    var email by remember { mutableStateOf("") }
    var motivo by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var primeraVisita by remember { mutableStateOf(false) }

    var selectedService by remember { mutableStateOf(services.first()) }
    var selectedSpecialist by remember {
        mutableStateOf(
            if (defaultSpecialist != null) {
                teamMembers.find { it.name.contains(defaultSpecialist, ignoreCase = true) } ?: teamMembers.first()
            } else teamMembers.first()
        )
    }

    val today = remember { LocalDate.now() }
    val formatter = remember { DateTimeFormatter.ISO_LOCAL_DATE }
    var selectedDate by remember { mutableStateOf(today.format(formatter)) }

    val times = listOf(
        "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
        "04:00 PM", "04:30 PM", "05:00 PM"
    )
    var selectedTime by remember { mutableStateOf("09:00 AM") }
    var customAmount by remember { mutableStateOf(selectedService.price.toString()) }

    var expandedServiceDropdown by remember { mutableStateOf(false) }
    var expandedSpecialistDropdown by remember { mutableStateOf(false) }

    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.90f)
                .testTag("dialog_create_appointment")
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.primaryContainer)
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.CalendarMonth,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "Agendar Nueva Cita",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Filled.Close,
                            contentDescription = "Cerrar",
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }

                // Body Form
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    if (errorMessage != null) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(
                                text = errorMessage ?: "",
                                color = Color(0xFFB91C1C),
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }

                    Text(
                        text = "Datos del Paciente",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = nombre,
                            onValueChange = { nombre = it },
                            label = { Text("Nombre *") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f)
                        )

                        OutlinedTextField(
                            value = apellido,
                            onValueChange = { apellido = it },
                            label = { Text("Apellido *") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = telefono,
                            onValueChange = { telefono = it },
                            label = { Text("Teléfono / WhatsApp *") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f)
                        )

                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("Email (Opcional)") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Checkbox(
                            checked = primeraVisita,
                            onCheckedChange = { primeraVisita = it }
                        )
                        Text(
                            text = "Es la primera consulta del paciente",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    Divider()

                    Text(
                        text = "Servicio y Especialista",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )

                    // Service Selector
                    ExposedDropdownMenuBox(
                        expanded = expandedServiceDropdown,
                        onExpandedChange = { expandedServiceDropdown = !expandedServiceDropdown }
                    ) {
                        OutlinedTextField(
                            value = "${selectedService.title} (${selectedService.priceFormatted})",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Servicio Clínico") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedServiceDropdown) },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = expandedServiceDropdown,
                            onDismissRequest = { expandedServiceDropdown = false }
                        ) {
                            services.forEach { srv ->
                                DropdownMenuItem(
                                    text = { Text("${srv.title} - ${srv.priceFormatted}") },
                                    onClick = {
                                        selectedService = srv
                                        customAmount = srv.price.toString()
                                        expandedServiceDropdown = false
                                    }
                                )
                            }
                        }
                    }

                    // Specialist Selector
                    ExposedDropdownMenuBox(
                        expanded = expandedSpecialistDropdown,
                        onExpandedChange = { expandedSpecialistDropdown = !expandedSpecialistDropdown }
                    ) {
                        OutlinedTextField(
                            value = "${selectedSpecialist.name} (${selectedSpecialist.role})",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Especialista Asignado") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedSpecialistDropdown) },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = expandedSpecialistDropdown,
                            onDismissRequest = { expandedSpecialistDropdown = false }
                        ) {
                            teamMembers.forEach { member ->
                                DropdownMenuItem(
                                    text = { Text("${member.name} • ${member.role}") },
                                    onClick = {
                                        selectedSpecialist = member
                                        expandedSpecialistDropdown = false
                                    }
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = customAmount,
                        onValueChange = { customAmount = it },
                        label = { Text("Monto a Cobrar ($ USD)") },
                        singleLine = true,
                        leadingIcon = { Text("$", fontWeight = FontWeight.Bold) },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Divider()

                    Text(
                        text = "Fecha y Hora del Turno",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )

                    // Quick Date Chips
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        item {
                            val dStr = today.format(formatter)
                            FilterChip(
                                selected = selectedDate == dStr,
                                onClick = { selectedDate = dStr },
                                label = { Text("Hoy (${today.dayOfMonth}/${today.monthValue})") }
                            )
                        }
                        item {
                            val dStr = today.plusDays(1).format(formatter)
                            FilterChip(
                                selected = selectedDate == dStr,
                                onClick = { selectedDate = dStr },
                                label = { Text("Mañana") }
                            )
                        }
                        item {
                            val dStr = today.plusDays(2).format(formatter)
                            FilterChip(
                                selected = selectedDate == dStr,
                                onClick = { selectedDate = dStr },
                                label = { Text("+2 Días") }
                            )
                        }
                        item {
                            val dStr = today.plusDays(3).format(formatter)
                            FilterChip(
                                selected = selectedDate == dStr,
                                onClick = { selectedDate = dStr },
                                label = { Text("+3 Días") }
                            )
                        }
                    }

                    // Time Chips
                    Text("Horarios Disponibles:", style = MaterialTheme.typography.labelMedium)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(times) { time ->
                            FilterChip(
                                selected = selectedTime == time,
                                onClick = { selectedTime = time },
                                label = { Text(time, fontSize = 11.sp) }
                            )
                        }
                    }

                    OutlinedTextField(
                        value = motivo,
                        onValueChange = { motivo = it },
                        label = { Text("Motivo de Consulta") },
                        placeholder = { Text("Ej. Dolor lumbar, evaluación de rodilla...") },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Notas Administrativas (Opcional)") },
                        placeholder = { Text("Ej. Traer resonancia magnética, pago en efectivo...") },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Footer Actions
                Surface(
                    tonalElevation = 6.dp,
                    color = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = onDismiss) {
                            Text("Cancelar")
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Button(
                            onClick = {
                                if (nombre.isBlank() || apellido.isBlank() || telefono.isBlank()) {
                                    errorMessage = "Por favor completa el nombre, apellido y teléfono."
                                    return@Button
                                }
                                val amountVal = customAmount.toDoubleOrNull() ?: selectedService.price.toDouble()
                                onConfirm(
                                    nombre,
                                    apellido,
                                    telefono,
                                    email,
                                    selectedService.id,
                                    selectedService.title,
                                    selectedSpecialist.name,
                                    selectedDate,
                                    selectedTime,
                                    amountVal,
                                    motivo,
                                    primeraVisita,
                                    notes
                                )
                            },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.testTag("btn_confirm_create_appointment")
                        ) {
                            Icon(Icons.Filled.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Guardar Cita", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
