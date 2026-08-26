package com.example.equilibra.ui.admin

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.equilibra.ui.theme.AmberPrimary
import com.example.equilibra.ui.theme.EmeraldSuccess
import com.example.equilibra.ui.theme.NavyDark
import com.example.equilibra.ui.theme.TealPrimary
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExcelExportDialog(
    appointments: List<AppointmentEntity>,
    patients: List<PatientEntity>,
    onDismiss: () -> Unit,
    onExport: (onSuccess: (File) -> Unit, onError: (String) -> Unit) -> Unit
) {
    val context = LocalContext.current
    var isExporting by remember { mutableStateOf(false) }
    var exportSuccessFile by remember { mutableStateOf<File?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val totalRevenue = appointments.filter { it.status != "cancelada" }.sumOf { it.amount }
    val totalPdfs = patients.sumOf { it.getDocumentsList().size }

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
                .fillMaxHeight(0.85f)
                .testTag("excel_export_dialog")
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
                                .size(44.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF107C41)), // Microsoft Excel green
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.TableChart,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Exportar a Excel",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Base de Datos Clínica Completa",
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

                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Summary Stats Card
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Text(
                                    text = "Resumen de Datos a Exportar:",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text("Total Citas", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text("${appointments.size}", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black), color = TealPrimary)
                                    }
                                    Column {
                                        Text("Pacientes Registrados", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text("${patients.size}", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black), color = AmberPrimary)
                                    }
                                    Column {
                                        Text("Expedientes PDF", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text("$totalPdfs", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black), color = Color(0xFF6366F1))
                                    }
                                    Column {
                                        Text("Ingresos Est.", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text("$${totalRevenue.toInt()}", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black), color = EmeraldSuccess)
                                    }
                                }
                            }
                        }
                    }

                    // Content Breakdown
                    item {
                        Text(
                            text = "Hojas y Secciones del Reporte Excel:",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    item {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                ExportSectionItem(
                                    icon = Icons.Filled.CalendarMonth,
                                    title = "1. Listado Completo de Citas",
                                    desc = "Códigos, fechas, horas, pacientes, especialistas asignados, montos, estados y notas clínicas."
                                )
                                Divider()
                                ExportSectionItem(
                                    icon = Icons.Filled.People,
                                    title = "2. Directorio Clínico de Pacientes",
                                    desc = "Cédula, datos personales, alergias, tipo de sangre, antecedentes, diagnóstico y contacto de emergencia."
                                )
                                Divider()
                                ExportSectionItem(
                                    icon = Icons.Filled.Description,
                                    title = "3. Expedientes & Historiales PDF",
                                    desc = "Metadatos de resonancias, informes traumatológicos, radiografías, analíticas y recetas."
                                )
                                Divider()
                                ExportSectionItem(
                                    icon = Icons.Filled.Analytics,
                                    title = "4. Métricas y Finanzas",
                                    desc = "Resumen de citas por estado, ingresos totales y desglose estadístico de atención."
                                )
                            }
                        }
                    }

                    // Compatibility Note
                    item {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFF107C41).copy(alpha = 0.12f)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.CheckCircle,
                                    contentDescription = null,
                                    tint = Color(0xFF107C41)
                                )
                                Text(
                                    text = "Formato .csv con UTF-8 BOM estructurado con delimitador de columnas para abrirse automáticamente en Microsoft Excel, Google Sheets, Numbers y LibreOffice sin errores de tildes.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    exportSuccessFile?.let { file ->
                        item {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = EmeraldSuccess.copy(alpha = 0.15f)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(Icons.Filled.DoneAll, null, tint = EmeraldSuccess)
                                    Text(
                                        text = "Archivo generado con éxito: ${file.name}",
                                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                        color = EmeraldSuccess
                                    )
                                }
                            }
                        }
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
                        Text("Cerrar")
                    }

                    Button(
                        onClick = {
                            isExporting = true
                            errorMessage = null
                            onExport(
                                { file ->
                                    isExporting = false
                                    exportSuccessFile = file
                                    Toast.makeText(context, "Base de datos exportada a Excel", Toast.LENGTH_SHORT).show()
                                },
                                { error ->
                                    isExporting = false
                                    errorMessage = error
                                }
                            )
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF107C41),
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .weight(1.5f)
                            .testTag("confirm_export_excel_button")
                    ) {
                        if (isExporting) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Generando...")
                        } else {
                            Icon(Icons.Filled.Download, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Descargar Excel", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ExportSectionItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    desc: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = TealPrimary,
            modifier = Modifier.size(20.dp)
        )
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = desc,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
