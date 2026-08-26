package com.example.equilibra.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.LightMode
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.equilibra.data.model.AuthUser
import com.example.equilibra.ui.theme.AmberPrimary
import com.example.equilibra.ui.theme.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminTopBar(
    currentUser: AuthUser?,
    isDarkMode: Boolean,
    onToggleDarkMode: () -> Unit,
    unreadNotificationsCount: Int,
    onOpenNotifications: () -> Unit,
    onOpenNewAppointment: () -> Unit,
    onLogout: () -> Unit,
    onNavigateToPatientPortal: (() -> Unit)? = null
) {
    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "E",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 19.sp
                    )
                }

                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "EQUILIBRA",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            ),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        if (currentUser?.isSuperAdmin == true) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(0xFFE11D48).copy(alpha = 0.15f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "ADMIN",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    ),
                                    color = Color(0xFFE11D48)
                                )
                            }
                        }
                    }
                    Text(
                        text = if (currentUser?.isSuperAdmin == true) "Dirección Clínica" else currentUser?.specialty ?: "Especialista",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        ),
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        },
        actions = {
            IconButton(
                onClick = onLogout,
                modifier = Modifier.testTag("admin_logout_btn")
            ) {
                Icon(
                    imageVector = Icons.Filled.Logout,
                    contentDescription = "Cerrar Sesión",
                    tint = Color(0xFFEF4444).copy(alpha = 0.8f)
                )
            }

            if (onNavigateToPatientPortal != null) {
                IconButton(
                    onClick = onNavigateToPatientPortal,
                    modifier = Modifier.testTag("admin_switch_to_portal_btn")
                ) {
                    Icon(
                        imageVector = Icons.Filled.Public,
                        contentDescription = "Ir al Portal de Pacientes",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }

            // Dark mode toggle
            IconButton(
                onClick = onToggleDarkMode,
                modifier = Modifier.testTag("admin_theme_toggle")
            ) {
                Icon(
                    imageVector = if (isDarkMode) Icons.Outlined.LightMode else Icons.Outlined.DarkMode,
                    contentDescription = "Cambiar tema",
                    tint = if (isDarkMode) AmberPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Notifications
            IconButton(
                onClick = onOpenNotifications,
                modifier = Modifier.testTag("admin_notifications_btn")
            ) {
                Box {
                    Icon(
                        imageVector = Icons.Outlined.Notifications,
                        contentDescription = "Notificaciones",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    if (unreadNotificationsCount > 0) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEF4444))
                                .align(Alignment.TopEnd)
                        )
                    }
                }
            }

            // Quick New Appointment Mini Button
            FilledTonalButton(
                onClick = onOpenNewAppointment,
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .padding(end = 8.dp)
                    .testTag("admin_top_new_appointment_btn")
            ) {
                Icon(
                    imageVector = Icons.Filled.Add,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Cita",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        modifier = Modifier.testTag("admin_top_bar")
    )
}
