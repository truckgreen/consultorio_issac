package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "patients")
data class Patient(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val dni: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val email: String,
    val birthDate: String, // YYYY-MM-DD
    val gender: String, // Masculino, Femenino, Otro
    val bloodType: String, // A+, A-, B+, B-, AB+, AB-, O+, O-
    val allergies: String, // e.g., Penicilina, Ibuprofeno, Ninguna
    val chronicConditions: String, // e.g., Hipertensión, Diabetes Tipo 2, Asma
    val emergencyContact: String,
    val emergencyPhone: String,
    val address: String,
    val notes: String,
    val createdAt: Long = System.currentTimeMillis()
) {
    val fullName: String
        get() = "$firstName $lastName".trim()
}
