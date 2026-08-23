package com.example.equilibra.data.remote

import android.util.Log
import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.model.ContactLead
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.postgresListDataFlow
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AppointmentRemoteDto(
    @SerialName("id") val id: String,
    @SerialName("code") val code: String = "",
    @SerialName("service_id") val serviceId: String = "fisioterapia",
    @SerialName("service_title") val serviceTitle: String = "Consulta Fisioterapia",
    @SerialName("service_price") val servicePrice: String = "35 USD",
    @SerialName("amount") val amount: Double = 35.0,
    @SerialName("nombre") val nombre: String = "",
    @SerialName("apellido") val apellido: String = "",
    @SerialName("telefono") val telefono: String = "",
    @SerialName("email") val email: String = "",
    @SerialName("fecha") val fecha: String = "",
    @SerialName("hora") val hora: String = "",
    @SerialName("motivo_consulta") val motivoConsulta: String = "",
    @SerialName("primera_visita") val primeraVisita: Boolean = true,
    @SerialName("status") val status: String = "CONFIRMADA",
    @SerialName("specialist_name") val specialistName: String = "Lic. Isaac Jewsiejew",
    @SerialName("notes") val notes: String = "",
    @SerialName("created_at") val createdAt: String? = null
) {
    fun toEntity(): AppointmentEntity {
        return AppointmentEntity(
            id = id,
            code = code,
            serviceId = serviceId,
            serviceTitle = serviceTitle,
            servicePrice = servicePrice,
            nombre = nombre,
            apellido = apellido,
            telefono = telefono,
            email = email,
            fecha = fecha,
            hora = hora,
            motivoConsulta = motivoConsulta,
            primeraVisita = primeraVisita,
            createdAt = System.currentTimeMillis(),
            status = if (status.equals("PENDIENTE", ignoreCase = true)) "pendiente_validacion" else status.lowercase(),
            specialistName = specialistName,
            amount = amount,
            notes = notes
        )
    }

    companion object {
        fun fromEntity(entity: AppointmentEntity): AppointmentRemoteDto {
            return AppointmentRemoteDto(
                id = entity.id,
                code = entity.code,
                serviceId = entity.serviceId,
                serviceTitle = entity.serviceTitle,
                servicePrice = entity.servicePrice,
                amount = entity.amount,
                nombre = entity.nombre,
                apellido = entity.apellido,
                telefono = entity.telefono,
                email = entity.email,
                fecha = entity.fecha,
                hora = entity.hora,
                motivoConsulta = entity.motivoConsulta,
                primeraVisita = entity.primeraVisita,
                status = if (entity.status.equals("pendiente_validacion", ignoreCase = true)) "PENDIENTE" else "CONFIRMADA",
                specialistName = entity.specialistName,
                notes = entity.notes
            )
        }
    }
}

@Serializable
data class ContactMessageRemoteDto(
    @SerialName("id") val id: String = "",
    @SerialName("nombre") val nombre: String = "",
    @SerialName("email") val email: String = "",
    @SerialName("telefono") val telefono: String? = null,
    @SerialName("mensaje") val mensaje: String = "",
    @SerialName("created_at") val createdAt: String? = null
) {
    fun toLead(): ContactLead {
        return ContactLead(
            id = id,
            name = nombre,
            phone = telefono ?: "",
            email = email,
            serviceInterested = "Consulta General",
            message = mensaje,
            date = createdAt?.take(10) ?: "Reciente",
            status = "NUEVO",
            adminNotes = ""
        )
    }
}

class SupabaseAppointmentsDataSource {
    private val client = SupabaseClient.client

    suspend fun fetch(): List<AppointmentEntity> {
        return try {
            val dtoList = client.postgrest["appointments"]
                .select()
                .decodeList<AppointmentRemoteDto>()
            Log.d("Supabase", "Fetched ${dtoList.size} appointments from Supabase")
            dtoList.map { it.toEntity() }
        } catch (e: Exception) {
            Log.e("Supabase", "Error fetching appointments: ${e.message}", e)
            emptyList()
        }
    }

    suspend fun upsert(appointment: AppointmentEntity) {
        try {
            val dto = AppointmentRemoteDto.fromEntity(appointment)
            client.postgrest["appointments"].upsert(dto)
            Log.d("Supabase", "Upserted appointment: ${appointment.code}")
        } catch (e: Exception) {
            Log.e("Supabase", "Error upserting appointment: ${e.message}", e)
        }
    }

    suspend fun updateStatus(id: String, status: String) {
        try {
            val dbStatus = if (status.equals("pendiente_validacion", ignoreCase = true)) "PENDIENTE" else "CONFIRMADA"
            client.postgrest["appointments"].update({
                set("status", dbStatus)
            }) {
                filter {
                    eq("id", id)
                }
            }
            Log.d("Supabase", "Updated status for $id to $dbStatus")
        } catch (e: Exception) {
            Log.e("Supabase", "Error updating status: ${e.message}", e)
        }
    }

    suspend fun delete(id: String) {
        try {
            client.postgrest["appointments"].delete {
                filter {
                    eq("id", id)
                }
            }
            Log.d("Supabase", "Deleted appointment $id from Supabase")
        } catch (e: Exception) {
            Log.e("Supabase", "Error deleting appointment: ${e.message}", e)
        }
    }

    suspend fun observeAppointments(): Flow<List<AppointmentEntity>> {
        val channel = client.realtime.channel("appointments")
        channel.subscribe()
        return channel.postgresListDataFlow(
            schema = "public",
            table = "appointments",
            primaryKey = AppointmentRemoteDto::id
        ).map { dtoList ->
            dtoList.map { it.toEntity() }
        }
    }

    suspend fun fetchContactMessages(): List<ContactLead> {
        return try {
            val messages = client.postgrest["contact_messages"]
                .select()
                .decodeList<ContactMessageRemoteDto>()
            messages.map { it.toLead() }
        } catch (e: Exception) {
            Log.e("Supabase", "Error fetching contact messages: ${e.message}", e)
            emptyList()
        }
    }

    suspend fun deleteContactMessage(id: String) {
        try {
            client.postgrest["contact_messages"].delete {
                filter {
                    eq("id", id)
                }
            }
        } catch (e: Exception) {
            Log.e("Supabase", "Error deleting message: ${e.message}", e)
        }
    }
}
