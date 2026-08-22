package com.example.equilibra.ui.admin

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.model.AdminNavTab
import com.example.equilibra.data.model.ContactLead
import com.example.equilibra.ui.theme.AmberAccent
import com.example.equilibra.ui.theme.AmberPrimary
import com.example.equilibra.ui.theme.EmeraldSuccess
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Composable
fun DashboardScreen(
    appointments: List<AppointmentEntity>,
    messages: List<ContactLead>,
    onOpenNewAppointment: () -> Unit,
    onNavigateToTab: (AdminNavTab) -> Unit,
    onEditAppointment: (AppointmentEntity) -> Unit,
    onUpdateStatus: (String, String) -> Unit,
    onViewPatient: (String) -> Unit
) {
    val context = LocalContext.current
    val todayStr = remember { LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) }

    val todayAppointments = remember(appointments, todayStr) {
        appointments.filter { it.fecha == todayStr }
    }

    val totalRevenue = remember(appointments) {
        appointments.filter { it.status != "cancelada" }.sumOf { it.amount }
    }

    val todayRevenue = remember(todayAppointments) {
        todayAppointments.filter { it.status != "cancelada" }.sumOf { it.amount }
    }

    val uniquePatientsCount = remember(appointments) {
        appointments.map { "${it.nombre.trim().lowercase()} ${it.apellido.trim().lowercase()}" }.distinct().size
    }

    val unreadLeads = remember(messages) {
        messages.filter { it.status == "NUEVO" }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("admin_dashboard_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Hero Clinic Card & Welcome
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(EmeraldSuccess)
                            )
                            Text(
                                text = "SISTEMA CLÍNICO ACTIVO",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.sp
                                ),
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }

                        Text(
                            text = "EQUILIBRA • Sabana Grande",
                            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Black),
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )

                        Text(
                            text = "Centro Profesional del Este, Piso 4 • Tel: +58 414 239.88.99",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Button(
                                onClick = onOpenNewAppointment,
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Add,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Nueva Cita", fontWeight = FontWeight.Bold)
                            }

                            OutlinedButton(
                                onClick = {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/584142398899"))
                                    context.startActivity(intent)
                                },
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Phone,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("WhatsApp", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // 2. Metrics 2x2 Grid
        item {
            Text(
                text = "Métricas Principales",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(10.dp))

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    MetricCard(
                        title = "Citas Hoy",
                        value = "${todayAppointments.size}",
                        subtitle = "${todayAppointments.filter { it.status == "confirmada" || it.status == "en_curso" }.size} activas",
                        icon = Icons.Filled.CalendarMonth,
                        iconColor = AmberPrimary,
                        modifier = Modifier.weight(1f),
                        onClick = { onNavigateToTab(AdminNavTab.CITAS) }
                    )

                    MetricCard(
                        title = "Ingresos Hoy",
                        value = "$${todayRevenue.toInt()}",
                        subtitle = "Total: $${totalRevenue.toInt()}",
                        icon = Icons.Filled.AttachMoney,
                        iconColor = EmeraldSuccess,
                        modifier = Modifier.weight(1f),
                        onClick = {}
                    )
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    MetricCard(
                        title = "Pacientes",
                        value = "$uniquePatientsCount",
                        subtitle = "Fichas registradas",
                        icon = Icons.Filled.People,
                        iconColor = Color(0xFF3B82F6),
                        modifier = Modifier.weight(1f),
                        onClick = { onNavigateToTab(AdminNavTab.PACIENTES) }
                    )

                    MetricCard(
                        title = "Especialistas",
                        value = "9",
                        subtitle = "Staff disponible",
                        icon = Icons.Filled.MedicalServices,
                        iconColor = Color(0xFF8B5CF6),
                        modifier = Modifier.weight(1f),
                        onClick = { onNavigateToTab(AdminNavTab.STAFF) }
                    )
                }
            }
        }

        // 3. Today's Appointments Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Agenda de Hoy (${todayAppointments.size})",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Turnos programados para el día",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                TextButton(onClick = { onNavigateToTab(AdminNavTab.CITAS) }) {
                    Text("Ver Todas", fontWeight = FontWeight.Bold)
                }
            }
        }

        if (todayAppointments.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.EventAvailable,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(36.dp)
                        )
                        Text(
                            text = "No hay más citas programadas para hoy",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        OutlinedButton(onClick = onOpenNewAppointment) {
                            Text("Agendar Cita Hoy")
                        }
                    }
                }
            }
        } else {
            items(todayAppointments, key = { it.id }) { app ->
                TodayAppointmentCard(
                    appointment = app,
                    onEdit = { onEditAppointment(app) },
                    onUpdateStatus = { newStatus -> onUpdateStatus(app.id, newStatus) },
                    onViewPatient = { onViewPatient("${app.nombre} ${app.apellido}") }
                )
            }
        }

        // 4. Quick Modules Access Strip
        item {
            Text(
                text = "Módulos de Gestión",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(10.dp))

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                QuickModuleRow(
                    title = "Especialistas & Staff Médico (9)",
                    subtitle = "Isaac, Marivid, Laury, Dr. Rubén, Stephani...",
                    icon = Icons.Filled.MedicalServices,
                    iconColor = AmberPrimary,
                    onClick = { onNavigateToTab(AdminNavTab.STAFF) }
                )

                QuickModuleRow(
                    title = "Tarifas & Catálogo ($ USD)",
                    subtitle = "Precios y packs de las 9 disciplinas clínicas",
                    icon = Icons.Filled.LocalOffer,
                    iconColor = EmeraldSuccess,
                    onClick = { onNavigateToTab(AdminNavTab.SERVICIOS) }
                )

                QuickModuleRow(
                    title = "Consultas & Leads de Pacientes",
                    subtitle = if (unreadLeads.isNotEmpty()) "${unreadLeads.size} nuevos mensajes por responder" else "Bandeja al día",
                    icon = Icons.Filled.QuestionAnswer,
                    iconColor = Color(0xFF3B82F6),
                    badge = if (unreadLeads.isNotEmpty()) "${unreadLeads.size} nuevos" else null,
                    onClick = { onNavigateToTab(AdminNavTab.MENSAJES) }
                )
            }
        }
    }
}

@Composable
private fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier.clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(iconColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Black),
                color = MaterialTheme.colorScheme.onSurface
            )

            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun TodayAppointmentCard(
    appointment: AppointmentEntity,
    onEdit: () -> Unit,
    onUpdateStatus: (String) -> Unit,
    onViewPatient: () -> Unit
) {
    val context = LocalContext.current

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
            // Header Row
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
                            text = appointment.hora,
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

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(statusColor.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = statusLabel,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = statusColor
                    )
                }
            }

            // Patient Name & Service
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
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Text(
                    text = "$${appointment.amount.toInt()}",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            if (appointment.motivoConsulta.isNotBlank()) {
                Text(
                    text = appointment.motivoConsulta,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2
                )
            }

            // Quick Status & Contact Actions
            Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Call & WhatsApp
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                        onClick = {
                            val cleanPhone = appointment.telefono.replace(Regex("[^0-9+]"), "")
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
                            val cleanPhone = appointment.telefono.replace(Regex("[^0-9]"), "")
                            val intent = Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("https://wa.me/$cleanPhone?text=Hola%20${appointment.nombre},%20te%20escribimos%20de%20EQUILIBRA%20sobre%20tu%20cita%20de%20hoy.")
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

                    IconButton(
                        onClick = onEdit,
                        modifier = Modifier.size(34.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Edit,
                            contentDescription = "Editar",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                // Quick Status Buttons
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (appointment.status != "completada") {
                        FilledTonalButton(
                            onClick = { onUpdateStatus("completada") },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.filledTonalButtonColors(
                                containerColor = EmeraldSuccess.copy(alpha = 0.15f),
                                contentColor = EmeraldSuccess
                            )
                        ) {
                            Text("Completar", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (appointment.status == "confirmada") {
                        FilledTonalButton(
                            onClick = { onUpdateStatus("en_curso") },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("En Curso", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickModuleRow(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconColor: Color,
    badge: String? = null,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
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
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(iconColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (badge != null) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFEF4444))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = badge,
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            } else {
                Icon(
                    imageVector = Icons.Filled.ChevronRight,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
