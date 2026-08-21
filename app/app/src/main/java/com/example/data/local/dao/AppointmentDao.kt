package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.AppointmentStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface AppointmentDao {
    @Query("SELECT * FROM appointments ORDER BY date DESC, time ASC")
    fun getAllAppointments(): Flow<List<Appointment>>

    @Query("SELECT * FROM appointments WHERE id = :id LIMIT 1")
    fun getAppointmentById(id: Long): Flow<Appointment?>

    @Query("SELECT * FROM appointments WHERE id = :id LIMIT 1")
    suspend fun getAppointmentByIdSync(id: Long): Appointment?

    @Query("SELECT * FROM appointments WHERE date = :date ORDER BY time ASC")
    fun getAppointmentsForDate(date: String): Flow<List<Appointment>>

    @Query("SELECT * FROM appointments WHERE patientId = :patientId ORDER BY date DESC, time DESC")
    fun getAppointmentsForPatient(patientId: Long): Flow<List<Appointment>>

    @Query("SELECT * FROM appointments WHERE status = :status ORDER BY date ASC, time ASC")
    fun getAppointmentsByStatus(status: AppointmentStatus): Flow<List<Appointment>>

    @Query("SELECT * FROM appointments WHERE date >= :startDate ORDER BY date ASC, time ASC")
    fun getUpcomingAppointments(startDate: String): Flow<List<Appointment>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAppointment(appointment: Appointment): Long

    @Update
    suspend fun updateAppointment(appointment: Appointment)

    @Delete
    suspend fun deleteAppointment(appointment: Appointment)

    @Query("UPDATE appointments SET status = :newStatus WHERE id = :id")
    suspend fun updateStatus(id: Long, newStatus: AppointmentStatus)

    @Query("UPDATE appointments SET reminderSent = :sent WHERE id = :id")
    suspend fun updateReminderSent(id: Long, sent: Boolean)

    @Query("SELECT COUNT(*) FROM appointments WHERE date = :date")
    fun getAppointmentCountForDate(date: String): Flow<Int>

    @Query("SELECT COUNT(*) FROM appointments WHERE date = :date AND status = 'ATENDIDO'")
    fun getAttendedCountForDate(date: String): Flow<Int>
}
