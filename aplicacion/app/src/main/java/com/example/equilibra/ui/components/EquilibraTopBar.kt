package com.example.equilibra.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.equilibra.data.repository.EquilibraDataRepository
import com.example.equilibra.ui.theme.AmberAccent
import com.example.equilibra.ui.theme.AmberPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EquilibraTopBar(
    isDarkMode: Boolean,
    onToggleDarkMode: () -> Unit,
    savedAppointmentsCount: Int,
    onOpenMyAppointments: () -> Unit,
    onScrollToBooking: () -> Unit,
    onOpenSpecialistPortal: (() -> Unit)? = null
) {
    val context = LocalContext.current

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("equilibra_top_bar"),
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
        tonalElevation = 4.dp,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Brand Logo / Title
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(AmberPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Spa,
                        contentDescription = "Equilibra Logo",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                Column {
                    Text(
                        text = "EQUILIBRA",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.2.sp
                        ),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Fisioterapia & Bienestar",
                        style = MaterialTheme.typography.labelSmall,
                        color = AmberAccent
                    )
                }
            }

            // Actions Row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                if (onOpenSpecialistPortal != null) {
                    IconButton(
                        onClick = onOpenSpecialistPortal,
                        modifier = Modifier
                            .size(40.dp)
                            .testTag("admin_portal_button")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.AdminPanelSettings,
                            contentDescription = "Acceso Administrativo / Especialistas",
                            tint = AmberPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                // Call phone action
                IconButton(
                    onClick = {
                        val dialIntent = Intent(Intent.ACTION_DIAL).apply {
                            data = Uri.parse("tel:${EquilibraDataRepository.CLINIC_PHONE_RAW}")
                        }
                        context.startActivity(dialIntent)
                    },
                    modifier = Modifier
                        .size(40.dp)
                        .testTag("call_clinic_button")
                ) {
                    Icon(
                        imageVector = Icons.Filled.Phone,
                        contentDescription = "Llamar a la clínica",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Dark mode toggle
                IconButton(
                    onClick = onToggleDarkMode,
                    modifier = Modifier
                        .size(40.dp)
                        .testTag("theme_toggle_button")
                ) {
                    Icon(
                        imageVector = if (isDarkMode) Icons.Filled.LightMode else Icons.Filled.DarkMode,
                        contentDescription = "Cambiar tema",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // My Appointments badge button
                IconButton(
                    onClick = onOpenMyAppointments,
                    modifier = Modifier
                        .size(40.dp)
                        .testTag("my_appointments_button")
                ) {
                    BadgedBox(
                        badge = {
                            if (savedAppointmentsCount > 0) {
                                Badge(
                                    containerColor = AmberPrimary,
                                    contentColor = Color.White
                                ) {
                                    Text(text = savedAppointmentsCount.toString())
                                }
                            }
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.CalendarMonth,
                            contentDescription = "Mis citas",
                            tint = if (savedAppointmentsCount > 0) AmberPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}
