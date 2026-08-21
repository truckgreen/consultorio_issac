package com.example.ui.screens

import android.content.Intent
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.MedicalInformation
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Share
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
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.ClinicalRecord
import com.example.data.local.entity.Patient
import com.example.ui.components.EmptyStateCard
import com.example.ui.components.PatientAvatar
import androidx.compose.material3.ExperimentalMaterial3Api
import com.example.ui.components.PatientQuickContactRow
import com.example.ui.components.StatusBadge
import com.example.ui.viewmodel.ConsultorioViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDetailScreen(
    viewModel: ConsultorioViewModel,
    onBack: () -> Unit,
    onOpenEditPatient: (Patient) -> Unit,
    onOpenNewAppointment: (Long) -> Unit,
    onOpenNewClinicalRecord: (Patient) -> Unit,
    modifier: Modifier = Modifier
) {
    val patient by viewModel.selectedPatient.collectAsStateWithLifecycle()
    val records by viewModel.selectedPatientRecords.collectAsStateWithLifecycle()
    val appointments by viewModel.selectedPatientAppointments.collectAsStateWithLifecycle()

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val tabTitles = listOf("Historial Clínico (${records.size})", "Turnos (${appointments.size})", "Ficha Completa")

    if (patient == null) {
        Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Paciente no encontrado")
                Spacer(modifier = Modifier.height(12.dp))
                Button(onClick = onBack) {
                    Text("Volver")
                }
            }
        }
        return
    }

    val currentPatient = patient!!

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Top Navigation Bar & Action
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.testTag("patient_detail_back_btn")
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                        onClick = { onOpenEditPatient(currentPatient) },
                        modifier = Modifier.testTag("edit_patient_header_btn")
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = "Editar Paciente", tint = MaterialTheme.colorScheme.primary)
                    }
                    IconButton(
                        onClick = {
                            viewModel.deletePatient(currentPatient)
                            onBack()
                        },
                        modifier = Modifier.testTag("delete_patient_header_btn")
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Eliminar Paciente", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }

        // Patient Hero Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
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
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            PatientAvatar(
                                name = currentPatient.fullName,
                                size = 56,
                                backgroundColor = MaterialTheme.colorScheme.primary,
                                textColor = MaterialTheme.colorScheme.onPrimary
                            )
                            Column {
                                Text(
                                    text = currentPatient.fullName,
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                                Text(
                                    text = "DNI: ${currentPatient.dni} • ${currentPatient.gender} • ${currentPatient.birthDate}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                                )
                            }
                        }

                        Surface(
                            color = MaterialTheme.colorScheme.surface,
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(
                                text = currentPatient.bloodType,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Contact Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Tel: ${currentPatient.phone}",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        PatientQuickContactRow(
                            patientPhone = currentPatient.phone,
                            patientEmail = currentPatient.email,
                            patientName = currentPatient.fullName
                        )
                    }

                    // Allergies / Chronic Conditions Alert
                    if (currentPatient.allergies.isNotBlank() && !currentPatient.allergies.equals("Ninguna", true)) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            color = Color(0xFFFFEBEE),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFC62828), modifier = Modifier.size(16.dp))
                                Text(
                                    text = "ALERGIAS: ${currentPatient.allergies}",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFC62828)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Action Buttons: Nueva Consulta & Nuevo Turno
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { onOpenNewClinicalRecord(currentPatient) },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("btn_new_clinical_record")
                        ) {
                            Icon(Icons.Default.MedicalServices, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Nueva Consulta")
                        }

                        FilledTonalButton(
                            onClick = { onOpenNewAppointment(currentPatient.id) },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("btn_new_appointment_for_patient")
                        ) {
                            Icon(Icons.Default.CalendarMonth, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Dar Turno")
                        }
                    }
                }
            }
        }

        // Tabs: Historial Clínico, Turnos, Ficha Completa
        item {
            PrimaryTabRow(
                selectedTabIndex = selectedTabIndex,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
            ) {
                tabTitles.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTabIndex == index,
                        onClick = { selectedTabIndex = index },
                        text = { Text(title, fontWeight = FontWeight.Bold) },
                        modifier = Modifier.testTag("patient_tab_$index")
                    )
                }
            }
        }

        // Tab Content
        when (selectedTabIndex) {
            0 -> {
                // Historial Clínico Timeline
                if (records.isEmpty()) {
                    item {
                        EmptyStateCard(
                            title = "Sin consultas registradas",
                            subtitle = "Presiona 'Nueva Consulta' para registrar la primera atención médica.",
                            icon = Icons.Default.History
                        )
                    }
                } else {
                    items(records) { record ->
                        ClinicalRecordCard(
                            record = record,
                            patientName = currentPatient.fullName,
                            onDelete = { viewModel.deleteClinicalRecord(record) }
                        )
                    }
                }
            }
            1 -> {
                // Turnos del Paciente
                if (appointments.isEmpty()) {
                    item {
                        EmptyStateCard(
                            title = "Sin turnos registrados",
                            subtitle = "No hay turnos previos ni agendados para este paciente.",
                            icon = Icons.Default.CalendarMonth
                        )
                    }
                } else {
                    items(appointments) { appointment ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "${appointment.date} a las ${appointment.time} hs",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold
                                    )
                                    StatusBadge(status = appointment.status)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Especialidad: ${appointment.specialty} • ${appointment.doctorName}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Motivo: ${appointment.reason}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }
            2 -> {
                // Ficha Completa
                item {
                    FullPatientProfileCard(patient = currentPatient)
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
fun ClinicalRecordCard(
    record: ClinicalRecord,
    patientName: String,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    ElevatedCard(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = modifier
            .fillMaxWidth()
            .testTag("clinical_record_${record.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: Date, Doctor & Specialty
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
                            text = "${record.date} • ${record.time} hs",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                    Text(
                        text = record.doctorName,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    // Share Prescription Button
                    IconButton(
                        onClick = {
                            val shareText = """
                                🌿 EQUILIBRA - FISIOTERAPIA & REHABILITACIÓN
                                Paciente: $patientName
                                Fecha: ${record.date} ${record.time}
                                Profesional: ${record.doctorName}
                                Especialidad: ${record.specialty}
                                
                                📋 DIAGNÓSTICO KINÉSICO / FUNCIONAL:
                                ${record.diagnosis}
                                
                                🩺 TRATAMIENTO REALIZADO:
                                ${record.treatment}
                                
                                🏃 PLAN DE EJERCICIOS & PAUTAS DOMICILIARIAS:
                                ${record.prescription}
                                
                                ${if (!record.nextControlDate.isNullOrBlank()) "Próxima Sesión: ${record.nextControlDate}" else ""}
                            """.trimIndent()

                            val sendIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, shareText)
                                putExtra(Intent.EXTRA_SUBJECT, "Pautas de Fisioterapia - Equilibra")
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Compartir Ficha Fisioterapia"))
                        },
                        modifier = Modifier.testTag("share_prescription_btn_${record.id}")
                    ) {
                        Icon(Icons.Default.Share, contentDescription = "Compartir Receta", tint = MaterialTheme.colorScheme.primary)
                    }

                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.testTag("delete_record_btn_${record.id}")
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Eliminar Registro", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Reason & Diagnosis
            Text(
                text = "Motivo: ${record.reason}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(6.dp))
            Surface(
                color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.6f),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text(
                        text = "DIAGNÓSTICO:",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                    Text(
                        text = record.diagnosis,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
            }

            // Vital Signs
            if (record.vitalSigns.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "🩺 Signos Vitales: ${record.vitalSigns}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }

            // Prescription / Receta
            if (record.prescription.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    color = Color(0xFFE8F5E9),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "💊 RECETA Y POSOLOGÍA:",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2E7D32)
                        )
                        Text(
                            text = record.prescription,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFF1B5E20)
                        )
                    }
                }
            }

            // Treatment Plan
            if (record.treatment.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Plan: ${record.treatment}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (!record.nextControlDate.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "📅 Próximo Control Sugerido: ${record.nextControlDate}",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
fun FullPatientProfileCard(patient: Patient) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
                text = "Datos Filiatorios y Clínicos",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            InfoRow("Nombre Completo", patient.fullName)
            InfoRow("DNI / Documento", patient.dni)
            InfoRow("Fecha de Nacimiento", patient.birthDate)
            InfoRow("Género", patient.gender)
            InfoRow("Grupo Sanguíneo", patient.bloodType)
            InfoRow("Teléfono / WhatsApp", patient.phone)
            InfoRow("Correo Electrónico", patient.email.ifEmpty { "No registrado" })
            InfoRow("Domicilio", patient.address.ifEmpty { "No registrado" })
            InfoRow("Contacto de Emergencia", "${patient.emergencyContact} (${patient.emergencyPhone})".ifEmpty { "No registrado" })
            InfoRow("Alergias", patient.allergies.ifEmpty { "Ninguna" })
            InfoRow("Enfermedades Crónicas", patient.chronicConditions.ifEmpty { "Ninguna" })
            if (patient.notes.isNotBlank()) {
                InfoRow("Observaciones Generales", patient.notes)
            }
        }
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.outline,
            fontWeight = FontWeight.Medium
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.SemiBold
        )
    }
}
