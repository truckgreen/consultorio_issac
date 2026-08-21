package com.example.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.local.entity.ClinicalRecord
import com.example.data.local.entity.Patient
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun CreateClinicalRecordDialog(
    patient: Patient,
    initialAppointmentId: Long? = null,
    onDismiss: () -> Unit,
    onConfirm: (ClinicalRecord) -> Unit
) {
    val sdfDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    val sdfTime = SimpleDateFormat("HH:mm", Locale.getDefault())

    var date by remember { mutableStateOf(sdfDate.format(Date())) }
    var time by remember { mutableStateOf(sdfTime.format(Date())) }
    var doctorName by remember { mutableStateOf("Lic. Isaac Rodríguez (Fisioterapeuta)") }
    var specialty by remember { mutableStateOf("Fisioterapia y Rehabilitación") }
    var reason by remember { mutableStateOf("") }
    var symptoms by remember { mutableStateOf("") }
    var vitalSigns by remember { mutableStateOf("EVA Dolor: 6/10 | Zona: Lumbar | Tono muscular: Hipertónico | Movilidad: Limitada") }
    var physicalExam by remember { mutableStateOf("") }
    var diagnosis by remember { mutableStateOf("") }
    var treatment by remember { mutableStateOf("") }
    var prescription by remember { mutableStateOf("") }
    var nextControlDate by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Nueva Sesión / Ficha Fisioterapéutica",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    Text(
                        text = "Paciente: ${patient.fullName} (DNI: ${patient.dni})",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                // Date, Time & Doctor
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = date,
                            onValueChange = { date = it },
                            label = { Text("Fecha") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = time,
                            onValueChange = { time = it },
                            label = { Text("Hora") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                item {
                    OutlinedTextField(
                        value = doctorName,
                        onValueChange = { doctorName = it },
                        label = { Text("Fisioterapeuta / Profesional a cargo") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("record_doctor_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Motivo y Síntomas
                item {
                    OutlinedTextField(
                        value = reason,
                        onValueChange = { reason = it },
                        label = { Text("Motivo de Consulta / Lesión *") },
                        placeholder = { Text("Ej. Dolor lumbar agudo tras esfuerzo físico, postoperatorio LCA, tendinitis manguito rotador") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("record_reason_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = symptoms,
                        onValueChange = { symptoms = it },
                        label = { Text("Anamnesis / Localización del dolor") },
                        placeholder = { Text("Mecanismo de lesión, irradiación, actividades que agravan o alivian el dolor") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        minLines = 2
                    )
                }

                // Parámetros Físicos & Escala EVA
                item {
                    OutlinedTextField(
                        value = vitalSigns,
                        onValueChange = { vitalSigns = it },
                        label = { Text("Escala EVA de Dolor y Parámetros Funcionales") },
                        placeholder = { Text("EVA: 0-10 | Zona anatómica | Flexibilidad | Fuerza muscular (0-5)") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("record_vitals_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = physicalExam,
                        onValueChange = { physicalExam = it },
                        label = { Text("Evaluación Postural / Tests Ortopédicos / ROM") },
                        placeholder = { Text("Rango articular, pruebas ortopédicas específicas, puntos gatillo miofasciales, palpación") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        minLines = 2
                    )
                }

                // Diagnóstico Kinésico & Tratamiento Realizado
                item {
                    OutlinedTextField(
                        value = diagnosis,
                        onValueChange = { diagnosis = it },
                        label = { Text("Diagnóstico Fisioterápico / Funcional *") },
                        placeholder = { Text("Ej. Síndrome de pinzamiento subacromial / Radiculopatía L5-S1 en fase subaguda") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("record_diagnosis_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = treatment,
                        onValueChange = { treatment = it },
                        label = { Text("Tratamiento Realizado en Sesión") },
                        placeholder = { Text("Terapia manual, punción seca, electroterapia TENS/EMS, termoterapia, ejercicios guiados") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        minLines = 2
                    )
                }

                // Pautas y Ejercicios Domiciliarios
                item {
                    OutlinedTextField(
                        value = prescription,
                        onValueChange = { prescription = it },
                        label = { Text("Plan de Ejercicios y Pautas Domiciliarias") },
                        placeholder = { Text("1) Ejercicios de movilidad articular 2 veces al día\n2) Aplicación de frío/calor 15 min\n3) Corrección ergonómica en el trabajo") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("record_prescription_input"),
                        shape = RoundedCornerShape(12.dp),
                        minLines = 3
                    )
                }

                // Próximo Control / Sesión
                item {
                    OutlinedTextField(
                        value = nextControlDate,
                        onValueChange = { nextControlDate = it },
                        label = { Text("Próxima Sesión Programada (Opcional)") },
                        placeholder = { Text("YYYY-MM-DD") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Notas de Evolución y Observaciones") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (reason.isNotBlank() && diagnosis.isNotBlank()) {
                        val record = ClinicalRecord(
                            patientId = patient.id,
                            appointmentId = initialAppointmentId,
                            date = date.trim(),
                            time = time.trim(),
                            doctorName = doctorName.trim(),
                            specialty = specialty,
                            reason = reason.trim(),
                            symptoms = symptoms.trim(),
                            vitalSigns = vitalSigns.trim(),
                            physicalExam = physicalExam.trim(),
                            diagnosis = diagnosis.trim(),
                            treatment = treatment.trim(),
                            prescription = prescription.trim(),
                            nextControlDate = nextControlDate.trim().ifEmpty { null },
                            notes = notes.trim()
                        )
                        onConfirm(record)
                    }
                },
                enabled = reason.isNotBlank() && diagnosis.isNotBlank(),
                modifier = Modifier.testTag("save_clinical_record_btn")
            ) {
                Text("Guardar Sesión en Ficha")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_clinical_record_btn")
            ) {
                Text("Cancelar")
            }
        }
    )
}
