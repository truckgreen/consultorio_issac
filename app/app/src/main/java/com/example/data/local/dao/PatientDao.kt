package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.Patient
import kotlinx.coroutines.flow.Flow

@Dao
interface PatientDao {
    @Query("SELECT * FROM patients ORDER BY lastName ASC, firstName ASC")
    fun getAllPatients(): Flow<List<Patient>>

    @Query("SELECT * FROM patients WHERE id = :id LIMIT 1")
    fun getPatientById(id: Long): Flow<Patient?>

    @Query("SELECT * FROM patients WHERE id = :id LIMIT 1")
    suspend fun getPatientByIdSync(id: Long): Patient?

    @Query("SELECT * FROM patients WHERE firstName LIKE '%' || :query || '%' OR lastName LIKE '%' || :query || '%' OR dni LIKE '%' || :query || '%' OR phone LIKE '%' || :query || '%' ORDER BY lastName ASC")
    fun searchPatients(query: String): Flow<List<Patient>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPatient(patient: Patient): Long

    @Update
    suspend fun updatePatient(patient: Patient)

    @Delete
    suspend fun deletePatient(patient: Patient)

    @Query("SELECT COUNT(*) FROM patients")
    fun getPatientCount(): Flow<Int>
}
