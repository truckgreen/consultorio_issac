package com.example.equilibra.ui.admin

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.equilibra.data.local.PatientEntity
import com.example.equilibra.data.model.MedicalRecordDocument
import com.example.equilibra.ui.theme.AmberPrimary
import com.example.equilibra.ui.theme.EmeraldSuccess
import com.example.equilibra.ui.theme.NavyDark
import com.example.equilibra.ui.theme.TealPrimary
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddDocumentDialog(
    patient: PatientEntity,
    currentDoctorName: String?,
    onDismiss: () -> Unit,
    onAddDocument: (MedicalRecordDocument) -> Unit
) {
    val context = LocalContext.current
    var title by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("informe") }
    var doctorName by remember { mutableStateOf(currentDoctorName ?: "Lic. Isaac Jewsiejew") }
    var fileName by remember { mutableStateOf("Informe_Medico_${patient.apellido.replace(" ", "")}.pdf") }
    var fileSize by remember { mutableStateOf("1.8 MB") }
    var notes by remember { mutableStateOf("") }
    var isFilePicked by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // System File Picker for PDF
    val pdfPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            isFilePicked = true
            val path = uri.lastPathSegment ?: "documento.pdf"
            fileName = path.substringAfterLast("/")
            if (!fileName.endsWith(".pdf", ignoreCase = true)) {
                fileName += ".pdf"
            }
            if (title.isBlank()) {
                title = fileName.replace("_", " ").replace(".pdf", "")
            }
        }
    }

    val categories = listOf(
        "informe" to "Informe Traumatológico / Clínico",
        "resonancia" to "Resonancia Magnética (RMN)",
        "radiografia" to "Radiografía / Rayos X",
        "analitica" to "Analítica de Sangre / Laboratorio",
        "receta" to "Receta Médica / Farmacología",
        "consentimiento" to "Consentimiento Informado"
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.88f)
                .testTag("add_document_dialog")
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
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFFE11D48)), // PDF Red
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.PictureAsPdf,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Subir Historial Médico PDF",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Paciente: ${patient.fullName}",
                                style = MaterialTheme.typography.bodySmall,
                                color = TealPrimary
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Filled.Close, contentDescription = "Cerrar")
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // PDF File Selector Button
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isFilePicked) EmeraldSuccess.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                1.5.dp,
                                if (isFilePicked) EmeraldSuccess else MaterialTheme.colorScheme.outlineVariant
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = if (isFilePicked) Icons.Filled.CheckCircle else Icons.Filled.CloudUpload,
                                        contentDescription = null,
                                        tint = if (isFilePicked) EmeraldSuccess else TealPrimary
                                    )
                                    Text(
                                        text = if (isFilePicked) "Documento PDF Seleccionado" else "Seleccionar Archivo PDF del Dispositivo",
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }

                                Text(
                                    text = fileName,
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = if (isFilePicked) EmeraldSuccess else MaterialTheme.colorScheme.onSurfaceVariant
                                )

                                Button(
                                    onClick = {
                                        try {
                                            pdfPickerLauncher.launch("application/pdf")
                                        } catch (e: Exception) {
                                            isFilePicked = true
                                        }
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (isFilePicked) TealPrimary else AmberPrimary,
                                        contentColor = NavyDark
                                    )
                                ) {
                                    Icon(Icons.Filled.FolderOpen, null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(if (isFilePicked) "Cambiar Archivo PDF" else "Examinar Almacenamiento (.pdf)")
                                }
                            }
                        }
                    }

                    // Title
                    item {
                        OutlinedTextField(
                            value = title,
                            onValueChange = { title = it },
                            label = { Text("Título del Documento *") },
                            placeholder = { Text("Ej: Resonancia Rodilla Derecha / Informe Traumatología") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("doc_input_title")
                        )
                    }

                    // Category
                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "Categoría del Documento Clínico:",
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            categories.forEach { (catId, catLabel) ->
                                val isSelected = selectedCategory == catId
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(
                                            if (isSelected) TealPrimary.copy(alpha = 0.15f) else Color.Transparent
                                        )
                                        .padding(horizontal = 8.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = isSelected,
                                        onClick = { selectedCategory = catId },
                                        colors = RadioButtonDefaults.colors(selectedColor = TealPrimary)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = catLabel,
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                        ),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }

                    // Specialist / Doctor
                    item {
                        OutlinedTextField(
                            value = doctorName,
                            onValueChange = { doctorName = it },
                            label = { Text("Especialista / Médico Emisor") },
                            placeholder = { Text("Dr. Rubén Torrealba / Lic. Isaac Jewsiejew") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // Notes
                    item {
                        OutlinedTextField(
                            value = notes,
                            onValueChange = { notes = it },
                            label = { Text("Observaciones Clínicas / Hallazgos Relevantes") },
                            placeholder = { Text("Resumen de la imagen, diagnóstico radiológico, recomendaciones...") },
                            minLines = 3,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    errorMessage?.let { err ->
                        item {
                            Text(
                                text = err,
                                color = Color(0xFFEF4444),
                                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancelar")
                    }

                    Button(
                        onClick = {
                            if (title.isBlank()) {
                                errorMessage = "Por favor ingresa un título descriptivo para el documento."
                                return@Button
                            }

                            val todayFormatted = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                            val newDoc = MedicalRecordDocument(
                                id = "doc_${System.currentTimeMillis()}",
                                patientId = patient.id,
                                title = title.trim(),
                                category = selectedCategory,
                                fileName = fileName.ifBlank { "Documento_Clinico.pdf" },
                                fileSize = fileSize,
                                uploadDate = todayFormatted,
                                doctorName = doctorName.trim().ifBlank { "EQUILIBRA" },
                                notes = notes.trim()
                            )

                            onAddDocument(newDoc)
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFE11D48),
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .weight(1.5f)
                            .testTag("save_document_button")
                    ) {
                        Icon(Icons.Filled.PictureAsPdf, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Guardar Expediente PDF", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
