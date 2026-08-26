package com.example.equilibra.data.local

import kotlinx.coroutines.flow.Flow

class PatientRepository(private val patientDao: PatientDao) {

    val allPatients: Flow<List<PatientEntity>> = patientDao.getAllPatients()

    suspend fun getPatientById(id: String): PatientEntity? {
        return patientDao.getPatientById(id)
    }

    suspend fun getPatientByName(nombre: String, apellido: String): PatientEntity? {
        return patientDao.getPatientByName(nombre.trim(), apellido.trim())
    }

    suspend fun insert(patient: PatientEntity) {
        patientDao.insertPatient(patient)
    }

    suspend fun insertAll(patients: List<PatientEntity>) {
        patientDao.insertAll(patients)
    }

    suspend fun update(patient: PatientEntity) {
        patientDao.updatePatient(patient)
    }

    suspend fun deleteById(id: String) {
        patientDao.deletePatientById(id)
    }

    suspend fun deleteAll() {
        patientDao.deleteAll()
    }
}
