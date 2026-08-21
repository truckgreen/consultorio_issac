package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.AdminReminder
import kotlinx.coroutines.flow.Flow

@Dao
interface AdminReminderDao {
    @Query("SELECT * FROM admin_reminders ORDER BY scheduledEpochMillis DESC, createdAt DESC")
    fun getAllReminders(): Flow<List<AdminReminder>>

    @Query("SELECT * FROM admin_reminders WHERE isRead = 0 ORDER BY scheduledEpochMillis ASC")
    fun getUnreadReminders(): Flow<List<AdminReminder>>

    @Query("SELECT COUNT(*) FROM admin_reminders WHERE isRead = 0")
    fun getUnreadCount(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminder(reminder: AdminReminder): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminders(reminders: List<AdminReminder>)

    @Update
    suspend fun updateReminder(reminder: AdminReminder)

    @Delete
    suspend fun deleteReminder(reminder: AdminReminder)

    @Query("UPDATE admin_reminders SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: Long)

    @Query("UPDATE admin_reminders SET isRead = 1")
    suspend fun markAllAsRead()

    @Query("UPDATE admin_reminders SET isSent = 1 WHERE id = :id")
    suspend fun markAsSent(id: Long)

    @Query("DELETE FROM admin_reminders WHERE isRead = 1")
    suspend fun deleteReadReminders()
}
