package com.example.equilibra.ui.admin

import android.content.Intent
import android.net.Uri
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
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.ui.theme.EmeraldSuccess

data class PatientSummary(
    val fullName: String,
    val nombre: String,
    val apellido: String,
    val telefono: String,
    val email: String,
    val totalAppointments: Int,
    val completedAppointments: Int,
    val totalSpent: Double,
    val lastVisitDate: String,
    val appointments: List<AppointmentEntity>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientsScreen(
    appointments: List<AppointmentEntity>,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    onViewPatient: (String) -> Unit,
    onOpenNewAppointment: () -> Unit
) {
    val context = LocalContext.current

    val patientsList = remember(appointments) {
        appointments
            .groupBy { "${it.nombre.trim()} ${it.apellido.trim()}" }
            .map { (fullName, apps) ->
                val sorted = apps.sortedByDescending { it.fecha }
                val completed = apps.filter { it.status == "completada" }
                PatientSummary(
                    fullName = fullName,
                    nombre = apps.first().nombre,
                    apellido = apps.first().apellido,
                    telefono = apps.first().telefono,
                    email = apps.first().email,
                    totalAppointments = apps.size,
                    completedAppointments = completed.size,
                    totalSpent = apps.filter { it.status != "cancelada" }.sumOf { it.amount },
                    lastVisitDate = sorted.firstOrNull()?.fecha ?: "Sin registros",
                    appointments = sorted
                )
            }
            .sortedByDescending { it.totalAppointments }
    }

    val filteredPatients = remember(patientsList, searchQuery) {
        if (searchQuery.isBlank()) patientsList else {
            val q = searchQuery.trim().lowercase()
            patientsList.filter {
                it.fullName.lowercase().contains(q) ||
                        it.telefono.contains(q) ||
                        it.email.lowercase().contains(q)
            }
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
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Directorio de Pacientes (${filteredPatients.size})",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Historial clínico y seguimiento",
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
                            imageVector = Icons.Filled.PersonAdd,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Nuevo", fontWeight = FontWeight.Bold)
                    }
                }

                // Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchChange,
                    placeholder = { Text("Buscar paciente por nombre, teléfono...") },
                    leadingIcon = {
                        Icon(Icons.Filled.Search, contentDescription = null)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotBlank()) {
                            IconButton(onClick = { onSearchChange("") }) {
                                Icon(Icons.Filled.Close, contentDescription = null)
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("patients_search_field")
                )
            }
        },
        modifier = Modifier.testTag("admin_patients_screen")
    ) { innerPadding ->
        if (filteredPatients.isEmpty()) {
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
                        imageVector = Icons.Outlined.PersonOff,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(48.dp)
                    )
                    Text(
                        text = "No se encontraron pacientes",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
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
                items(filteredPatients, key = { it.fullName }) { patient ->
                    PatientCard(
                        patient = patient,
                        onClick = { onViewPatient(patient.fullName) }
                    )
                }
            }
        }
    }
}

@Composable
private fun PatientCard(
    patient: PatientSummary,
    onClick: () -> Unit
) {
    val context = LocalContext.current
    val initials = remember(patient.fullName) {
        val parts = patient.fullName.split(" ")
        if (parts.size >= 2) "${parts[0].take(1)}${parts[1].take(1)}".uppercase()
        else patient.fullName.take(2).uppercase()
    }

    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
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
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = initials,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }

                    Column {
                        Text(
                            text = patient.fullName,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = patient.telefono,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "${patient.totalAppointments} citas",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            // Stats Strip
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Total Invertido",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "$${patient.totalSpent.toInt()}",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Completadas",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${patient.completedAppointments}",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = EmeraldSuccess
                    )
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Última Cita",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = patient.lastVisitDate,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            // Quick Contact Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onClick) {
                    Text("Ver Expediente Clínico", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Filled.ChevronRight, contentDescription = null, modifier = Modifier.size(16.dp))
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                        onClick = {
                            val cleanPhone = patient.telefono.replace(Regex("[^0-9+]"), "")
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$cleanPhone"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.size(34.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Call,
                            contentDescription = "Llamar",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    IconButton(
                        onClick = {
                            val cleanPhone = patient.telefono.replace(Regex("[^0-9]"), "")
                            val intent = Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("https://wa.me/$cleanPhone?text=Hola%20${patient.nombre},%20te%20saludamos%20de%20EQUILIBRA.")
                            )
                            context.startActivity(intent)
                        },
                        modifier = Modifier.size(34.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Chat,
                            contentDescription = "WhatsApp",
                            tint = EmeraldSuccess,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
