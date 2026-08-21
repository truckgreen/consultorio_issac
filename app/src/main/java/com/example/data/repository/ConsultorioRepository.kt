package com.example.data.repository

import com.example.data.local.dao.AdminReminderDao
import com.example.data.local.dao.AppointmentDao
import com.example.data.local.dao.ClinicalRecordDao
import com.example.data.local.dao.PatientDao
import com.example.data.local.entity.AdminReminder
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.AppointmentStatus
import com.example.data.local.entity.ClinicalRecord
import com.example.data.local.entity.Patient
import com.example.data.local.entity.ReminderType
import kotlinx.coroutines.flow.Flow
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class ConsultorioRepository(
    private val patientDao: PatientDao,
    private val appointmentDao: AppointmentDao,
    private val clinicalRecordDao: ClinicalRecordDao,
    private val adminReminderDao: AdminReminderDao
) {
    // --- Patients ---
    val allPatients: Flow<List<Patient>> = patientDao.getAllPatients()
    val patientCount: Flow<Int> = patientDao.getPatientCount()

    fun getPatientById(id: Long): Flow<Patient?> = patientDao.getPatientById(id)
    suspend fun getPatientByIdSync(id: Long): Patient? = patientDao.getPatientByIdSync(id)
    fun searchPatients(query: String): Flow<List<Patient>> = patientDao.searchPatients(query)
    suspend fun insertPatient(patient: Patient): Long = patientDao.insertPatient(patient)
    suspend fun updatePatient(patient: Patient) = patientDao.updatePatient(patient)
    suspend fun deletePatient(patient: Patient) = patientDao.deletePatient(patient)

    // --- Appointments ---
    val allAppointments: Flow<List<Appointment>> = appointmentDao.getAllAppointments()
    
    fun getAppointmentsForDate(date: String): Flow<List<Appointment>> =
        appointmentDao.getAppointmentsForDate(date)

    fun getAppointmentsForPatient(patientId: Long): Flow<List<Appointment>> =
        appointmentDao.getAppointmentsForPatient(patientId)

    fun getAppointmentsByStatus(status: AppointmentStatus): Flow<List<Appointment>> =
        appointmentDao.getAppointmentsByStatus(status)

    fun getUpcomingAppointments(startDate: String): Flow<List<Appointment>> =
        appointmentDao.getUpcomingAppointments(startDate)

    fun getAppointmentCountForDate(date: String): Flow<Int> =
        appointmentDao.getAppointmentCountForDate(date)

    fun getAttendedCountForDate(date: String): Flow<Int> =
        appointmentDao.getAttendedCountForDate(date)

    suspend fun insertAppointment(appointment: Appointment): Long {
        val id = appointmentDao.insertAppointment(appointment)
        // Automatically schedule an admin reminder for this appointment
        scheduleAdminReminderForAppointment(appointment.copy(id = id))
        return id
    }

    suspend fun updateAppointment(appointment: Appointment) {
        appointmentDao.updateAppointment(appointment)
    }

    suspend fun deleteAppointment(appointment: Appointment) {
        appointmentDao.deleteAppointment(appointment)
    }

    suspend fun updateAppointmentStatus(id: Long, newStatus: AppointmentStatus) {
        appointmentDao.updateStatus(id, newStatus)
    }

    // --- Clinical Records ---
    val allClinicalRecords: Flow<List<ClinicalRecord>> = clinicalRecordDao.getAllRecords()

    fun getClinicalRecordsForPatient(patientId: Long): Flow<List<ClinicalRecord>> =
        clinicalRecordDao.getRecordsForPatient(patientId)

    fun getClinicalRecordById(id: Long): Flow<ClinicalRecord?> =
        clinicalRecordDao.getRecordById(id)

    suspend fun insertClinicalRecord(record: ClinicalRecord): Long =
        clinicalRecordDao.insertRecord(record)

    suspend fun updateClinicalRecord(record: ClinicalRecord) =
        clinicalRecordDao.updateRecord(record)

    suspend fun deleteClinicalRecord(record: ClinicalRecord) =
        clinicalRecordDao.deleteRecord(record)

    // --- Admin Reminders ---
    val allAdminReminders: Flow<List<AdminReminder>> = adminReminderDao.getAllReminders()
    val unreadAdminReminders: Flow<List<AdminReminder>> = adminReminderDao.getUnreadReminders()
    val unreadReminderCount: Flow<Int> = adminReminderDao.getUnreadCount()

    suspend fun insertAdminReminder(reminder: AdminReminder): Long =
        adminReminderDao.insertReminder(reminder)

    suspend fun markReminderAsRead(id: Long) = adminReminderDao.markAsRead(id)
    suspend fun markAllRemindersAsRead() = adminReminderDao.markAllAsRead()
    suspend fun deleteReminder(reminder: AdminReminder) = adminReminderDao.deleteReminder(reminder)
    suspend fun deleteReadReminders() = adminReminderDao.deleteReadReminders()

    private suspend fun scheduleAdminReminderForAppointment(appointment: Appointment) {
        try {
            val dateTimeFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            val appointmentDate = dateTimeFormat.parse("${appointment.date} ${appointment.time}")
            if (appointmentDate != null) {
                val reminderEpoch = appointmentDate.time - (appointment.reminderOffsetMinutes * 60 * 1000L)
                val reminder = AdminReminder(
                    appointmentId = appointment.id,
                    patientId = appointment.patientId,
                    patientName = appointment.patientName,
                    appointmentDate = appointment.date,
                    appointmentTime = appointment.time,
                    type = ReminderType.TURNO_PROXIMO,
                    title = "Recordatorio: Turno ${appointment.time} - ${appointment.patientName}",
                    message = "Paciente ${appointment.patientName} (${appointment.patientPhone}) para ${appointment.specialty} con ${appointment.doctorName}. Motivo: ${appointment.reason}",
                    scheduledEpochMillis = reminderEpoch,
                    isRead = false,
                    isSent = false
                )
                adminReminderDao.insertReminder(reminder)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
