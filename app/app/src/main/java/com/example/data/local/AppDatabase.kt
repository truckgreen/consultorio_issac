package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.data.local.dao.AdminReminderDao
import com.example.data.local.dao.AppointmentDao
import com.example.data.local.dao.ClinicalRecordDao
import com.example.data.local.dao.PatientDao
import com.example.data.local.entity.AdminReminder
import com.example.data.local.entity.Appointment
import com.example.data.local.entity.ClinicalRecord
import com.example.data.local.entity.Patient
import kotlinx.coroutines.CoroutineScope

@Database(
    entities = [
        Patient::class,
        Appointment::class,
        ClinicalRecord::class,
        AdminReminder::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun patientDao(): PatientDao
    abstract fun appointmentDao(): AppointmentDao
    abstract fun clinicalRecordDao(): ClinicalRecordDao
    abstract fun adminReminderDao(): AdminReminderDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "equilibra_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
