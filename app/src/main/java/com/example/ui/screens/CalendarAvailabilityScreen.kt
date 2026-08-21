package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.EventBusy
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.AppointmentStatus
import com.example.ui.components.PatientQuickContactRow
import com.example.ui.components.StatusBadge
import com.example.ui.viewmodel.ConsultorioViewModel
import com.example.ui.viewmodel.TimeSlot
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@Composable
fun CalendarAvailabilityScreen(
    viewModel: ConsultorioViewModel,
    onPatientClick: (Long) -> Unit,
    onBookSlotClicked: (time: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val selectedDate by viewModel.selectedDate.collectAsStateWithLifecycle()
    val availability by viewModel.dayAvailability.collectAsStateWithLifecycle()

    val sdfDisplay = SimpleDateFormat("EEEE, d 'de' MMMM yyyy", Locale("es", "ES"))
    val sdfDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    val currentDateCal = remember(selectedDate) {
        Calendar.getInstance().apply {
            try {
                time = sdfDate.parse(selectedDate) ?: Date()
            } catch (e: Exception) {
                time = Date()
            }
        }
    }

    val formattedDateText = remember(selectedDate) {
        try {
            val d = sdfDate.parse(selectedDate) ?: Date()
            sdfDisplay.format(d).replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale("es", "ES")) else it.toString() }
        } catch (e: Exception) {
            selectedDate
        }
    }

    // Days selector list (current week + surrounding days)
    val dayPickerDays = remember(selectedDate) {
        (-3..7).map { offset ->
            val cal = Calendar.getInstance().apply {
                try {
                    time = sdfDate.parse(selectedDate) ?: Date()
                } catch (e: Exception) {
                    time = Date()
                }
                add(Calendar.DAY_OF_YEAR, offset)
            }
            val dateStr = sdfDate.format(cal.time)
            val dayName = SimpleDateFormat("EEE", Locale("es", "ES")).format(cal.time).uppercase()
            val dayNum = SimpleDateFormat("dd", Locale.getDefault()).format(cal.time)
            Triple(dateStr, dayName, dayNum)
        }
    }

    var selectedDoctorFilter by remember { mutableStateOf<String?>(null) }
    val doctors = listOf("Todos", "Lic. Isaac Rodríguez", "Lic. Elena Morales", "Lic. Martín Benítez", "Lic. Sofía Navarro")

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header & Date Navigator
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = {
                                val cal = Calendar.getInstance().apply {
                                    time = sdfDate.parse(selectedDate) ?: Date()
                                    add(Calendar.DAY_OF_YEAR, -1)
                                }
                                viewModel.setSelectedDate(sdfDate.format(cal.time))
                            },
                            modifier = Modifier.testTag("prev_day_btn")
                        ) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Día Anterior")
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "Disponibilidad Diaria",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = formattedDateText,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        IconButton(
                            onClick = {
                                val cal = Calendar.getInstance().apply {
                                    time = sdfDate.parse(selectedDate) ?: Date()
                                    add(Calendar.DAY_OF_YEAR, 1)
                                }
                                viewModel.setSelectedDate(sdfDate.format(cal.time))
                            },
                            modifier = Modifier.testTag("next_day_btn")
                        ) {
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Día Siguiente")
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Horizontal Days Carousel
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(dayPickerDays) { (dateStr, dayName, dayNum) ->
                            val isSelected = dateStr == selectedDate
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface,
                                border = BorderStroke(
                                    width = if (isSelected) 1.5.dp else 1.dp,
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
                                ),
                                shadowElevation = if (isSelected) 2.dp else 0.dp,
                                modifier = Modifier
                                    .clickable { viewModel.setSelectedDate(dateStr) }
                                    .testTag("date_chip_$dateStr")
                            ) {
                                Column(
                                    modifier = Modifier
                                        .width(48.dp)
                                        .padding(vertical = 12.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    Text(
                                        text = dayName,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Medium,
                                        color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = dayNum,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
                                    )
                                    if (isSelected) {
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(MaterialTheme.colorScheme.primary)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Occupancy & Capacity Metrics
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Estado de Ocupación del Día",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${availability.occupancyPercentage}% Ocupado",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = if (availability.occupancyPercentage > 80) Color(0xFFD32F2F) else MaterialTheme.colorScheme.primary
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { availability.occupancyPercentage / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.surfaceVariant,
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(Color(0xFF2E7D32)))
                            Text(
                                text = "${availability.availableSlots} Horarios Libres",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(MaterialTheme.colorScheme.primary))
                            Text(
                                text = "${availability.bookedSlots} Turnos Reservados",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }

        // Doctor Filter Chips
        item {
            Text(
                text = "Filtrar por Profesional",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(doctors) { doc ->
                    val isSelected = (selectedDoctorFilter == null && doc == "Todos") || (selectedDoctorFilter == doc)
                    FilterChip(
                        selected = isSelected,
                        onClick = {
                            selectedDoctorFilter = if (doc == "Todos") null else doc
                        },
                        label = { Text(doc) },
                        modifier = Modifier.testTag("filter_doc_${doc.replace(" ", "_")}")
                    )
                }
            }
        }

        // Timeline Schedule Slots
        item {
            Text(
                text = "Grilla de Horarios y Turnos",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        val filteredSlots = availability.slots.filter { slot ->
            if (selectedDoctorFilter == null) true
            else slot.appointment == null || slot.appointment.doctorName == selectedDoctorFilter
        }

        items(filteredSlots) { slot ->
            TimeSlotRowCard(
                slot = slot,
                onBookSlot = { onBookSlotClicked(slot.time) },
                onPatientClick = {
                    slot.appointment?.patientId?.let { onPatientClick(it) }
                },
                onStatusChange = { newStatus ->
                    slot.appointment?.id?.let { id ->
                        viewModel.updateAppointmentStatus(id, newStatus)
                    }
                }
            )
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun TimeSlotRowCard(
    slot: TimeSlot,
    onBookSlot: () -> Unit,
    onPatientClick: () -> Unit,
    onStatusChange: (AppointmentStatus) -> Unit,
    modifier: Modifier = Modifier
) {
    if (slot.isAvailable) {
        // Free Slot
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = modifier
                .fillMaxWidth()
                .testTag("slot_free_${slot.time}")
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = slot.time,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }

                    Surface(
                        color = Color(0xFFE8F5E9),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "DISPONIBLE",
                            color = Color(0xFF2E7D32),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                OutlinedButton(
                    onClick = onBookSlot,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.testTag("book_slot_btn_${slot.time}")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Agendar Turno", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    } else {
        // Booked Slot
        val apt = slot.appointment!!
        ElevatedCard(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = modifier
                .fillMaxWidth()
                .testTag("slot_booked_${slot.time}")
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Surface(
                            color = MaterialTheme.colorScheme.primaryContainer,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = slot.time,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }

                        Column {
                            Text(
                                text = apt.patientName,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.clickable { onPatientClick() }
                            )
                            Text(
                                text = "${apt.specialty} • ${apt.doctorName}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    StatusBadge(status = apt.status)
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Motivo: ${apt.reason}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    PatientQuickContactRow(
                        patientPhone = apt.patientPhone,
                        patientEmail = "",
                        patientName = apt.patientName,
                        appointmentDate = apt.date,
                        appointmentTime = apt.time
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        if (apt.status != AppointmentStatus.ATENDIDO) {
                            Button(
                                onClick = { onStatusChange(AppointmentStatus.ATENDIDO) },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.testTag("mark_attended_${apt.id}")
                            ) {
                                Text("Atendido ✓", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                }
            }
        }
    }
}
