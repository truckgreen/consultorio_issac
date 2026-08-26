package com.example.equilibra.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.equilibra.data.model.MedicalRecordDocument
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Entity(tableName = "patients")
@Serializable
data class PatientEntity(
    @PrimaryKey
    val id: String,
    val nombre: String,
    val apellido: String,
    val cedula: String = "",
    val fechaNacimiento: String = "",
    val genero: String = "No especificado",
    val telefono: String = "",
    val email: String = "",
    val direccion: String = "",
    val ocupacion: String = "",
    val tipoSangre: String = "O+",
    val alergias: String = "Ninguna conocida",
    val antecedentes: String = "Sin antecedentes quirúrgicos relevantes",
    val medicamentos: String = "Ninguno",
    val diagnosticoPrincipal: String = "Evaluación Funcional / En proceso",
    val contactoEmergenciaNombre: String = "",
    val contactoEmergenciaTelefono: String = "",
    val notasFisioterapia: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val documentsJson: String = "[]"
) {
    val fullName: String
        get() = "${nombre.trim()} ${apellido.trim()}".trim()

    val initials: String
        get() {
            val n = nombre.trim()
            val a = apellido.trim()
            return if (n.isNotEmpty() && a.isNotEmpty()) {
                "${n.take(1)}${a.take(1)}".uppercase()
            } else if (n.isNotEmpty()) {
                n.take(2).uppercase()
            } else {
                "EQ"
            }
        }

    fun getDocumentsList(): List<MedicalRecordDocument> {
        return try {
            if (documentsJson.isBlank() || documentsJson == "[]") emptyList()
            else Json { ignoreUnknownKeys = true }.decodeFromString(documentsJson)
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun withUpdatedDocuments(docs: List<MedicalRecordDocument>): PatientEntity {
        val jsonStr = try {
            Json.encodeToString(docs)
        } catch (e: Exception) {
            "[]"
        }
        return this.copy(documentsJson = jsonStr)
    }
}
