package com.example.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
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
import com.example.data.local.entity.Patient

@Composable
fun CreatePatientDialog(
    initialPatient: Patient? = null,
    onDismiss: () -> Unit,
    onConfirm: (Patient) -> Unit
) {
    var firstName by remember { mutableStateOf(initialPatient?.firstName ?: "") }
    var lastName by remember { mutableStateOf(initialPatient?.lastName ?: "") }
    var dni by remember { mutableStateOf(initialPatient?.dni ?: "") }
    var phone by remember { mutableStateOf(initialPatient?.phone ?: "") }
    var email by remember { mutableStateOf(initialPatient?.email ?: "") }
    var birthDate by remember { mutableStateOf(initialPatient?.birthDate ?: "1990-01-01") }
    var gender by remember { mutableStateOf(initialPatient?.gender ?: "Masculino") }
    var bloodType by remember { mutableStateOf(initialPatient?.bloodType ?: "O+") }
    var allergies by remember { mutableStateOf(initialPatient?.allergies ?: "Ninguna") }
    var chronicConditions by remember { mutableStateOf(initialPatient?.chronicConditions ?: "Ninguna") }
    var emergencyContact by remember { mutableStateOf(initialPatient?.emergencyContact ?: "") }
    var emergencyPhone by remember { mutableStateOf(initialPatient?.emergencyPhone ?: "") }
    var address by remember { mutableStateOf(initialPatient?.address ?: "") }
    var notes by remember { mutableStateOf(initialPatient?.notes ?: "") }

    val bloodTypes = listOf("O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-")
    val genders = listOf("Masculino", "Femenino", "Otro")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (initialPatient == null) "Nuevo Paciente" else "Editar Paciente",
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
                // Personal Names
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = firstName,
                            onValueChange = { firstName = it },
                            label = { Text("Nombre *") },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("patient_firstname_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = lastName,
                            onValueChange = { lastName = it },
                            label = { Text("Apellido *") },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("patient_lastname_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                // DNI & Birth Date
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = dni,
                            onValueChange = { dni = it },
                            label = { Text("DNI / Cédula *") },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("patient_dni_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = birthDate,
                            onValueChange = { birthDate = it },
                            label = { Text("Nacimiento (YYYY-MM-DD)") },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("patient_birthdate_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                // Contact Phone & Email
                item {
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Teléfono / WhatsApp *") },
                        placeholder = { Text("+54 9 11 ...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("patient_phone_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Correo Electrónico") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("patient_email_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Gender & Blood Type
                item {
                    Text(
                        text = "Género",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(genders) { g ->
                            FilterChip(
                                selected = gender == g,
                                onClick = { gender = g },
                                label = { Text(g) }
                            )
                        }
                    }
                }

                item {
                    Text(
                        text = "Grupo Sanguíneo",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(bloodTypes) { bt ->
                            FilterChip(
                                selected = bloodType == bt,
                                onClick = { bloodType = bt },
                                label = { Text(bt) }
                            )
                        }
                    }
                }

                // Medical alerts: Allergies & Chronic Conditions
                item {
                    OutlinedTextField(
                        value = allergies,
                        onValueChange = { allergies = it },
                        label = { Text("Alergias Conocidas") },
                        placeholder = { Text("Ej. Penicilina, AINEs, Polen, Ninguna") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("patient_allergies_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = chronicConditions,
                        onValueChange = { chronicConditions = it },
                        label = { Text("Antecedentes / Enfermedades Crónicas") },
                        placeholder = { Text("Ej. Hipertensión, Diabetes, Asma") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("patient_conditions_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Emergency Contact
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = emergencyContact,
                            onValueChange = { emergencyContact = it },
                            label = { Text("Contacto Emergencia") },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("patient_emergency_contact_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = emergencyPhone,
                            onValueChange = { emergencyPhone = it },
                            label = { Text("Tel. Emergencia") },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("patient_emergency_phone_input"),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                item {
                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Domicilio") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("patient_address_input"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Notas Médicas / Observaciones Generales") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("patient_notes_input"),
                        shape = RoundedCornerShape(12.dp),
                        minLines = 2
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (firstName.isNotBlank() && lastName.isNotBlank() && phone.isNotBlank()) {
                        val patient = Patient(
                            id = initialPatient?.id ?: 0L,
                            dni = dni.trim(),
                            firstName = firstName.trim(),
                            lastName = lastName.trim(),
                            phone = phone.trim(),
                            email = email.trim(),
                            birthDate = birthDate.trim(),
                            gender = gender,
                            bloodType = bloodType,
                            allergies = allergies.trim(),
                            chronicConditions = chronicConditions.trim(),
                            emergencyContact = emergencyContact.trim(),
                            emergencyPhone = emergencyPhone.trim(),
                            address = address.trim(),
                            notes = notes.trim()
                        )
                        onConfirm(patient)
                    }
                },
                enabled = firstName.isNotBlank() && lastName.isNotBlank() && phone.isNotBlank(),
                modifier = Modifier.testTag("save_patient_btn")
            ) {
                Text("Guardar Paciente")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_patient_btn")
            ) {
                Text("Cancelar")
            }
        }
    )
}
