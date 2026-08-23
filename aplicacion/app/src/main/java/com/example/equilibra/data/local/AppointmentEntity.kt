package com.example.equilibra.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Entity(tableName = "appointments")
@Serializable
data class AppointmentEntity(
    @PrimaryKey 
    @SerialName("id") 
    val id: String,
    
    @SerialName("code") 
    val code: String = "",
    
    @SerialName("service_id") 
    val serviceId: String = "fisioterapia",
    
    @SerialName("service_title") 
    val serviceTitle: String = "Consulta Fisioterapia",
    
    @SerialName("service_price") 
    val servicePrice: String = "35 USD",
    
    @SerialName("nombre") 
    val nombre: String = "",
    
    @SerialName("apellido") 
    val apellido: String = "",
    
    @SerialName("telefono") 
    val telefono: String = "",
    
    @SerialName("email") 
    val email: String = "",
    
    @SerialName("fecha") 
    val fecha: String = "", // YYYY-MM-DD
    
    @SerialName("hora") 
    val hora: String = "",
    
    @SerialName("motivo_consulta") 
    val motivoConsulta: String = "",
    
    @SerialName("primera_visita") 
    val primeraVisita: Boolean = true,
    
    val createdAt: Long = System.currentTimeMillis(),
    
    @SerialName("status") 
    val status: String = "confirmada",
    
    @SerialName("specialist_name") 
    val specialistName: String = "Lic. Isaac Jewsiejew",
    
    @SerialName("amount") 
    val amount: Double = 35.0,
    
    @SerialName("notes") 
    val notes: String = ""
)
