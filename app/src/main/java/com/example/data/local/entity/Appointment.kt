package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

enum class AppointmentStatus(val label: String) {
    PENDIENTE("Pendiente"),
    CONFIRMADO("Confirmado"),
    EN_CURSO("En Curso"),
    ATENDIDO("Atendido"),
    CANCELADO("Cancelado"),
    NO_ASISTIO("No Asistió")
}

@Entity(
    tableName = "appointments",
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
        Index(value = ["date"]),
        Index(value = ["date", "time"])
    ]
)
data class Appointment(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val patientId: Long,
    val patientName: String,
    val patientPhone: String,
    val date: String, // YYYY-MM-DD
    val time: String, // HH:mm
    val durationMinutes: Int = 30,
    val specialty: String = "Fisioterapia & Rehabilitación",
    val doctorName: String = "Lic. Isaac Rodríguez (Fisioterapeuta)",
    val reason: String,
    val status: AppointmentStatus = AppointmentStatus.PENDIENTE,
    val cost: Double = 0.0,
    val isPaid: Boolean = false,
    val adminNotes: String = "",
    val reminderOffsetMinutes: Int = 60, // 30, 60, 120, 1440
    val reminderSent: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
