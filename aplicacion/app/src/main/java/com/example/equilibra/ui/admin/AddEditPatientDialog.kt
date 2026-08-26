package com.example.equilibra.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.equilibra.data.local.PatientEntity
import com.example.equilibra.ui.theme.AmberPrimary
import com.example.equilibra.ui.theme.NavyDark
import com.example.equilibra.ui.theme.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditPatientDialog(
    initialPatient: PatientEntity? = null,
    onDismiss: () -> Unit,
    onSavePatient: (PatientEntity) -> Unit
) {
    val isEditMode = initialPatient != null

    var nombre by remember { mutableStateOf(initialPatient?.nombre.orEmpty()) }
    var apellido by remember { mutableStateOf(initialPatient?.apellido.orEmpty()) }
    var cedula by remember { mutableStateOf(initialPatient?.cedula.orEmpty()) }
    var fechaNacimiento by remember { mutableStateOf(initialPatient?.fechaNacimiento.orEmpty()) }
    var genero by remember { mutableStateOf(initialPatient?.genero?.ifBlank { "Masculino" } ?: "Masculino") }
    var telefono by remember { mutableStateOf(initialPatient?.telefono.orEmpty()) }
    var email by remember { mutableStateOf(initialPatient?.email.orEmpty()) }
    var direccion by remember { mutableStateOf(initialPatient?.direccion.orEmpty()) }
    var ocupacion by remember { mutableStateOf(initialPatient?.ocupacion.orEmpty()) }
    var tipoSangre by remember { mutableStateOf(initialPatient?.tipoSangre?.ifBlank { "O+" } ?: "O+") }
    var alergias by remember { mutableStateOf(initialPatient?.alergias?.ifBlank { "Ninguna conocida" } ?: "Ninguna conocida") }
    var antecedentes by remember { mutableStateOf(initialPatient?.antecedentes?.ifBlank { "Sin antecedentes quirúrgicos relevantes" } ?: "") }
    var medicamentos by remember { mutableStateOf(initialPatient?.medicamentos?.ifBlank { "Ninguno" } ?: "") }
    var diagnosticoPrincipal by remember { mutableStateOf(initialPatient?.diagnosticoPrincipal.orEmpty()) }
    var contactoEmergenciaNombre by remember { mutableStateOf(initialPatient?.contactoEmergenciaNombre.orEmpty()) }
    var contactoEmergenciaTelefono by remember { mutableStateOf(initialPatient?.contactoEmergenciaTelefono.orEmpty()) }
    var notasFisioterapia by remember { mutableStateOf(initialPatient?.notasFisioterapia.orEmpty()) }

    var errorMessage by remember { mutableStateOf<String?>(null) }

    val bloodTypes = listOf("O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-")
    val genderOptions = listOf("Masculino", "Femenino", "Otro")

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
                .fillMaxHeight(0.92f)
                .testTag("add_edit_patient_dialog")
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
                                .background(if (isEditMode) AmberPrimary else TealPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isEditMode) Icons.Filled.EditNote else Icons.Filled.PersonAdd,
                                contentDescription = null,
                                tint = NavyDark,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Column {
                            Text(
                                text = if (isEditMode) "Editar Paciente" else "Registrar Nuevo Paciente",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Directorio Clínico • EQUILIBRA",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
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
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // SECTION 1: Personal Data
                    item {
                        Text(
                            text = "1. DATOS PERSONALES & IDENTIFICACIÓN",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black),
                            color = TealPrimary
                        )
                    }

                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = nombre,
                                onValueChange = { nombre = it },
                                label = { Text("Nombres *") },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("patient_input_nombre")
                            )
                            OutlinedTextField(
                                value = apellido,
                                onValueChange = { apellido = it },
                                label = { Text("Apellidos *") },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("patient_input_apellido")
                            )
                        }
                    }

                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = cedula,
                                onValueChange = { cedula = it },
                                label = { Text("Cédula / DNI *") },
                                placeholder = { Text("V-12.345.678") },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("patient_input_cedula")
                            )
                            OutlinedTextField(
                                value = fechaNacimiento,
                                onValueChange = { fechaNacimiento = it },
                                label = { Text("F. Nacimiento") },
                                placeholder = { Text("YYYY-MM-DD") },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("patient_input_dob")
                            )
                        }
                    }

                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Género:", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                genderOptions.forEach { gen ->
                                    val isSelected = genero == gen
                                    FilterChip(
                                        selected = isSelected,
                                        onClick = { genero = gen },
                                        label = { Text(gen) },
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                }
                            }
                        }
                    }

                    // SECTION 2: Contact
                    item {
                        Text(
                            text = "2. CONTACTO Y LOCALIZACIÓN",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black),
                            color = TealPrimary
                        )
                    }

                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = telefono,
                                onValueChange = { telefono = it },
                                label = { Text("Teléfono / WhatsApp *") },
                                placeholder = { Text("+58 414-1234567") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("patient_input_telefono")
                            )
                            OutlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                label = { Text("Correo Electrónico") },
                                placeholder = { Text("paciente@email.com") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("patient_input_email")
                            )
                        }
                    }

                    item {
                        OutlinedTextField(
                            value = direccion,
                            onValueChange = { direccion = it },
                            label = { Text("Dirección / Zona de Residencia") },
                            placeholder = { Text("Caracas, Sabana Grande, etc.") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = ocupacion,
                            onValueChange = { ocupacion = it },
                            label = { Text("Ocupación / Disciplina Deportiva") },
                            placeholder = { Text("Ingeniero / Corredor / Estudiante") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // SECTION 3: Clinical & Medical Info
                    item {
                        Text(
                            text = "3. INFORMACIÓN CLÍNICA & ANTECEDENTES",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black),
                            color = AmberPrimary
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = diagnosticoPrincipal,
                            onValueChange = { diagnosticoPrincipal = it },
                            label = { Text("Diagnóstico Principal / Motivo de Consulta *") },
                            placeholder = { Text("Ej: Lumbalgia mecánica, Rotura LCA, Esguince tobillo...") },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("patient_input_diagnostico")
                        )
                    }

                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Tipo de Sangre:", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                bloodTypes.forEach { bt ->
                                    val isSelected = tipoSangre == bt
                                    FilterChip(
                                        selected = isSelected,
                                        onClick = { tipoSangre = bt },
                                        label = { Text(bt, fontSize = 11.sp) },
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                }
                            }
                        }
                    }

                    item {
                        OutlinedTextField(
                            value = alergias,
                            onValueChange = { alergias = it },
                            label = { Text("Alergias a Medicamentos / Alimentos") },
                            placeholder = { Text("Penicilina, AINEs, Ninguna conocida...") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = antecedentes,
                            onValueChange = { antecedentes = it },
                            label = { Text("Antecedentes Médicos / Cirugías Previas") },
                            placeholder = { Text("Cirugías, fracturas, hipertensión, diabetes...") },
                            minLines = 2,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = medicamentos,
                            onValueChange = { medicamentos = it },
                            label = { Text("Medicamentos Actuales") },
                            placeholder = { Text("Analgésicos, suplementos, antiinflamatorios...") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // SECTION 4: Emergency Contact
                    item {
                        Text(
                            text = "4. CONTACTO DE EMERGENCIA",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black),
                            color = TealPrimary
                        )
                    }

                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = contactoEmergenciaNombre,
                                onValueChange = { contactoEmergenciaNombre = it },
                                label = { Text("Nombre y Parentesco") },
                                placeholder = { Text("María (Madre/Esposa)") },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = contactoEmergenciaTelefono,
                                onValueChange = { contactoEmergenciaTelefono = it },
                                label = { Text("Teléfono de Emergencia") },
                                placeholder = { Text("+58 412-1234567") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // SECTION 5: Notes
                    item {
                        Text(
                            text = "5. NOTAS CLÍNICAS & PLAN DE FISIOTERAPIA",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black),
                            color = TealPrimary
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = notasFisioterapia,
                            onValueChange = { notasFisioterapia = it },
                            label = { Text("Observaciones del Especialista") },
                            placeholder = { Text("Protocolo terapéutico, evolución de arcos y fuerza, objetivos...") },
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
                            if (nombre.isBlank() || apellido.isBlank()) {
                                errorMessage = "Por favor ingresa los nombres y apellidos del paciente."
                                return@Button
                            }
                            if (telefono.isBlank()) {
                                errorMessage = "Por favor ingresa un número de teléfono de contacto."
                                return@Button
                            }

                            val patientToSave = (initialPatient ?: PatientEntity(
                                id = "pat_${System.currentTimeMillis()}",
                                nombre = nombre.trim(),
                                apellido = apellido.trim()
                            )).copy(
                                nombre = nombre.trim(),
                                apellido = apellido.trim(),
                                cedula = cedula.trim(),
                                fechaNacimiento = fechaNacimiento.trim(),
                                genero = genero,
                                telefono = telefono.trim(),
                                email = email.trim(),
                                direccion = direccion.trim(),
                                ocupacion = ocupacion.trim(),
                                tipoSangre = tipoSangre,
                                alergias = alergias.trim().ifEmpty { "Ninguna conocida" },
                                antecedentes = antecedentes.trim().ifEmpty { "Sin antecedentes relevantes" },
                                medicamentos = medicamentos.trim().ifEmpty { "Ninguno" },
                                diagnosticoPrincipal = diagnosticoPrincipal.trim().ifEmpty { "Evaluación Funcional" },
                                contactoEmergenciaNombre = contactoEmergenciaNombre.trim(),
                                contactoEmergenciaTelefono = contactoEmergenciaTelefono.trim(),
                                notasFisioterapia = notasFisioterapia.trim()
                            )

                            onSavePatient(patientToSave)
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isEditMode) AmberPrimary else TealPrimary,
                            contentColor = NavyDark
                        ),
                        modifier = Modifier
                            .weight(1.5f)
                            .testTag("save_patient_button")
                    ) {
                        Icon(Icons.Filled.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isEditMode) "Guardar Cambios" else "Registrar Paciente",
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
