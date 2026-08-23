package com.example.equilibra.ui.admin

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.model.MedicalRecordDocument
import com.example.equilibra.ui.theme.EmeraldSuccess

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDetailDialog(
    patientSummary: PatientSummary,
    onDismiss: () -> Unit,
    onOpenNewAppointment: () -> Unit
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableStateOf(2) } // Default to PDF tab as requested
    var showPdfViewer by remember { mutableStateOf<MedicalRecordDocument?>(null) }
    var userPdfs by remember { mutableStateOf<List<MedicalRecordDocument>>(emptyList()) }

    val pdfPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            val fileName = it.lastPathSegment?.substringAfterLast("/") ?: "Documento_Clinico.pdf"
            val newDoc = MedicalRecordDocument(
                id = "doc_${System.currentTimeMillis()}",
                patientId = patientSummary.fullName,
                title = fileName.replace(".pdf", "").replace("_", " "),
                category = "informe",
                fileName = if (fileName.endsWith(".pdf")) fileName else "$fileName.pdf",
                fileSize = "PDF Adjunto",
                uploadDate = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date()),
                doctorName = "Especialista EQUILIBRA",
                notes = "Documento médico digital anexado al expediente."
            )
            userPdfs = userPdfs + newDoc
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
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
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Badge,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                        Column {
                            Text(
                                text = patientSummary.fullName,
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Expediente Digital • Tel: ${patientSummary.telefono}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Filled.Close, contentDescription = "Cerrar")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Navigation Tabs
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    contentColor = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.clip(RoundedCornerShape(12.dp))
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("Ficha Clínica", fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("Citas (${patientSummary.totalAppointments})", fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = { Text("Documentos PDF (${userPdfs.size})", fontWeight = FontWeight.Bold) }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Content Views
                when (selectedTab) {
                    0 -> {
                        // Clinical Profile
                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            item {
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)
                                    )
                                ) {
                                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text("Datos Clínicos & Diagnóstico", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                        HorizontalDivider()
                                        Text("• Paciente registrado en el sistema EQUILIBRA", fontSize = 14.sp)
                                        Text("• Expediente digital activo para rehabilitación y bienestar.", fontSize = 14.sp)
                                    }
                                }
                            }

                            item {
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)
                                    )
                                ) {
                                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text("Contacto & Información", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                        HorizontalDivider()
                                        Text("• Teléfono: ${patientSummary.telefono}", fontSize = 14.sp)
                                        Text("• Email: ${patientSummary.email}", fontSize = 14.sp)
                                    }
                                }
                            }
                        }
                    }
                    1 -> {
                        // Appointments list
                        if (patientSummary.appointments.isEmpty()) {
                            Box(
                                modifier = Modifier.weight(1f).fillMaxWidth(),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    "No hay citas registradas para este paciente aún.",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 13.sp
                                )
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                items(patientSummary.appointments) { app ->
                                    Card(
                                        shape = RoundedCornerShape(14.dp),
                                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth().padding(14.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column {
                                                Text(app.service_title, fontWeight = FontWeight.Bold)
                                                Text("Fecha: ${app.fecha} • ${app.hora}", style = MaterialTheme.typography.bodySmall)
                                                Text("Especialista: ${app.specialist_name ?: "Sin asignar"}", style = MaterialTheme.typography.bodySmall)
                                            }
                                            Badge {
                                                Text(app.status.uppercase(), fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    2 -> {
                        // PDF Documents tab
                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    "EXPEDIENTES & INFORMES PDF",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )

                                Button(
                                    onClick = { pdfPickerLauncher.launch("application/pdf") },
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Icon(Icons.Filled.UploadFile, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("+ Subir PDF", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            if (userPdfs.isEmpty()) {
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f)),
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)
                                ) {
                                    Column(
                                        modifier = Modifier.fillMaxWidth().padding(24.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(52.dp)
                                                .clip(RoundedCornerShape(14.dp))
                                                .background(Color(0xFFFFA000).copy(alpha = 0.15f)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Filled.PictureAsPdf, contentDescription = null, tint = Color(0xFFFFA000), modifier = Modifier.size(28.dp))
                                        }

                                        Text(
                                            "No hay registros médicos PDF adjuntos",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )

                                        Text(
                                            "Puedes adjuntar informes traumatológicos, resonancias magnéticas, radiografías o recetas para este paciente.",
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                        )

                                        Spacer(modifier = Modifier.height(4.dp))

                                        Button(
                                            onClick = { pdfPickerLauncher.launch("application/pdf") },
                                            shape = RoundedCornerShape(12.dp)
                                        ) {
                                            Icon(Icons.Filled.UploadFile, contentDescription = null, modifier = Modifier.size(18.dp))
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
                                    items(userPdfs) { doc ->
                                        Card(
                                            shape = RoundedCornerShape(16.dp),
                                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
                                            modifier = Modifier.clickable { showPdfViewer = doc }
                                        ) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth().padding(14.dp),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                                ) {
                                                    Box(
                                                        modifier = Modifier
                                                            .size(40.dp)
                                                            .clip(RoundedCornerShape(10.dp))
                                                            .background(Color(0xFFE53935).copy(alpha = 0.15f)),
                                                        contentAlignment = Alignment.Center
                                                    ) {
                                                        Icon(Icons.Filled.PictureAsPdf, contentDescription = null, tint = Color(0xFFE53935))
                                                    }

                                                    Column {
                                                        Text(doc.title, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                                        Text("${doc.fileName} • ${doc.uploadDate}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                                    }
                                                }

                                                IconButton(onClick = { showPdfViewer = doc }) {
                                                    Icon(Icons.Filled.Visibility, contentDescription = "Ver PDF", tint = MaterialTheme.colorScheme.primary)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

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
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Filled.CalendarMonth, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Agendar Cita", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    // PDF Preview Modal
    showPdfViewer?.let { doc ->
        AlertDialog(
            onDismissRequest = { showPdfViewer = null },
            icon = { Icon(Icons.Filled.PictureAsPdf, contentDescription = null, tint = Color(0xFFE53935)) },
            title = { Text(doc.title, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Archivo: ${doc.fileName} (${doc.fileSize})", fontWeight = FontWeight.Medium)
                    Text("Fecha de emisión: ${doc.uploadDate}")
                    doc.doctorName?.let { Text("Especialista emisor: $it") }
                    doc.notes?.let {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Observaciones clínicas:\n$it", style = MaterialTheme.typography.bodySmall)
                    }
                }
            },
            confirmButton = {
                Button(onClick = {
                    showPdfViewer = null
                }) {
                    Text("Aceptar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPdfViewer = null }) {
                    Text("Cerrar")
                }
            }
        )
    }
}
