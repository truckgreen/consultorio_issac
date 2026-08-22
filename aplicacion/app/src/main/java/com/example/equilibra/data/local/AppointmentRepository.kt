package com.example.equilibra.data.local

import kotlinx.coroutines.flow.Flow

class AppointmentRepository(private val appointmentDao: AppointmentDao) {
    val allAppointments: Flow<List<AppointmentEntity>> = appointmentDao.getAllAppointments()

    suspend fun insert(appointment: AppointmentEntity) {
        appointmentDao.insertAppointment(appointment)
    }

    suspend fun insertAll(appointments: List<AppointmentEntity>) {
        appointmentDao.insertAll(appointments)
    }

    suspend fun update(appointment: AppointmentEntity) {
        appointmentDao.updateAppointment(appointment)
    }

    suspend fun updateStatus(id: String, status: String) {
        appointmentDao.updateStatus(id, status)
    }

    suspend fun deleteById(id: String) {
        appointmentDao.deleteAppointmentById(id)
    }

    suspend fun deleteAll() {
        appointmentDao.deleteAll()
    }
}
