package com.example.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.AppointmentStatus
import com.example.data.local.entity.Patient
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateAppointmentDialog(
    patients: List<Patient>,
    initialDate: String,
    initialTime: String = "09:00",
    initialPatientId: Long? = null,
    onDismiss: () -> Unit,
    onConfirm: (Appointment) -> Unit,
    onAddNewPatientRequested: () -> Unit
) {
    var selectedPatient by remember {
        mutableStateOf(patients.find { it.id == initialPatientId } ?: patients.firstOrNull())
    }
    var patientDropdownExpanded by remember { mutableStateOf(false) }

    var date by remember { mutableStateOf(initialDate) }
    var time by remember { mutableStateOf(initialTime) }
    var specialty by remember { mutableStateOf("Fisioterapia y Rehabilitación") }
    var doctorName by remember { mutableStateOf("Lic. Isaac Rodríguez (Fisioterapeuta)") }
    var reason by remember { mutableStateOf("") }
    var costStr by remember { mutableStateOf("5000") }
    var isPaid by remember { mutableStateOf(false) }
    var adminNotes by remember { mutableStateOf("") }
    var reminderOffsetMinutes by remember { mutableIntStateOf(60) }

    val specialties = listOf(
        "Fisioterapia y Rehabilitación",
        "Kinesiología Deportiva",
        "Osteopatía & Terapia Manual",
        "Punción Seca & Neuromodulación",
        "Drenaje Linfático Manual",
        "Reeducación Postural (RPG)",
        "Suelo Pélvico",
        "Masoterapia Descontracturante",
        "Pilates Terapéutico",
        "Evaluación Inicial"
    )

    val doctors = listOf(
        "Lic. Isaac Rodríguez (Fisioterapeuta)",
        "Lic. Elena Morales (Kinesióloga)",
        "Lic. Martín Benítez (Osteópata)",
        "Lic. Sofía Navarro (Suelo Pélvico)"
    )

    val timeSlots = listOf(
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
        "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
        "18:00", "18:30", "19:00"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Agendar Nuevo Turno",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Patient Selection
                item {
                    Text(
                        text = "Seleccionar Paciente",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(4.dp))

                    if (patients.isEmpty()) {
                        Surface(
                            color = MaterialTheme.colorScheme.errorContainer,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    "No hay pacientes registrados aún.",
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Button(
                                    onClick = onAddNewPatientRequested,
                                    modifier = Modifier.testTag("create_patient_first_btn")
                                ) {
                                    Text("Crear Primer Paciente")
                                }
                            }
                        }
                    } else {
                        ExposedDropdownMenuBox(
                            expanded = patientDropdownExpanded,
                            onExpandedChange = { patientDropdownExpanded = !patientDropdownExpanded }
                        ) {
                            OutlinedTextField(
                                value = selectedPatient?.let { "${it.fullName} (DNI: ${it.dni})" } ?: "Seleccionar paciente...",
                                onValueChange = {},
                                readOnly = true,
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = patientDropdownExpanded) },
                                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                                modifier = Modifier
                                    .menuAnchor()
                                    .fillMaxWidth()
                                    .testTag("patient_selector_dropdown"),
                                shape = RoundedCornerShape(12.dp)
                            )
                            ExposedDropdownMenu(
                                expanded = patientDropdownExpanded,
                                onDismissRequest = { patientDropdownExpanded = false }
                            ) {
                                patients.forEach { patient ->
                                    DropdownMenuItem(
                                        text = {
                                            Column {
                                                Text(patient.fullName, fontWeight = FontWeight.SemiBold)
                                                Text(
                                                    "DNI: ${patient.dni} • Tel: ${patient.phone}",
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            }
                                        },
                                        onClick = {
                                            selectedPatient = patient
                                            patientDropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                }

                // Date & Time
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = date,
                            onValueChange = { date = it },
                            label = { Text("Fecha (YYYY-MM-DD)") },
                            leadingIcon = { Icon(Icons.Default.CalendarToday, contentDescription = null) },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("appointment_date_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = time,
                            onValueChange = { time = it },
                            label = { Text("Hora (HH:mm)") },
                            leadingIcon = { Icon(Icons.Default.AccessTime, contentDescription = null) },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("appointment_time_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                // Quick Time Slot Picker
                item {
                    Text(
                        text = "Horarios Rápidos",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        items(timeSlots) { slot ->
                            FilterChip(
                                selected = time == slot,
                                onClick = { time = slot },
                                label = { Text(slot) }
                            )
                        }
                    }
                }

                // Specialty & Doctor
                item {
                    Text(
                        text = "Especialidad & Profesional",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        items(specialties) { spec ->
                            FilterChip(
                                selected = specialty == spec,
                                onClick = { specialty = spec },
                                label = { Text(spec) }
                            )
                        }
                    }
                }

                item {
                    OutlinedTextField(
                        value = doctorName,
                        onValueChange = { doctorName = it },
                        label = { Text("Médico / Profesional a cargo") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("doctor_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Reason for consultation
                item {
                    OutlinedTextField(
                        value = reason,
                        onValueChange = { reason = it },
                        label = { Text("Motivo del Turno *") },
                        placeholder = { Text("Ej. Lumbalgia mecánica, rehabilitación post-quirúrgica, contractura cervical, descarga muscular") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("reason_input"),
                        shape = RoundedCornerShape(12.dp),
                        minLines = 2
                    )
                }

                // Admin Reminder Settings
                item {
                    Text(
                        text = "Recordatorio Automático para Admin",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf(
                            15 to "15 min",
                            30 to "30 min",
                            60 to "1 hora",
                            120 to "2 horas",
                            1440 to "1 día"
                        ).forEach { (minutes, label) ->
                            FilterChip(
                                selected = reminderOffsetMinutes == minutes,
                                onClick = { reminderOffsetMinutes = minutes },
                                label = { Text(label) }
                            )
                        }
                    }
                }

                // Admin Notes & Cost
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = costStr,
                            onValueChange = { costStr = it },
                            label = { Text("Arancel ($)") },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("cost_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .padding(top = 8.dp)
                        ) {
                            FilterChip(
                                selected = isPaid,
                                onClick = { isPaid = !isPaid },
                                label = { Text(if (isPaid) "Abonado ✓" else "Pendiente de Pago") }
                            )
                        }
                    }
                }

                item {
                    OutlinedTextField(
                        value = adminNotes,
                        onValueChange = { adminNotes = it },
                        label = { Text("Notas Administrativas (Opcional)") },
                        placeholder = { Text("Ej. Trae radiografía, solicita factura A") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("admin_notes_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val patient = selectedPatient
                    if (patient != null && reason.isNotBlank()) {
                        val newAppointment = Appointment(
                            patientId = patient.id,
                            patientName = patient.fullName,
                            patientPhone = patient.phone,
                            date = date.trim(),
                            time = time.trim(),
                            specialty = specialty,
                            doctorName = doctorName.trim(),
                            reason = reason.trim(),
                            status = AppointmentStatus.CONFIRMADO,
                            cost = costStr.toDoubleOrNull() ?: 0.0,
                            isPaid = isPaid,
                            adminNotes = adminNotes.trim(),
                            reminderOffsetMinutes = reminderOffsetMinutes
                        )
                        onConfirm(newAppointment)
                    }
                },
                enabled = selectedPatient != null && reason.isNotBlank() && date.isNotBlank() && time.isNotBlank(),
                modifier = Modifier.testTag("confirm_appointment_btn")
            ) {
                Text("Confirmar y Agendar")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_appointment_btn")
            ) {
                Text("Cancelar")
            }
        }
    )
}
