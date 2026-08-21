package com.example.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class ReminderBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("EXTRA_TITLE") ?: "Recordatorio de Turno"
        val message = intent.getStringExtra("EXTRA_MESSAGE") ?: "Tiene una sesión programada en Equilibra Fisioterapia."
        val notificationId = intent.getIntExtra("EXTRA_NOTIFICATION_ID", (System.currentTimeMillis() % 100000).toInt())
        val patientName = intent.getStringExtra("EXTRA_PATIENT_NAME")
        val appointmentTime = intent.getStringExtra("EXTRA_APPOINTMENT_TIME")

        Log.d("ReminderReceiver", "Triggering admin reminder: $title")
        val notificationHelper = NotificationHelper(context)
        notificationHelper.showAdminReminderNotification(
            notificationId = notificationId,
            title = title,
            message = message,
            patientName = patientName,
            appointmentTime = appointmentTime
        )
    }
}
