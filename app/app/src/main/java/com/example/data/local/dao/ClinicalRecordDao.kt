package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.ClinicalRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface ClinicalRecordDao {
    @Query("SELECT * FROM clinical_records WHERE patientId = :patientId ORDER BY date DESC, time DESC")
    fun getRecordsForPatient(patientId: Long): Flow<List<ClinicalRecord>>

    @Query("SELECT * FROM clinical_records WHERE id = :id LIMIT 1")
    fun getRecordById(id: Long): Flow<ClinicalRecord?>

    @Query("SELECT * FROM clinical_records ORDER BY date DESC, time DESC")
    fun getAllRecords(): Flow<List<ClinicalRecord>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: ClinicalRecord): Long

    @Update
    suspend fun updateRecord(record: ClinicalRecord)

    @Delete
    suspend fun deleteRecord(record: ClinicalRecord)

    @Query("SELECT COUNT(*) FROM clinical_records WHERE patientId = :patientId")
    fun getRecordCountForPatient(patientId: Long): Flow<Int>
}
