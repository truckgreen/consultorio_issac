package com.example.equilibra.data.remote

import com.example.equilibra.data.local.AppointmentEntity
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.realtime.PostgresAction
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.decodeRecord
import io.github.jan.supabase.realtime.postgresListDataFlow
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class SupabaseAppointmentsDataSource {
    private val client = SupabaseClient.client

    suspend fun fetch(): List<AppointmentEntity> {
        return try {
            client.postgrest["appointments"].select().decodeList<AppointmentEntity>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun upsert(appointment: AppointmentEntity) {
        try {
            client.postgrest["appointments"].upsert(appointment)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun updateStatus(id: String, status: String) {
        try {
            client.postgrest["appointments"].update({
                set("status", status.uppercase())
            }) {
                filter {
                    eq("id", id)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun delete(id: String) {
        try {
            client.postgrest["appointments"].delete {
                filter {
                    eq("id", id)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun observeAppointments(): Flow<List<AppointmentEntity>> {
        val channel = client.realtime.channel("appointments")
        channel.subscribe()
        return channel.postgresListDataFlow(
            schema = "public",
            table = "appointments",
            primaryKey = AppointmentEntity::id
        )
    }
}
