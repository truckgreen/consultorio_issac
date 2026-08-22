package com.example.equilibra.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Entity(tableName = "appointments")
@Serializable
data class AppointmentEntity(
    @PrimaryKey val id: String,
    val code: String,
    val serviceId: String,
    val serviceTitle: String,
    val servicePrice: String,
    val nombre: String,
    val apellido: String,
    val telefono: String,
    val email: String,
    val fecha: String, // YYYY-MM-DD
    val hora: String,
    val motivoConsulta: String,
    val primeraVisita: Boolean,
    val createdAt: Long = System.currentTimeMillis(),
    val status: String = "confirmada",
    val specialistName: String = "Lic. Isaac Jewsiejew",
    val amount: Double = 35.0,
    val notes: String = ""
)
