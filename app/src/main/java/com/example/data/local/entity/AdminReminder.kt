package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class ReminderType(val label: String) {
    TURNO_PROXIMO("Turno Próximo"),
    CONFIRMACION_PENDIENTE("Confirmación Pendiente"),
    ALERTA_DISPONIBILIDAD("Disponibilidad"),
    SEGUIMIENTO_PACIENTE("Control / Seguimiento")
}

@Entity(tableName = "admin_reminders")
data class AdminReminder(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val appointmentId: Long? = null,
    val patientId: Long? = null,
    val patientName: String,
    val appointmentDate: String,
    val appointmentTime: String,
    val type: ReminderType = ReminderType.TURNO_PROXIMO,
    val title: String,
    val message: String,
    val scheduledEpochMillis: Long,
    val isRead: Boolean = false,
    val isSent: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
