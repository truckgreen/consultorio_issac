package com.example

import android.app.Application
import com.example.data.local.AppDatabase
import com.example.data.repository.ConsultorioRepository
import com.example.notifications.NotificationHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob

class ConsultorioApp : Application() {
    val applicationScope = CoroutineScope(SupervisorJob())

    val database by lazy { AppDatabase.getDatabase(this, applicationScope) }
    val repository by lazy {
        ConsultorioRepository(
            database.patientDao(),
            database.appointmentDao(),
            database.clinicalRecordDao(),
            database.adminReminderDao()
        )
    }

    lateinit var notificationHelper: NotificationHelper
        private set

    override fun onCreate() {
        super.onCreate()
        notificationHelper = NotificationHelper(this)
    }
}
