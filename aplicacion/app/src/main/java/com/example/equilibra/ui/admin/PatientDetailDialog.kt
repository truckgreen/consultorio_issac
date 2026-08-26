package com.example.equilibra.ui.admin

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.local.PatientEntity
import com.example.equilibra.data.model.MedicalRecordDocument
import com.example.equilibra.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDetailDialog(
    patient: PatientEntity,
    appointments: List<AppointmentEntity>,
    onDismiss: () -> Unit,
    onEditPatient: () -> Unit,
    onDeletePatient: () -> Unit,
    onOpenNewAppointment: () -> Unit,
    onAddDocument: (MedicalRecordDocument) -> Unit,
    onDeleteDocument: (String) -> Unit
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableStateOf(0) } // 0: Ficha Médica, 1: Historial Citas, 2: Documentos PDF
    var showAddDocDialog by remember { mutableStateOf(false) }
    var viewingDoc by remember { mutableStateOf<MedicalRecordDocument?>(null) }

    val patientAppointments = remember(appointments, patient) {
        appointments.filter { app ->
            val appFullName = "${app.nombre.trim()} ${app.apellido.trim()}".trim()
            val patFullName = patient.fullName.trim()
            appFullName.equals(patFullName, ignoreCase = true) ||
            (app.email.isNotBlank() && app.email.equals(patient.email, ignoreCase = true)) ||
            (app.telefono.isNotBlank() && app.telefono.filter { it.isDigit() } == patient.telefono.filter { it.isDigit() })
        }
    }

    val documentsList = patient.getDocumentsList()

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier
                .fillMaxWidth(0.96f)
                .fillMaxHeight(0.94f)
                .testTag("patient_detail_dialog")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(TealPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = patient.initials,
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                                color = NavyDark
                            )
                        }
                        Column {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = patient.fullName,
                                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = AmberPrimary.copy(alpha = 0.2f)
                                ) {
                                    Text(
                                        text = patient.tipoSangre,
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = AmberPrimary,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            Text(
                                text = "Cédula: ${patient.cedula.ifEmpty { "Sin cédula" }} • Tel: ${patient.telefono}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Filled.Close, contentDescription = "Cerrar")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Navigation Tabs
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    contentColor = TealPrimary,
                    modifier = Modifier.clip(RoundedCornerShape(12.dp))
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("Ficha Médica", fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("Citas (${patientAppointments.size})", fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = { Text("Expedientes PDF (${documentsList.size})", fontWeight = FontWeight.Bold) }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // TAB CONTENTS
                when (selectedTab) {
                    0 -> {
                        // Clinical Dossier Tab
                        LazyColumn(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Quick Action Buttons (Call / WhatsApp / Edit)
                            item {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    OutlinedButton(
                                        onClick = {
                                            val cleanPhone = patient.telefono.replace(" ", "").replace("-", "")
                                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$cleanPhone"))
                                            try { context.startActivity(intent) } catch (_: Exception) {}
                                        },
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(Icons.Filled.Phone, null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Llamar", fontSize = 12.sp)
                                    }

                                    OutlinedButton(
                                        onClick = {
                                            val cleanPhone = patient.telefono.replace("+", "").replace(" ", "").replace("-", "")
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$cleanPhone"))
                                            try { context.startActivity(intent) } catch (_: Exception) {}
                                        },
                                        shape = RoundedCornerShape(10.dp),
                                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF25D366)),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(Icons.Filled.Chat, null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("WhatsApp", fontSize = 12.sp)
                                    }

                                    Button(
                                        onClick = onEditPatient,
                                        shape = RoundedCornerShape(10.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = AmberPrimary, contentColor = NavyDark),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(Icons.Filled.Edit, null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Editar", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }

                            // Diagnosis Card
                            item {
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f))
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = "DIAGNÓSTICO PRINCIPAL / MOTIVO",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                                            color = TealPrimary
                                        )
                                        Text(
                                            text = patient.diagnosticoPrincipal,
                                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }

                            // Personal & Biological Info Card
                            item {
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Text(
                                            text = "DATOS CLÍNICOS & BIOLÓGICOS",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                                            color = AmberPrimary
                                        )
                                        Divider()

                                        InfoRow("Género:", patient.genero)
                                        InfoRow("Fecha de Nacimiento:", patient.fechaNacimiento.ifEmpty { "No especificada" })
                                        InfoRow("Tipo de Sangre:", patient.tipoSangre)
                                        InfoRow("Alergias Conocidas:", patient.alergias)
                                        InfoRow("Medicamentos Actuales:", patient.medicamentos)
                                        InfoRow("Antecedentes Médicos:", patient.antecedentes)
                                    }
                                }
                            }

                            // Contact & Emergency Card
                            item {
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Text(
                                            text = "UBICACIÓN & CONTACTO DE EMERGENCIA",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                                            color = TealPrimary
                                        )
                                        Divider()

                                        InfoRow("Email:", patient.email.ifEmpty { "Sin correo registrado" })
                                        InfoRow("Dirección:", patient.direccion.ifEmpty { "Caracas, Venezuela" })
                                        InfoRow("Ocupación:", patient.ocupacion.ifEmpty { "No especificada" })
                                        InfoRow(
                                            "Contacto Emergencia:",
                                            "${patient.contactoEmergenciaNombre.ifEmpty { "No registrado" }} (${patient.contactoEmergenciaTelefono.ifEmpty { "Sin tel" }})"
                                        )
                                    }
                                }
                            }

                            // Physio Notes
                            item {
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = "NOTAS DE FISIOTERAPIA & SEGUIMIENTO",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                                            color = TealPrimary
                                        )
                                        Divider()
                                        Text(
                                            text = patient.notasFisioterapia.ifEmpty { "Sin notas clínicas registradas todavía." },
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }

                            // Delete Patient Button
                            item {
                                OutlinedButton(
                                    onClick = onDeletePatient,
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF4444)),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Filled.DeleteOutline, null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Eliminar Ficha de Paciente", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    1 -> {
                        // Appointments History Tab
                        if (patientAppointments.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxWidth(),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(Icons.Filled.EventBusy, null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(40.dp))
                                    Text(
                                        text = "No hay citas registradas para este paciente aún.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Button(
                                        onClick = onOpenNewAppointment,
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Icon(Icons.Filled.Add, null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Agendar Primera Cita")
                                    }
                                }
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                items(patientAppointments) { app ->
                                    Card(
                                        shape = RoundedCornerShape(14.dp),
                                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(14.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                                ) {
                                                    Text(app.serviceTitle, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                                                    Text("• ${app.code}", style = MaterialTheme.typography.labelSmall, color = TealPrimary)
                                                }
                                                Text("Fecha: ${app.fecha} • ${app.hora}", style = MaterialTheme.typography.bodySmall)
                                                Text("Especialista: ${app.specialistName}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                                if (app.notes.isNotBlank()) {
                                                    Text("Notas: ${app.notes}", style = MaterialTheme.typography.labelSmall, color = AmberLight)
                                                }
                                            }

                                            Surface(
                                                shape = RoundedCornerShape(6.dp),
                                                color = when (app.status) {
                                                    "confirmada" -> EmeraldSuccess.copy(alpha = 0.2f)
                                                    "completada" -> TealPrimary.copy(alpha = 0.2f)
                                                    "cancelada" -> Color(0xFFEF4444).copy(alpha = 0.2f)
                                                    else -> AmberPrimary.copy(alpha = 0.2f)
                                                }
                                            ) {
                                                Text(
                                                    text = app.status.uppercase(),
                                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                                                    color = when (app.status) {
                                                        "confirmada" -> EmeraldSuccess
                                                        "completada" -> TealPrimary
                                                        "cancelada" -> Color(0xFFEF4444)
                                                        else -> AmberPrimary
                                                    },
                                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    2 -> {
                        // PDF Documents Tab
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "EXPEDIENTES & INFORMES PDF",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black),
                                    color = Color(0xFFE11D48)
                                )

                                Button(
                                    onClick = { showAddDocDialog = true },
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48), contentColor = Color.White),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Icon(Icons.Filled.UploadFile, null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("+ Subir PDF", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            if (documentsList.isEmpty()) {
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 12.dp)
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(24.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(54.dp)
                                                .clip(RoundedCornerShape(14.dp))
                                                .background(Color(0xFFE11D48).copy(alpha = 0.15f)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Filled.PictureAsPdf, null, tint = Color(0xFFE11D48), modifier = Modifier.size(28.dp))
                                        }

                                        Text(
                                            text = "Sin registros médicos PDF adjuntos",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )

                                        Text(
                                            text = "Puedes adjuntar informes traumatológicos, resonancias magnéticas, radiografías o recetas para este paciente.",
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                        )

                                        Button(
                                            onClick = { showAddDocDialog = true },
                                            shape = RoundedCornerShape(12.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48), contentColor = Color.White)
                                        ) {
                                            Icon(Icons.Filled.UploadFile, null, modifier = Modifier.size(18.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Subir Registro Médico PDF", fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            } else {
                                LazyColumn(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    items(documentsList) { doc ->
                                        Card(
                                            shape = RoundedCornerShape(14.dp),
                                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
                                            modifier = Modifier.clickable { viewingDoc = doc }
                                        ) {
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(14.dp),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                                    modifier = Modifier.weight(1f)
                                                ) {
                                                    Box(
                                                        modifier = Modifier
                                                            .size(42.dp)
                                                            .clip(RoundedCornerShape(10.dp))
                                                            .background(Color(0xFFE11D48).copy(alpha = 0.15f)),
                                                        contentAlignment = Alignment.Center
                                                    ) {
                                                        Icon(Icons.Filled.PictureAsPdf, null, tint = Color(0xFFE11D48))
                                                    }

                                                    Column {
                                                        Text(doc.title, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                                        Text("${doc.fileName} • ${doc.uploadDate}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                                        Text("Especialista: ${doc.doctorName ?: "EQUILIBRA"}", fontSize = 11.sp, color = TealPrimary)
                                                    }
                                                }

                                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                    IconButton(onClick = { viewingDoc = doc }) {
                                                        Icon(Icons.Filled.Visibility, contentDescription = "Ver PDF", tint = Color(0xFFE11D48))
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Bottom Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cerrar")
                    }

                    Button(
                        onClick = onOpenNewAppointment,
                        modifier = Modifier.weight(1.3f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = TealPrimary, contentColor = NavyDark)
                    ) {
                        Icon(Icons.Filled.CalendarMonth, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Agendar Cita", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    // Modal Subir Documento PDF
    if (showAddDocDialog) {
        AddDocumentDialog(
            patient = patient,
            currentDoctorName = null,
            onDismiss = { showAddDocDialog = false },
            onAddDocument = { newDoc ->
                onAddDocument(newDoc)
                showAddDocDialog = false
            }
        )
    }

    // Modal Visor PDF
    viewingDoc?.let { doc ->
        PdfViewerDialog(
            document = doc,
            patient = patient,
            onDismiss = { viewingDoc = null },
            onDeleteDocument = {
                onDeleteDocument(doc.id)
                viewingDoc = null
            }
        )
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1.5f)
        )
    }
}
