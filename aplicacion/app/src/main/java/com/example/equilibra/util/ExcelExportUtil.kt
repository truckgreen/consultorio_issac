package com.example.equilibra.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.local.PatientEntity
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStreamWriter
import java.text.SimpleDateFormat
import java.util.*

object ExcelExportUtil {

    private fun sanitizeCsv(value: Any?): String {
        if (value == null) return "\"\""
        val str = value.toString().replace("\"", "\"\"").replace("\n", " ").replace("\r", "")
        return "\"$str\""
    }

    fun generateExcelCsvContent(
        appointments: List<AppointmentEntity>,
        patients: List<PatientEntity>
    ): String {
        val sb = StringBuilder()
        val nowFormatted = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())

        // UTF-8 BOM for Microsoft Excel compatibility
        sb.append("\uFEFF")

        // Header Banner
        sb.append("=== REPORTE CLINICO GENERAL - CENTRO DE FISIOTERAPIA Y SALUD INTEGRAL EQUILIBRA ===\n")
        sb.append("Fecha de generacion:;").append(sanitizeCsv(nowFormatted)).append("\n")
        sb.append("Sede:;\"Sabana Grande, Centro Profesional del Este, Piso 4, Ofic. 46, Caracas, Venezuela\"\n")
        sb.append("Contacto:;\"+58 424-2724617 / contacto@equilibrave.com\"\n\n")

        // SECTION 1: APPOINTMENTS
        sb.append("=== 1. LISTADO GENERAL DE CITAS Y CONSULTAS ===\n")
        sb.append(
            listOf(
                "Codigo Cita",
                "Fecha Cita",
                "Horario",
                "Paciente Nombre",
                "Paciente Apellido",
                "Telefono",
                "Email",
                "Servicio Clinico",
                "Especialista Asignado",
                "Estado Cita",
                "Monto (USD)",
                "Primera Visita",
                "Motivo de Consulta",
                "Notas Clinicas / Admin",
                "Fecha Registro"
            ).joinToString(";") { sanitizeCsv(it) }
        ).append("\n")

        if (appointments.isEmpty()) {
            sb.append("\"Sin citas registradas actualmente en el sistema\";;;;;;;;;;;;;;\n")
        } else {
            appointments.forEach { app ->
                val dateCreated = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(Date(app.createdAt))
                sb.append(
                    listOf(
                        app.code,
                        app.fecha,
                        app.hora,
                        app.nombre,
                        app.apellido,
                        app.telefono,
                        app.email,
                        app.serviceTitle,
                        app.specialistName,
                        app.status.uppercase(),
                        "$${app.amount.toInt()}",
                        if (app.primeraVisita) "SI" else "NO",
                        app.motivoConsulta,
                        app.notes,
                        dateCreated
                    ).joinToString(";") { sanitizeCsv(it) }
                ).append("\n")
            }
        }
        sb.append("\n\n")

        // SECTION 2: PATIENTS DIRECTORY
        sb.append("=== 2. DIRECTORIO CLINICO DE PACIENTES ===\n")
        sb.append(
            listOf(
                "ID Paciente",
                "Nombres",
                "Apellidos",
                "Cedula / DNI",
                "Fecha Nacimiento",
                "Genero",
                "Telefono",
                "Correo Electronico",
                "Direccion",
                "Ocupacion",
                "Tipo de Sangre",
                "Alergias",
                "Antecedentes Medicos",
                "Medicamentos Actuales",
                "Diagnostico Principal",
                "Contacto Emergencia (Nombre)",
                "Contacto Emergencia (Telefono)",
                "Notas Fisioterapia",
                "Documentos PDF Adjuntos",
                "Fecha Registro"
            ).joinToString(";") { sanitizeCsv(it) }
        ).append("\n")

        if (patients.isEmpty()) {
            sb.append("\"Sin pacientes registrados actualmente\";;;;;;;;;;;;;;;;;;;\n")
        } else {
            patients.forEach { pat ->
                val dateCreated = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(Date(pat.createdAt))
                val docCount = pat.getDocumentsList().size
                sb.append(
                    listOf(
                        pat.id,
                        pat.nombre,
                        pat.apellido,
                        pat.cedula,
                        pat.fechaNacimiento,
                        pat.genero,
                        pat.telefono,
                        pat.email,
                        pat.direccion,
                        pat.ocupacion,
                        pat.tipoSangre,
                        pat.alergias,
                        pat.antecedentes,
                        pat.medicamentos,
                        pat.diagnosticoPrincipal,
                        pat.contactoEmergenciaNombre,
                        pat.contactoEmergenciaTelefono,
                        pat.notasFisioterapia,
                        "$docCount documentos",
                        dateCreated
                    ).joinToString(";") { sanitizeCsv(it) }
                ).append("\n")
            }
        }
        sb.append("\n\n")

        // SECTION 3: MEDICAL PDF DOCUMENTS
        sb.append("=== 3. EXPEDIENTES Y DOCUMENTOS MEDICOS PDF ===\n")
        sb.append(
            listOf(
                "ID Documento",
                "Paciente",
                "Titulo Documento",
                "Categoria",
                "Nombre Archivo",
                "Tamano",
                "Fecha Emision",
                "Especialista Emisor",
                "Observaciones Clinicas"
            ).joinToString(";") { sanitizeCsv(it) }
        ).append("\n")

        var totalDocs = 0
        patients.forEach { pat ->
            pat.getDocumentsList().forEach { doc ->
                totalDocs++
                sb.append(
                    listOf(
                        doc.id,
                        pat.fullName,
                        doc.title,
                        doc.category.uppercase(),
                        doc.fileName,
                        doc.fileSize,
                        doc.uploadDate,
                        doc.doctorName ?: "EQUILIBRA",
                        doc.notes ?: ""
                    ).joinToString(";") { sanitizeCsv(it) }
                ).append("\n")
            }
        }
        if (totalDocs == 0) {
            sb.append("\"No hay documentos medicos PDF adjuntos\";;;;;;;;\n")
        }
        sb.append("\n\n")

        // SECTION 4: CLINICAL AND FINANCIAL SUMMARY
        val totalRevenue = appointments.filter { it.status != "cancelada" }.sumOf { it.amount }
        val confirmedCount = appointments.count { it.status == "confirmada" }
        val completedCount = appointments.count { it.status == "completada" }
        val canceledCount = appointments.count { it.status == "cancelada" }
        val pendingCount = appointments.count { it.status.startsWith("pendiente") }

        sb.append("=== 4. RESUMEN ESTADISTICO Y FINANCIERO ===\n")
        sb.append("Metrica;Valor\n")
        sb.append("Total de Citas Registradas;").append(appointments.size).append("\n")
        sb.append("Citas Confirmadas;").append(confirmedCount).append("\n")
        sb.append("Citas Completadas;").append(completedCount).append("\n")
        sb.append("Citas Pendientes de Validacion;").append(pendingCount).append("\n")
        sb.append("Citas Canceladas;").append(canceledCount).append("\n")
        sb.append("Total Pacientes en Ficha;").append(patients.size).append("\n")
        sb.append("Total Documentos PDF en Expedientes;").append(totalDocs).append("\n")
        sb.append("Ingresos Estimados Totales (USD);\"$").append(totalRevenue.toInt()).append("\"\n")

        return sb.toString()
    }

    fun exportAndShareExcel(
        context: Context,
        appointments: List<AppointmentEntity>,
        patients: List<PatientEntity>,
        onSuccess: (File) -> Unit,
        onError: (String) -> Unit
    ) {
        try {
            val content = generateExcelCsvContent(appointments, patients)
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmm", Locale.getDefault()).format(Date())
            val fileName = "EQUILIBRA_BaseDatos_$timeStamp.csv"

            // Save file in cache directory
            val exportDir = File(context.cacheDir, "exports")
            if (!exportDir.exists()) exportDir.mkdirs()
            val file = File(exportDir, fileName)

            FileOutputStream(file).use { fos ->
                OutputStreamWriter(fos, Charsets.UTF_8).use { osw ->
                    osw.write(content)
                    osw.flush()
                }
            }

            val fileUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/comma-separated-values"
                putExtra(Intent.EXTRA_STREAM, fileUri)
                putExtra(Intent.EXTRA_SUBJECT, "Base de Datos EQUILIBRA - $timeStamp")
                putExtra(
                    Intent.EXTRA_TEXT,
                    "Adjunto reporte de Base de Datos y Expedientes Clínicos del Centro EQUILIBRA generado el ${SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(Date())}."
                )
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            val chooser = Intent.createChooser(shareIntent, "Descargar / Compartir Base de Datos (Excel)")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(chooser)

            onSuccess(file)
        } catch (e: Exception) {
            onError(e.message ?: "Error al exportar base de datos a Excel")
        }
    }
}
