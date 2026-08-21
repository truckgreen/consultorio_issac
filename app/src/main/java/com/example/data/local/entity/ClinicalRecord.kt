package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "clinical_records",
    foreignKeys = [
        ForeignKey(
            entity = Patient::class,
            parentColumns = ["id"],
            childColumns = ["patientId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["patientId"]),
        Index(value = ["date"])
    ]
)
data class ClinicalRecord(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val patientId: Long,
    val appointmentId: Long? = null,
    val date: String, // YYYY-MM-DD
    val time: String, // HH:mm
    val doctorName: String = "Lic. Isaac Rodríguez (Fisioterapeuta)",
    val specialty: String = "Fisioterapia & Rehabilitación",
    val reason: String,
    val symptoms: String,
    val vitalSigns: String, // e.g. "PA: 120/80 mmHg | FC: 72 lpm | T: 36.6 °C | SpO2: 98% | Peso: 72kg"
    val physicalExam: String,
    val diagnosis: String,
    val treatment: String,
    val prescription: String, // Medicamentos, dosis e indicaciones
    val nextControlDate: String? = null, // YYYY-MM-DD
    val notes: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
