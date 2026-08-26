package com.example.equilibra.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.equilibra.data.model.AdminNavTab
import com.example.equilibra.data.model.AuthUser
import com.example.equilibra.ui.theme.AmberAccent
import com.example.equilibra.ui.theme.AmberPrimary

@Composable
fun AdminBottomNav(
    currentUser: AuthUser?,
    activeTab: AdminNavTab,
    onSelectTab: (AdminNavTab) -> Unit,
    onOpenMoreMenu: () -> Unit,
    onOpenNewAppointment: () -> Unit,
    todayAppointmentsCount: Int,
    unreadMessagesCount: Int
) {
    val isMoreActive = activeTab in listOf(
        AdminNavTab.STAFF,
        AdminNavTab.SERVICIOS,
        AdminNavTab.MENSAJES,
        AdminNavTab.CONFIGURACION
    )

    Surface(
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp,
        shadowElevation = 16.dp,
        modifier = Modifier
            .fillMaxWidth()
            .testTag("admin_bottom_nav")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp)
                .navigationBarsPadding(),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 1. Dashboard
            BottomNavItem(
                icon = if (activeTab == AdminNavTab.DASHBOARD) Icons.Filled.Dashboard else Icons.Outlined.Dashboard,
                label = "Inicio",
                isSelected = activeTab == AdminNavTab.DASHBOARD,
                badgeCount = null,
                onClick = { onSelectTab(AdminNavTab.DASHBOARD) },
                testTag = "tab_dashboard"
            )

            // 2. Citas
            BottomNavItem(
                icon = if (activeTab == AdminNavTab.CITAS) Icons.Filled.CalendarMonth else Icons.Outlined.CalendarMonth,
                label = "Citas",
                isSelected = activeTab == AdminNavTab.CITAS,
                badgeCount = if (todayAppointmentsCount > 0) todayAppointmentsCount else null,
                onClick = { onSelectTab(AdminNavTab.CITAS) },
                testTag = "tab_citas"
            )

            // 3. Center FAB: Agendar
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .offset(y = (-14).dp)
                    .clickable { onOpenNewAppointment() }
                    .testTag("fab_bottom_agendar")
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .shadow(8.dp, CircleShape)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                colors = listOf(AmberPrimary, AmberAccent)
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = "Agendar Cita",
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Agendar",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp
                    ),
                    color = MaterialTheme.colorScheme.primary
                )
            }

            // 4. Pacientes
            BottomNavItem(
                icon = if (activeTab == AdminNavTab.PACIENTES) Icons.Filled.People else Icons.Outlined.People,
                label = "Pacientes",
                isSelected = activeTab == AdminNavTab.PACIENTES,
                badgeCount = null,
                onClick = { onSelectTab(AdminNavTab.PACIENTES) },
                testTag = "tab_pacientes"
            )

            // 5. Más
            BottomNavItem(
                icon = if (isMoreActive) Icons.Filled.GridView else Icons.Outlined.GridView,
                label = when (activeTab) {
                    AdminNavTab.STAFF -> "Staff"
                    AdminNavTab.SERVICIOS -> "Tarifas"
                    AdminNavTab.MENSAJES -> "Leads"
                    AdminNavTab.CONFIGURACION -> "Ajustes"
                    else -> "Más"
                },
                isSelected = isMoreActive,
                badgeCount = if (unreadMessagesCount > 0) unreadMessagesCount else null,
                onClick = onOpenMoreMenu,
                testTag = "tab_more"
            )
        }
    }
}

@Composable
private fun BottomNavItem(
    icon: ImageVector,
    label: String,
    isSelected: Boolean,
    badgeCount: Int?,
    onClick: () -> Unit,
    testTag: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .testTag(testTag)
    ) {
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(10.dp))
                .background(
                    if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
                )
                .padding(horizontal = 10.dp, vertical = 4.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(22.dp)
            )

            if (badgeCount != null && badgeCount > 0) {
                Box(
                    modifier = Modifier
                        .offset(x = 10.dp, y = (-6).dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary)
                        .padding(horizontal = 5.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = if (badgeCount > 9) "9+" else badgeCount.toString(),
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                fontSize = 11.sp
            ),
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
